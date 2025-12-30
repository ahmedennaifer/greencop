import os
import json
import logging
import pickle
from datetime import datetime
import pandas as pd
from google.cloud import bigquery, storage, pubsub_v1
from sqlalchemy import create_engine
from sklearn.ensemble import IsolationForest
import functions_framework

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")
DB_URL = os.environ.get("DB_URL")
MODEL_BUCKET = os.environ.get("MODEL_BUCKET")
REGION = os.environ.get("REGION", "us-central1")


def fetch_training_data():
    from sqlalchemy import text

    # Fetch validated predictions from PostgreSQL
    engine = create_engine(DB_URL)

    validated_query = text("""
        SELECT
            sensor_id as node_id,
            timestamp,
            actual_temp as temperature,
            actual_humidity as humidity,
            CASE WHEN anomaly_predicted THEN -1 ELSE 1 END as label
        FROM prediction_feedback
        WHERE feedback = 'ok'
        ORDER BY created_at DESC
    """)

    with engine.connect() as conn:
        df_validated = pd.read_sql(validated_query, conn)

    # Fetch historical sensor data from BigQuery
    client = bigquery.Client(project=PROJECT_ID)
    historical_query = f"""
        SELECT
            node_id,
            timestamp,
            temperature,
            humidity
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        ORDER BY timestamp DESC
        LIMIT 5000
    """

    df_historical = client.query(historical_query).to_dataframe()

    logger.info(f"Fetched {len(df_validated)} validated rows, {len(df_historical)} historical rows")

    if 'label' not in df_historical.columns:
        df_historical['label'] = None

    df = pd.concat([df_validated, df_historical], ignore_index=True)

    if len(df) < 500:
        raise ValueError(f"Insufficient data: {len(df)} rows (minimum 500 required)")

    return df, len(df_validated)


def fetch_false_positives():
    if not DB_URL:
        return set()

    engine = create_engine(DB_URL)
    from sqlalchemy import text

    query = text("""
        SELECT sensor_id, timestamp
        FROM alerts
        WHERE feedback = 'false_positive'
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        fps = {(row[0], row[1]) for row in result}

    logger.info(f"Found {len(fps)} false positives to exclude")
    return fps


def exclude_false_positives(df, fps):
    if not fps:
        return df

    mask = df.apply(lambda row: (row["node_id"], row["timestamp"]) not in fps, axis=1)
    filtered_df = df[mask]

    logger.info(f"Excluded {len(df) - len(filtered_df)} false positive records")
    return filtered_df


def engineer_features(df):
    df = df.sort_values(["node_id", "timestamp"])

    df["hour_of_day"] = pd.to_datetime(df["timestamp"]).dt.hour
    df["day_of_week"] = pd.to_datetime(df["timestamp"]).dt.dayofweek

    df["temp_delta"] = df.groupby("node_id")["temperature"].diff().fillna(0)
    df["humidity_delta"] = df.groupby("node_id")["humidity"].diff().fillna(0)

    df["temp_rolling_mean_6h"] = df.groupby("node_id")["temperature"].transform(
        lambda x: x.rolling(window=6, min_periods=1).mean()
    )
    df["humidity_rolling_mean_6h"] = df.groupby("node_id")["humidity"].transform(
        lambda x: x.rolling(window=6, min_periods=1).mean()
    )

    return df


def train_model(df):
    features = [
        "temperature",
        "humidity",
        "hour_of_day",
        "day_of_week",
        "temp_delta",
        "humidity_delta",
        "temp_rolling_mean_6h",
        "humidity_rolling_mean_6h",
    ]

    from sklearn.model_selection import train_test_split
    from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score

    X = df[features]
    y = df['label'] if 'label' in df.columns else None

    # Filter out rows with None labels for evaluation
    if y is not None and y.notna().sum() > 100:
        mask = y.notna() & y.isin([-1, 1])
        X_labeled = X[mask]
        y_labeled = y[mask]
        X_train, X_test, y_train, y_test = train_test_split(X_labeled, y_labeled, test_size=0.2, random_state=42)
        # Train on all data including unlabeled
        X_train_full = X
    else:
        X_train_full = X
        X_test = None
        y_test = None

    model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
    model.fit(X_train_full)

    metrics = {}
    if X_test is not None and y_test is not None:
        y_pred = model.predict(X_test)

        y_test = y_test.astype(int)
        y_pred = y_pred.astype(int)

        precision = precision_score(y_test, y_pred, pos_label=-1, zero_division=0)
        recall = recall_score(y_test, y_pred, pos_label=-1, zero_division=0)
        f1 = f1_score(y_test, y_pred, pos_label=-1, zero_division=0)
        accuracy = accuracy_score(y_test, y_pred)

        metrics = {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'accuracy': accuracy
        }

        logger.info(f"Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}, Accuracy: {accuracy:.4f}")

    logger.info("Model training completed")
    return model, features, metrics


def save_model(model, features, num_samples, metrics=None, model_type="anomaly"):
    storage_client = storage.Client()
    bucket = storage_client.bucket(MODEL_BUCKET)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_filename = f"{model_type}_model_v{timestamp}.joblib"

    local_path = f"/tmp/{model_filename}"
    with open(local_path, "wb") as f:
        pickle.dump(model, f, protocol=4)

    blob = bucket.blob(f"models/{model_filename}")
    blob.upload_from_filename(local_path)

    metadata = {
        "timestamp": timestamp,
        "num_samples": num_samples,
        "features": features,
        "model_type": model_type,
        "contamination": 0.05 if model_type == "anomaly" else None,
        "metrics": metrics or {}
    }

    metadata_blob = bucket.blob(f"models/metadata_{model_type}_{timestamp}.json")
    metadata_blob.upload_from_string(json.dumps(metadata))

    latest_blob = bucket.blob(f"models/latest_{model_type}_model.txt")
    latest_blob.upload_from_string(model_filename)

    logger.info(f"Model saved to gs://{MODEL_BUCKET}/models/{model_filename}")

    return model_filename


def cleanup_old_models(bucket, model_type="anomaly"):
    blobs = list(bucket.list_blobs(prefix=f"models/{model_type}_model_v"))
    blobs.sort(key=lambda x: x.time_created, reverse=True)

    for blob in blobs[7:]:
        blob.delete()
        logger.info(f"Deleted old model: {blob.name}")


def trigger_deployment():
    publisher = pubsub_v1.PublisherClient()
    topic_path = f"projects/{PROJECT_ID}/topics/ml-deployment-trigger"

    try:
        future = publisher.publish(topic_path, b"deploy")
        future.result()
        logger.info("Triggered model deployment")
    except Exception as e:
        logger.error(f"Failed to trigger deployment: {e}")


def update_training_run(run_id, status=None, completed_at=None, training_data_count=None,
                        validated_data_count=None, metrics=None, model_version=None, error_message=None):
    if not DB_URL:
        logger.warning("DB_URL not set, skipping training run update")
        return

    engine = create_engine(DB_URL)
    from sqlalchemy import text

    updates = []
    params = {"run_id": run_id}

    if status:
        updates.append("status = :status")
        params["status"] = status
    if completed_at:
        updates.append("completed_at = :completed_at")
        params["completed_at"] = completed_at
    if training_data_count is not None:
        updates.append("training_data_count = :training_data_count")
        params["training_data_count"] = training_data_count
    if validated_data_count is not None:
        updates.append("validated_data_count = :validated_data_count")
        params["validated_data_count"] = validated_data_count
    if metrics:
        updates.append("metrics = :metrics")
        params["metrics"] = json.dumps(metrics)
    if model_version:
        updates.append("model_version = :model_version")
        params["model_version"] = model_version
    if error_message:
        updates.append("error_message = :error_message")
        params["error_message"] = error_message

    if status == 'completed' and not completed_at:
        updates.append("completed_at = NOW()")

    if updates:
        query = text(f"UPDATE model_training_runs SET {', '.join(updates)} WHERE id = :run_id")
        with engine.connect() as conn:
            conn.execute(query, params)
            conn.commit()
        logger.info(f"Updated training run {run_id}")


def mark_predictions_as_used(run_id):
    if not DB_URL:
        logger.warning("DB_URL not set, skipping predictions update")
        return

    engine = create_engine(DB_URL)
    from sqlalchemy import text

    query = text("""
        UPDATE prediction_feedback
        SET used_in_training = true, training_run_id = :run_id
        WHERE feedback = 'ok' AND used_in_training = false
    """)

    with engine.connect() as conn:
        result = conn.execute(query, {"run_id": run_id})
        conn.commit()
        logger.info(f"Marked {result.rowcount} predictions as used in training run {run_id}")


@functions_framework.cloud_event
def train_model_handler(cloud_event):
    try:
        import base64

        training_run_id = None
        validated_count = 0
        triggered_by = None

        if cloud_event and cloud_event.data:
            message_data = json.loads(base64.b64decode(cloud_event.data['message']['data']).decode())
            training_run_id = message_data.get('training_run_id')
            validated_count = message_data.get('validated_count', 0)
            triggered_by = message_data.get('trigger')
            logger.info(f"Received training request for run {training_run_id} with {validated_count} validated predictions (trigger: {triggered_by})")

        # Use real data if triggered automatically by validations, otherwise use synthetic
        use_synthetic = triggered_by != 'auto_100_validated'

        if use_synthetic:
            storage_client = storage.Client()
            bucket = storage_client.bucket(MODEL_BUCKET)
            blob = bucket.blob('training_data/sensor_data_7days.csv')
            blob.download_to_filename('/tmp/training_data.csv')

            df = pd.read_csv('/tmp/training_data.csv')
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.rename(columns={'temp_rolling_mean': 'temp_rolling_mean_6h', 'humidity_rolling_mean': 'humidity_rolling_mean_6h'})
            validated_count = 0
        else:
            df, validated_count = fetch_training_data()
            fps = fetch_false_positives()
            df = exclude_false_positives(df, fps)
            df = engineer_features(df)

        # Train anomaly detection model
        anomaly_model, features, anomaly_metrics = train_model(df)
        anomaly_filename = save_model(anomaly_model, features, len(df), anomaly_metrics, model_type="anomaly")

        # Train forecasting model
        from train_forecasting import train_forecasting_model
        forecasting_model, forecasting_features, forecasting_metrics = train_forecasting_model(df)
        forecasting_filename = save_model(forecasting_model, forecasting_features, len(df), forecasting_metrics, model_type="forecasting")

        # Combine metrics
        combined_metrics = {
            'anomaly': anomaly_metrics,
            'forecasting': forecasting_metrics
        }

        if training_run_id:
            update_training_run(
                training_run_id,
                status='completed',
                training_data_count=len(df),
                metrics=combined_metrics,
                model_version=f"{anomaly_filename}, {forecasting_filename}"
            )
            mark_predictions_as_used(training_run_id)

        trigger_deployment()

        return {"status": "success", "anomaly_model": anomaly_filename, "forecasting_model": forecasting_filename, "metrics": combined_metrics}

    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        if training_run_id:
            update_training_run(training_run_id, status='failed', error_message=str(e))
        raise


if __name__ == "__main__":
    train_model_handler(None)

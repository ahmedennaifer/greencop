import os
import json
import base64
import logging
import pickle
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import joblib
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
    client = bigquery.Client(project=PROJECT_ID)

    query = f"""
        SELECT
            node_id,
            timestamp,
            temperature,
            humidity
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        ORDER BY timestamp DESC
        LIMIT 5000
    """

    df = client.query(query).to_dataframe()

    if len(df) < 500:
        raise ValueError(f"Insufficient data: {len(df)} rows (minimum 500 required)")

    logger.info(f"Fetched {len(df)} rows from BigQuery")
    return df


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

    mask = df.apply(lambda row: (row['node_id'], row['timestamp']) not in fps, axis=1)
    filtered_df = df[mask]

    logger.info(f"Excluded {len(df) - len(filtered_df)} false positive records")
    return filtered_df


def engineer_features(df):
    df = df.sort_values(['node_id', 'timestamp'])

    df['hour_of_day'] = pd.to_datetime(df['timestamp']).dt.hour
    df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek

    df['temp_delta'] = df.groupby('node_id')['temperature'].diff().fillna(0)
    df['humidity_delta'] = df.groupby('node_id')['humidity'].diff().fillna(0)

    df['temp_rolling_mean_6h'] = df.groupby('node_id')['temperature'].transform(
        lambda x: x.rolling(window=6, min_periods=1).mean()
    )
    df['humidity_rolling_mean_6h'] = df.groupby('node_id')['humidity'].transform(
        lambda x: x.rolling(window=6, min_periods=1).mean()
    )

    return df


def train_model(df):
    features = [
        'temperature',
        'humidity',
        'hour_of_day',
        'day_of_week',
        'temp_delta',
        'humidity_delta',
        'temp_rolling_mean_6h',
        'humidity_rolling_mean_6h'
    ]

    X = df[features]

    model = IsolationForest(
        contamination=0.01,
        random_state=42,
        n_estimators=100
    )

    model.fit(X)

    logger.info("Model training completed")
    return model, features


def save_model(model, features, num_samples):
    storage_client = storage.Client()
    bucket = storage_client.bucket(MODEL_BUCKET)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    model_filename = f"model_v{timestamp}.joblib"

    local_path = f"/tmp/{model_filename}"
    with open(local_path, 'wb') as f:
        pickle.dump(model, f, protocol=4)

    blob = bucket.blob(f"models/{model_filename}")
    blob.upload_from_filename(local_path)

    metadata = {
        "timestamp": timestamp,
        "num_samples": num_samples,
        "features": features,
        "contamination": 0.01
    }

    metadata_blob = bucket.blob(f"models/metadata_{timestamp}.json")
    metadata_blob.upload_from_string(json.dumps(metadata))

    latest_blob = bucket.blob("models/latest_model.txt")
    latest_blob.upload_from_string(model_filename)

    logger.info(f"Model saved to gs://{MODEL_BUCKET}/models/{model_filename}")

    cleanup_old_models(bucket)

    return model_filename


def cleanup_old_models(bucket):
    blobs = list(bucket.list_blobs(prefix="models/model_v"))
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


@functions_framework.cloud_event
def train_model_handler(cloud_event):
    try:
        df = fetch_training_data()

        fps = fetch_false_positives()
        df = exclude_false_positives(df, fps)

        df = engineer_features(df)

        model, features = train_model(df)

        model_filename = save_model(model, features, len(df))

        trigger_deployment()

        return {"status": "success", "model": model_filename}

    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise


if __name__ == "__main__":
    train_model_handler(None)

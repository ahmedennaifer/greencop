import base64
import json
import os
import logging
from datetime import datetime, timedelta
import numpy as np
import functions_framework
from google.cloud import pubsub_v1, aiplatform, bigquery
from typing import Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
MAX_ALLOWED_TEMP = float(os.environ.get("MAX_ALLOWED_TEMP", 50.0))
MAX_ALLOWED_HUMIDITY = float(os.environ.get("MAX_ALLOWED_HUMIDITY", 40.0))
ALERT_TOPIC = os.environ.get("ALERT_TOPIC", "alerts")
ML_PREDICT_URL = os.environ.get("ML_PREDICT_URL")
ML_FORECAST_URL = os.environ.get("ML_FORECAST_URL")
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")
DB_URL = os.environ.get("DB_URL")
CUSTOMERS_API_URL = os.environ.get("CUSTOMERS_API_URL")


def fetch_recent_sensor_data(node_id, hours=6):
    try:
        client = bigquery.Client(project=PROJECT_ID)

        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()

        query = f"""
            SELECT temperature, humidity, timestamp
            FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
            WHERE node_id = @node_id
            AND timestamp >= @cutoff_time
            ORDER BY timestamp ASC
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("node_id", "STRING", node_id),
                bigquery.ScalarQueryParameter("cutoff_time", "TIMESTAMP", cutoff_time)
            ]
        )

        results = client.query(query, job_config=job_config).result()

        data = []
        for row in results:
            data.append({
                'temperature': row.temperature,
                'humidity': row.humidity,
                'timestamp': row.timestamp
            })

        return data
    except Exception as e:
        logger.error(f"Failed to fetch historical data: {e}")
        return []


def engineer_features(sensor_data, historical_data):
    ts = datetime.fromisoformat(sensor_data['timestamp'].replace('Z', '+00:00'))

    temp_delta = 0.0
    humidity_delta = 0.0
    if historical_data:
        last = historical_data[-1]
        temp_delta = sensor_data['temperature'] - last['temperature']
        humidity_delta = sensor_data['humidity'] - last['humidity']

    temp_rolling_mean = sensor_data['temperature']
    humidity_rolling_mean = sensor_data['humidity']

    if len(historical_data) >= 6:
        recent_temps = [r['temperature'] for r in historical_data[-6:]]
        recent_humidity = [r['humidity'] for r in historical_data[-6:]]
        temp_rolling_mean = np.mean(recent_temps)
        humidity_rolling_mean = np.mean(recent_humidity)

    return [
        sensor_data['temperature'],
        sensor_data['humidity'],
        ts.hour,
        ts.weekday(),
        temp_delta,
        humidity_delta,
        temp_rolling_mean,
        humidity_rolling_mean
    ]


@functions_framework.cloud_event
def detect_excessive_metrics(cloud_event):
    try:
        if "message" in cloud_event.data:
            pubsub_message = cloud_event.data["message"]

            if "data" in pubsub_message:
                message_data = base64.b64decode(pubsub_message["data"]).decode("utf-8")
                sensor_data = json.loads(message_data)

                logger.info(f"Received sensor data: {sensor_data}")

                threshold_exceeded = (
                    sensor_data["temperature"] > MAX_ALLOWED_TEMP
                    or sensor_data["humidity"] > MAX_ALLOWED_HUMIDITY
                )

                if threshold_exceeded:
                    logger.warning(
                        f"Threshold exceeded: temp={sensor_data['temperature']} humidity={sensor_data['humidity']}"
                    )
                    publish_alert(sensor_data, "threshold")

                prediction = None
                forecast_temp = sensor_data['temperature']
                forecast_humidity = sensor_data['humidity']

                if ML_PREDICT_URL:
                    try:
                        import requests

                        historical_data = fetch_recent_sensor_data(sensor_data['node_id'], hours=6)

                        features = engineer_features(sensor_data, historical_data)

                        response = requests.post(
                            f"{ML_PREDICT_URL}/predict",
                            json={"instances": [features]},
                            timeout=5
                        )
                        response.raise_for_status()

                        data = response.json()
                        if "predictions" in data and data["predictions"]:
                            prediction = data["predictions"][0]

                            if prediction == -1:
                                logger.warning(f"Anomaly detected by ML model")
                                publish_alert(sensor_data, "ml_anomaly")

                                publisher_notif = pubsub_v1.PublisherClient()
                                topic_path_notif = f"projects/{PROJECT_ID}/topics/anomaly-events"
                                anomaly_message = {
                                    "event_type": "anomaly",
                                    "data": {
                                        "sensor_id": sensor_data.get('node_id'),
                                        "temperature": sensor_data.get('temperature'),
                                        "humidity": sensor_data.get('humidity'),
                                        "timestamp": sensor_data.get('timestamp')
                                    }
                                }
                                publisher_notif.publish(topic_path_notif, json.dumps(anomaly_message).encode())
                                logger.info(f"Published anomaly notification for sensor {sensor_data.get('node_id')}")
                        else:
                            logger.error(f"ML service response missing predictions")
                            prediction = 1

                        if "forecasts" in data and data["forecasts"]:
                            forecast = data["forecasts"][0]
                            forecast_temp = forecast[0]
                            forecast_humidity = forecast[1]

                    except requests.exceptions.RequestException as e:
                        logger.error(f"ML prediction request failed: {e}")
                        prediction = 1
                    except ValueError as e:
                        logger.error(f"ML prediction JSON parse failed: {e}")
                        prediction = 1
                    except Exception as e:
                        logger.error(f"ML prediction failed: {e}")
                        prediction = 1

                if CUSTOMERS_API_URL:
                    try:
                        import requests

                        current_ts = datetime.fromisoformat(sensor_data['timestamp'].replace('Z', '+00:00'))
                        search_start = (current_ts - timedelta(seconds=2)).isoformat().replace('+00:00', 'Z')
                        search_end = (current_ts + timedelta(seconds=2)).isoformat().replace('+00:00', 'Z')

                        try:
                            search_response = requests.get(
                                f"{CUSTOMERS_API_URL}/api/v1/prediction-feedback/search",
                                params={
                                    "sensor_id": sensor_data['node_id'],
                                    "start_date": search_start,
                                    "end_date": search_end
                                },
                                timeout=5
                            )

                            if search_response.status_code == 200:
                                predictions = search_response.json()
                                for pred in predictions:
                                    if pred.get('actual_temp') == 0.0:
                                        update_payload = {
                                            "actual_temp": float(sensor_data['temperature']),
                                            "actual_humidity": float(sensor_data['humidity'])
                                        }
                                        update_response = requests.put(
                                            f"{CUSTOMERS_API_URL}/api/v1/prediction-feedback/{pred['id']}",
                                            json=update_payload,
                                            timeout=5
                                        )
                                        if update_response.status_code == 200:
                                            logger.info(f"Updated prediction {pred['id']} with actual values")
                        except Exception as e:
                            logger.error(f"Failed to update predictions: {e}")

                        future_ts = current_ts + timedelta(seconds=10)
                        create_payload = {
                            "sensor_id": sensor_data['node_id'],
                            "timestamp": future_ts.isoformat().replace('+00:00', 'Z'),
                            "predicted_temp": float(forecast_temp),
                            "predicted_humidity": float(forecast_humidity),
                            "actual_temp": 0.0,
                            "actual_humidity": 0.0,
                            "anomaly_predicted": prediction == -1
                        }
                        create_response = requests.post(
                            f"{CUSTOMERS_API_URL}/api/v1/prediction-feedback/",
                            json=create_payload,
                            timeout=5
                        )
                        create_response.raise_for_status()
                        logger.info(f"Created prediction for {sensor_data['node_id']} at {future_ts.isoformat()}")
                    except Exception as e:
                        logger.error(f"Failed to manage prediction feedback: {e}")

                # Insert sensor data with prediction to BigQuery
                try:
                    from google.cloud import bigquery
                    bq_client = bigquery.Client(project=PROJECT_ID)
                    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"

                    row = {
                        "node_id": sensor_data['node_id'],
                        "message_id": sensor_data.get('message_id', ''),
                        "timestamp": sensor_data['timestamp'],
                        "temperature": sensor_data['temperature'],
                        "humidity": sensor_data['humidity'],
                        "prediction": prediction
                    }

                    errors = bq_client.insert_rows_json(table_ref, [row])
                    if errors:
                        logger.error(f"Failed to insert to BigQuery: {errors}")
                except Exception as e:
                    logger.error(f"Failed to write to BigQuery: {e}")

                return "OK"
            else:
                logger.error("No data field in Pub/Sub message")
                return "ERROR: No data field"
        else:
            logger.error("No message field in cloud event data")
            return "ERROR: No message field"

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return f"ERROR: {str(e)}"


def publish_alert(sensor_data: dict[str, Any], alert_source: str):
    publisher = pubsub_v1.PublisherClient()
    topic_name = "projects/{project_id}/topics/{topic}".format(
        project_id=PROJECT_ID, topic=ALERT_TOPIC
    )

    sensor_data['alert_source'] = alert_source

    try:
        message_bytes = json.dumps(sensor_data).encode('utf-8')
        future = publisher.publish(topic_name, message_bytes)
        future.result()
        logger.info(f"Published alert to topic: source={alert_source}")
    except Exception as e:
        raise ValueError(f"Failed to publish alert: {e}") from e

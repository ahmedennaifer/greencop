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
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")


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

                        predictions = response.json()["predictions"]

                        if predictions[0] == -1:
                            logger.warning(f"Anomaly detected by ML model")
                            publish_alert(sensor_data, "ml_anomaly")

                    except Exception as e:
                        logger.error(f"ML prediction failed: {e}")

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

import base64
import json
import os
import logging
import functions_framework
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_URL = os.environ.get("API_URL", "https://customers-api-url.run.app")


@functions_framework.cloud_event
def store_alert(cloud_event):
    try:
        if "message" in cloud_event.data:
            pubsub_message = cloud_event.data["message"]

            if "data" in pubsub_message:
                message_data = base64.b64decode(pubsub_message["data"]).decode("utf-8")
                sensor_data = json.loads(message_data)

                logger.info(f"Received alert for sensor: {sensor_data}")

                alert_source = sensor_data.get("alert_source", "threshold")
                temp = float(sensor_data.get("temperature", 0))
                humidity = float(sensor_data.get("humidity", 0))

                alert_type = None
                message = None

                if alert_source == "threshold":
                    if temp > 50.0:
                        alert_type = "temperature"
                        message = f"High temperature detected: {temp}°C (threshold exceeded)"
                    elif humidity > 40.0:
                        alert_type = "humidity"
                        message = f"High humidity detected: {humidity}% (threshold exceeded)"
                elif alert_source == "ml_anomaly":
                    alert_type = "anomaly"
                    message = f"Anomaly detected: temp={temp}°C, humidity={humidity}% (ML prediction)"

                if alert_type and message:
                    alert_data = {
                        "sensor_id": str(sensor_data["node_id"]),
                        "alert_type": alert_type,
                        "message": message,
                        "timestamp": sensor_data.get("timestamp", datetime.utcnow().isoformat()),
                        "acknowledged": False
                    }

                    store_alert_to_db(alert_data)

                logger.info("Successfully processed alert")
                return "OK"
            else:
                logger.error("No data field in Pub/Sub message")
                return "ERROR: No data field"
        else:
            logger.error("No message field in cloud event data")
            return "ERROR: No message field"

    except Exception as e:
        logger.error(f"Error processing alert: {str(e)}")
        return f"ERROR: {str(e)}"


def store_alert_to_db(alert_data: dict):
    """Store alert directly to database"""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    db_url = os.environ.get("DB_URL")
    if not db_url:
        logger.error("DB_URL not set")
        return

    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO alerts (sensor_id, alert_type, message, timestamp, acknowledged)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                alert_data["sensor_id"],
                alert_data["alert_type"],
                alert_data["message"],
                alert_data["timestamp"],
                alert_data["acknowledged"]
            )
        )

        conn.commit()
        cursor.close()
        conn.close()

        logger.info(f"Stored alert to database: {alert_data}")
    except Exception as e:
        logger.error(f"Failed to store alert to database: {e}")
        raise

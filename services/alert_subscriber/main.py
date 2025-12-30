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

        check_alert_surge(alert_data["sensor_id"], db_url)
    except Exception as e:
        logger.error(f"Failed to store alert to database: {e}")
        raise


def check_alert_surge(sensor_id, db_url):
    """Check if 5+ alerts in last 10 minutes"""
    import psycopg2
    from datetime import datetime, timedelta
    from google.cloud import pubsub_v1

    logger.info(f"Checking surge for sensor {sensor_id}")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        ten_min_ago = datetime.utcnow() - timedelta(minutes=10)

        cur.execute("""
            SELECT COUNT(*)
            FROM alerts
            WHERE sensor_id = %s
              AND timestamp > %s
        """, (sensor_id, ten_min_ago))

        count = cur.fetchone()[0]
        conn.close()

        logger.info(f"Found {count} alerts in last 10 minutes for sensor {sensor_id}")

        if count >= 5:
            logger.warning(f"SURGE DETECTED for {sensor_id}: {count} alerts")
            PROJECT_ID = os.environ.get("PROJECT_ID", "atomic-climate-482314-q7")
            publisher = pubsub_v1.PublisherClient()
            topic_path = f"projects/{PROJECT_ID}/topics/alert-surge-events"

            message = {
                "event_type": "alert_surge",
                "data": {
                    "sensor_id": sensor_id,
                    "alert_count": count,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }

            publisher.publish(topic_path, json.dumps(message).encode())
            logger.info(f"Published alert surge notification for sensor {sensor_id}: {count} alerts")
    except Exception as e:
        logger.error(f"Failed to check alert surge: {e}")

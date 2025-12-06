"""
every sent event
check if temp/humidity is more than a threshhold
"""

import base64
import json
import os
import logging
import functions_framework
from google.cloud import pubsub_v1
from typing import Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")
MAX_ALLOWED_TEMP = 50.0
MAX_ALLOWED_HUMIDITY = 40.0
ALERT_TOPIC = os.environ.get("ALERT_TOPIC", "alerts")


@functions_framework.cloud_event
def detect_excessive_metrics(cloud_event):
    try:
        if "message" in cloud_event.data:
            pubsub_message = cloud_event.data["message"]

            if "data" in pubsub_message:
                message_data = base64.b64decode(pubsub_message["data"]).decode("utf-8")
                sensor_data = json.loads(message_data)

                logger.info(f"Received sensor data: {sensor_data}")
                if (
                    float(sensor_data["temperature"]) > MAX_ALLOWED_TEMP
                    or float(sensor_data["humidity"]) > MAX_ALLOWED_HUMIDITY
                ):
                    logger.warning(
                        f"Sensor data exceed max temp or humidity: temp{sensor_data['temperature']} humidity {sensor_data['humidity']}"
                    )
                    publish_alert(sensor_data)
                logger.info("Successfully wrote data to BigQuery")
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


def publish_alert(sensor_data: dict[str, Any]):
    publisher = pubsub_v1.PublisherClient()
    topic_name = "projects/{project_id}/topics/{topic}".format(
        project_id=PROJECT_ID, topic=ALERT_TOPIC
    )
    try:
        message_bytes = json.dumps(sensor_data).encode("utf-8")
        future = publisher.publish(topic_name, message_bytes)
        future.result()
        logger.info(f"Published {sensor_data} to alerts topic with sucess")
    except Exception as e:
        raise ValueError(f"Failed to publish {sensor_data} : {e}") from e

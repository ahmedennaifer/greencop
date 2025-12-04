import base64
import json
import os
import logging
import functions_framework
from google.cloud import bigquery

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")


@functions_framework.cloud_event
def pubsub_to_bigquery(cloud_event):
    try:
        if "message" in cloud_event.data:
            pubsub_message = cloud_event.data["message"]

            if "data" in pubsub_message:
                message_data = base64.b64decode(pubsub_message["data"]).decode("utf-8")
                sensor_data = json.loads(message_data)

                logger.info(f"Received sensor data: {sensor_data}")

                write_to_bigquery(sensor_data)

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


def write_to_bigquery(sensor_data):
    try:
        client = bigquery.Client(project=PROJECT_ID)

        table_ref = client.dataset(DATASET_ID).table(TABLE_ID)
        table = client.get_table(table_ref)

        timestamp_str = sensor_data["timestamp"]
        if timestamp_str.endswith("+01:00"):
            timestamp_str = timestamp_str.replace("+01:00", "Z")

        row = {
            "node_id": sensor_data.get("node_id"),
            "message_id": sensor_data.get("message_id"),
            "timestamp": sensor_data.get("timestamp"),
            "temperature": float(sensor_data.get("temperature", 0)),
            "humidity": float(sensor_data.get("humidity", 0)),
        }

        errors = client.insert_rows_json(table, [row])

        if errors:
            logger.error(f"Failed to insert row: {errors}")
            raise Exception(f"BigQuery insert failed: {errors}")
        else:
            logger.info(f"Inserted row for sensor {sensor_data.get('sensor_id')}")

    except Exception as e:
        logger.error(f"Failed to write to BigQuery: {str(e)}")
        raise

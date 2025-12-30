from fastapi import FastAPI, Request
import json
import os
import logging
import base64
from email_sender import send_email
from webhook_sender import send_webhook
import psycopg2

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_URL = os.environ.get('DB_URL')


@app.post("/")
async def handle_notification(request: Request):
    envelope = await request.json()
    logger.info(f"Received envelope: {envelope}")

    pubsub_message = envelope.get('message', {})
    data_b64 = pubsub_message.get('data', '')
    logger.info(f"Data base64: {data_b64}")

    data = json.loads(base64.b64decode(data_b64).decode('utf-8'))
    logger.info(f"Decoded data: {data}")
    event_type = data.get('event_type')

    if not event_type:
        logger.info("No event_type in message, skipping notification")
        return {"status": "skipped"}

    event_data = data.get('data', data)

    logger.info(f"Received event: {event_type}, full data: {data}")

    users = get_notification_recipients(event_type)
    logger.info(f"Found {len(users)} users to notify for event {event_type}")

    for user in users:
        if user['email_enabled'] and user['email']:
            try:
                send_email(user['email'], event_type, event_data)
                log_notification(user['user_id'], event_type, 'email', 'sent')
            except Exception as e:
                logger.error(f"Email failed: {e}")
                log_notification(user['user_id'], event_type, 'email', 'failed', str(e))

        if user['webhook_enabled'] and user['webhook_url']:
            try:
                send_webhook(user['webhook_url'], event_type, event_data)
                log_notification(user['user_id'], event_type, 'webhook', 'sent')
            except Exception as e:
                logger.error(f"Webhook failed: {e}")
                log_notification(user['user_id'], event_type, 'webhook', 'failed', str(e))

    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


def get_notification_recipients(event_type):
    if not DB_URL:
        return []

    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        column_map = {
            'training_start': 'notify_training_start',
            'training_complete': 'notify_training_complete',
            'anomaly': 'notify_anomaly',
            'alert_surge': 'notify_alert_surge'
        }

        column = column_map.get(event_type)
        if not column:
            return []

        cur.execute(f"""
            SELECT user_id, email, webhook_url, email_enabled, webhook_enabled
            FROM notification_settings
            WHERE {column} = true
        """)

        results = cur.fetchall()
        conn.close()

        return [
            {
                'user_id': r[0],
                'email': r[1],
                'webhook_url': r[2],
                'email_enabled': r[3],
                'webhook_enabled': r[4]
            }
            for r in results
        ]
    except Exception as e:
        logger.error(f"Database error: {e}")
        return []


def log_notification(user_id, event_type, channel, status, error_message=None):
    if not DB_URL:
        return

    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO notification_history (user_id, event_type, channel, status, error_message)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, event_type, channel, status, error_message))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to log: {e}")

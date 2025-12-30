import requests
import json
import logging

logger = logging.getLogger(__name__)


def send_webhook(webhook_url, event_type, event_data):
    """Send webhook notification"""

    payload = {
        'event': event_type,
        'timestamp': event_data.get('timestamp'),
        'data': event_data
    }

    response = requests.post(
        webhook_url,
        json=payload,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )

    response.raise_for_status()
    logger.info(f"Webhook sent to {webhook_url} for event {event_type}")

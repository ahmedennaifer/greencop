import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from jinja2 import Environment, FileSystemLoader
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')

# Initialize Jinja2 environment
template_env = Environment(loader=FileSystemLoader('templates'))


def send_email(to_email, event_type, event_data):
    """Send email notification"""
    if not SMTP_USER or not SMTP_PASSWORD:
        raise ValueError("SMTP credentials not configured")

    # Get template
    try:
        template = template_env.get_template(f'{event_type}.html')
        html_content = template.render(**event_data)
    except Exception as e:
        logger.error(f"Template rendering failed: {e}")
        # Fallback to simple text
        html_content = f"<html><body><h1>{get_subject(event_type)}</h1><pre>{event_data}</pre></body></html>"

    # Create email
    msg = MIMEMultipart('alternative')
    msg['Subject'] = get_subject(event_type)
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)

    # Send via SMTP
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())

    logger.info(f"Email sent to {to_email} for event {event_type}")


def get_subject(event_type):
    """Get email subject for event type"""
    subjects = {
        'training_start': '🚀 GreenCop: Model Training Started',
        'training_complete': '✅ GreenCop: Model Training Complete',
        'anomaly': '⚠️ GreenCop: Anomaly Detected',
        'alert_surge': '🚨 GreenCop: Alert Surge (5+ Alerts)'
    }
    return subjects.get(event_type, 'GreenCop Notification')

import os
import json
import time
import random
import argparse
import uuid
from datetime import datetime
from google.cloud import pubsub_v1

PROJECT_ID = os.environ.get("PROJECT_ID")
TOPIC_NAME = os.environ.get("TOPIC_NAME", "data")

if not PROJECT_ID:
    raise ValueError("PROJECT_ID environment variable must be set")

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_NAME)

SENSOR_IDS = ["20e7c89f14ec"]


def generate_normal_reading(sensor_id):
    return {
        "node_id": sensor_id,
        "message_id": str(uuid.uuid4()),
        "temperature": round(random.uniform(18.0, 28.0), 2),
        "humidity": round(random.uniform(30.0, 45.0), 2),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def generate_anomaly_reading(sensor_id):
    anomaly_type = random.choice(["temp", "humidity", "both"])

    if anomaly_type == "temp":
        temp = round(random.uniform(55.0, 95.0), 2)
        humidity = round(random.uniform(30.0, 45.0), 2)
    elif anomaly_type == "humidity":
        temp = round(random.uniform(18.0, 28.0), 2)
        humidity = round(random.uniform(65.0, 90.0), 2)
    else:
        temp = round(random.uniform(55.0, 95.0), 2)
        humidity = round(random.uniform(65.0, 90.0), 2)

    return {
        "node_id": sensor_id,
        "message_id": str(uuid.uuid4()),
        "temperature": temp,
        "humidity": humidity,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def publish_reading(reading):
    message_bytes = json.dumps(reading).encode("utf-8")
    future = publisher.publish(topic_path, message_bytes)
    future.result()
    print(f"Published: {reading}")


def simulate(interval=5, anomaly_rate=0.1):
    print(f"Starting simulation: interval={interval}s, anomaly_rate={anomaly_rate}")
    print(f"Publishing to: {topic_path}")

    count = 0
    try:
        while True:
            sensor_id = random.choice(SENSOR_IDS)

            if random.random() < anomaly_rate:
                reading = generate_anomaly_reading(sensor_id)
                print(f"[ANOMALY] ", end="")
            else:
                reading = generate_normal_reading(sensor_id)
                print(f"[NORMAL]  ", end="")

            publish_reading(reading)
            count += 1

            time.sleep(interval)
    except KeyboardInterrupt:
        print(f"\nStopped. Published {count} readings.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate sensor data")
    parser.add_argument(
        "--interval", type=int, default=5, help="Seconds between readings"
    )
    parser.add_argument(
        "--anomaly-rate", type=float, default=0.1, help="Probability of anomaly (0-1)"
    )

    args = parser.parse_args()

    simulate(interval=args.interval, anomaly_rate=args.anomaly_rate)

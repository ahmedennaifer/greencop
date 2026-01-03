import os
import random
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from google.cloud import storage


def generate_training_data(days=7, anomaly_rate=0.05):
    data = []
    num_samples = days * 24 * 60 * 60
    start_time = datetime.now() - timedelta(days=days)

    base_temp = 22.0
    base_humidity = 50.0

    for i in range(num_samples):
        timestamp = start_time + timedelta(seconds=i)
        hour = timestamp.hour

        temp_cycle = 2.5 * np.sin((hour - 6) * np.pi / 12)
        temp_noise = np.random.normal(0, 0.3)
        humidity_noise = np.random.normal(0, 1.5)

        is_anomaly = random.random() < anomaly_rate

        if is_anomaly:
            anomaly_type = random.choice(
                [
                    "critical_temp",
                    "critical_humidity",
                    "warning_temp",
                    "warning_humidity",
                    "both",
                ]
            )

            if anomaly_type == "critical_temp":
                temperature = round(random.uniform(32.0, 50.0), 2)
                humidity = round(base_humidity + humidity_noise, 2)
                label = -1
            elif anomaly_type == "critical_humidity":
                temperature = round(base_temp + temp_cycle + temp_noise, 2)
                humidity = round(
                    random.choice([random.uniform(0, 20), random.uniform(80, 95)]), 2
                )
                label = -1
            elif anomaly_type == "warning_temp":
                temperature = round(random.uniform(27.0, 32.0), 2)
                humidity = round(base_humidity + humidity_noise, 2)
                label = -1
            elif anomaly_type == "warning_humidity":
                temperature = round(base_temp + temp_cycle + temp_noise, 2)
                humidity = round(
                    random.choice([random.uniform(20, 40), random.uniform(60, 80)]), 2
                )
                label = -1
            else:
                temperature = round(random.uniform(32.0, 50.0), 2)
                humidity = round(
                    random.choice([random.uniform(0, 20), random.uniform(80, 95)]), 2
                )
                label = -1
        else:
            temperature = round(base_temp + temp_cycle + temp_noise, 2)
            humidity = round(base_humidity + humidity_noise, 2)
            label = 1

        data.append(
            {
                "timestamp": timestamp,
                "node_id": "20e7c89f14ec",
                "temperature": temperature,
                "humidity": humidity,
                "hour_of_day": hour,
                "day_of_week": timestamp.weekday(),
                "label": label,
            }
        )

    df = pd.DataFrame(data)
    df = df.sort_values("timestamp").reset_index(drop=True)

    df["temp_delta"] = df["temperature"].diff().fillna(0)
    df["humidity_delta"] = df["humidity"].diff().fillna(0)
    df["temp_rolling_mean"] = (
        df["temperature"].rolling(window=360, min_periods=1).mean()
    )
    df["humidity_rolling_mean"] = (
        df["humidity"].rolling(window=360, min_periods=1).mean()
    )

    return df


def upload_to_gcs(df, bucket_name, blob_name):
    storage_client = storage.Client(project=os.environ.get("PROJECT_ID"))
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    local_path = "/tmp/training_data.csv"
    df.to_csv(local_path, index=False)
    blob.upload_from_filename(local_path)


if __name__ == "__main__":
    df = generate_training_data(days=7, anomaly_rate=0.05)
    upload_to_gcs(
        df, "atomic-climate-482314-q7-ml-models", "training_data/sensor_data_7days.csv"
    )

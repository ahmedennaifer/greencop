import os
import pickle
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from google.cloud import storage

PROJECT_ID = os.environ.get("PROJECT_ID")
MODEL_BUCKET = os.environ.get("MODEL_BUCKET", "atomic-climate-482314-q7-ml-models")

def train_forecasting_model(df):
    features = [
        'temperature',
        'humidity',
        'hour_of_day',
        'day_of_week',
        'temp_delta',
        'humidity_delta',
        'temp_rolling_mean',
        'humidity_rolling_mean'
    ]

    X = df[features].values
    y_temp = df['temperature'].shift(-1).ffill().values
    y_humidity = df['humidity'].shift(-1).ffill().values
    y = np.column_stack([y_temp, y_humidity])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    rmse_temp = np.sqrt(mean_squared_error(y_test[:, 0], y_pred[:, 0]))
    rmse_humidity = np.sqrt(mean_squared_error(y_test[:, 1], y_pred[:, 1]))
    mae_temp = mean_absolute_error(y_test[:, 0], y_pred[:, 0])
    mae_humidity = mean_absolute_error(y_test[:, 1], y_pred[:, 1])

    metrics = {
        'rmse_temp': rmse_temp,
        'rmse_humidity': rmse_humidity,
        'mae_temp': mae_temp,
        'mae_humidity': mae_humidity
    }

    return model, features, metrics

def save_model_to_gcs(model, features, metrics):
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(MODEL_BUCKET)

    model_path = '/tmp/forecasting_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump({'model': model, 'features': features, 'metrics': metrics}, f)

    blob = bucket.blob('models/forecasting_model.pkl')
    blob.upload_from_filename(model_path)

if __name__ == "__main__":
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(MODEL_BUCKET)
    blob = bucket.blob('training_data/sensor_data_7days.csv')
    blob.download_to_filename('/tmp/training_data.csv')

    df = pd.read_csv('/tmp/training_data.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    model, features, metrics = train_forecasting_model(df)
    save_model_to_gcs(model, features, metrics)

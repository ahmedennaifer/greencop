import os
import pickle
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import storage

app = FastAPI()

PROJECT_ID = os.environ.get("PROJECT_ID")
MODEL_BUCKET = os.environ.get("MODEL_BUCKET", "atomic-climate-482314-q7-ml-models")

forecasting_model = None
anomaly_model = None
features = None


class PredictRequest(BaseModel):
    instances: list


def load_models():
    global forecasting_model, anomaly_model, features

    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(MODEL_BUCKET)

    forecast_blob = bucket.blob("models/forecasting_model.pkl")
    forecast_path = "/tmp/forecasting_model.pkl"
    forecast_blob.download_to_filename(forecast_path)

    with open(forecast_path, "rb") as f:
        forecast_data = pickle.load(f)
        forecasting_model = forecast_data["model"]
        features = forecast_data["features"]

    latest_blob = bucket.blob("models/latest_model.txt")
    anomaly_filename = latest_blob.download_as_text().strip()

    anomaly_blob = bucket.blob(f"models/{anomaly_filename}")
    anomaly_path = f"/tmp/{anomaly_filename}"
    anomaly_blob.download_to_filename(anomaly_path)

    with open(anomaly_path, "rb") as f:
        anomaly_model = pickle.load(f)


@app.post("/predict")
async def predict(request: PredictRequest):
    global forecasting_model, anomaly_model

    if forecasting_model is None or anomaly_model is None:
        load_models()

    current_features = np.array(request.instances)

    forecast = forecasting_model.predict(current_features)

    forecast_with_features = []
    for predicted_values in forecast:
        temp_pred, hum_pred = predicted_values

        forecast_features = current_features[0].copy()
        forecast_features[0] = temp_pred
        forecast_features[1] = hum_pred

        forecast_with_features.append(forecast_features)

    forecast_array = np.array(forecast_with_features)
    anomaly_predictions = anomaly_model.predict(forecast_array)

    return {"predictions": anomaly_predictions.tolist()}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/")
async def train_handler(request: dict):
    from train import train_model_handler
    import base64
    import json

    message = request.get("message", {})
    if message:
        data_str = base64.b64decode(message.get("data", "")).decode()
        data = json.loads(data_str)

        cloud_event = type(
            "CloudEvent", (), {"data": {"message": {"data": message.get("data")}}}
        )()

        result = train_model_handler(cloud_event)
        return result

    return {"status": "no message"}

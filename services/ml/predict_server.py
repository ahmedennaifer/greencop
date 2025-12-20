import os
import pickle
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import storage

app = FastAPI()

PROJECT_ID = os.environ.get("PROJECT_ID")
MODEL_BUCKET = os.environ.get("MODEL_BUCKET")

model = None

class PredictRequest(BaseModel):
    instances: list

def load_model():
    global model
    storage_client = storage.Client()
    bucket = storage_client.bucket(MODEL_BUCKET)

    latest_blob = bucket.blob("models/latest_model.txt")
    model_filename = latest_blob.download_as_text().strip()

    model_blob = bucket.blob(f"models/{model_filename}")
    model_path = f"/tmp/{model_filename}"
    model_blob.download_to_filename(model_path)

    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    return model

@app.post("/predict")
async def predict(request: PredictRequest):
    global model
    if model is None:
        model = load_model()

    predictions = model.predict(request.instances).tolist()

    return {"predictions": predictions}

@app.get("/health")
async def health():
    return {"status": "healthy"}

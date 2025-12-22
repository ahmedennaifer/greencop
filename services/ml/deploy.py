import os
import logging
from datetime import datetime
from google.cloud import storage, aiplatform
import functions_framework

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
REGION = os.environ.get("REGION", "us-central1")
MODEL_BUCKET = os.environ.get("MODEL_BUCKET")


def get_latest_model():
    storage_client = storage.Client()
    bucket = storage_client.bucket(MODEL_BUCKET)

    latest_blob = bucket.blob("models/latest_model.txt")
    model_filename = latest_blob.download_as_text().strip()

    logger.info(f"Latest model: {model_filename}")
    return model_filename


def upload_to_vertex_ai(model_filename):
    aiplatform.init(project=PROJECT_ID, location=REGION)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    storage_client = storage.Client()
    bucket = storage_client.bucket(MODEL_BUCKET)

    model_version = model_filename.replace(".joblib", "")
    dest_path = f"vertex_models/{model_version}/model.joblib"

    source_blob = bucket.blob(f"models/{model_filename}")
    bucket.copy_blob(source_blob, bucket, dest_path)

    logger.info(f"Copied model to {dest_path}")

    model = aiplatform.Model.upload(
        display_name=f"anomaly-detection-{timestamp}",
        artifact_uri=f"gs://{MODEL_BUCKET}/vertex_models/{model_version}/",
        serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-0:latest",
        serving_container_predict_route="/predict",
        serving_container_health_route="/health",
    )

    logger.info(f"Model uploaded to Vertex AI: {model.resource_name}")
    return model


def deploy_to_endpoint(model):
    aiplatform.init(project=PROJECT_ID, location=REGION)

    endpoints = aiplatform.Endpoint.list(
        filter='display_name="Anomaly Detection Endpoint"'
    )

    if not endpoints:
        raise ValueError("Endpoint not found")

    endpoint = endpoints[0]

    if endpoint.list_models():
        for deployed_model in endpoint.list_models():
            endpoint.undeploy(deployed_model_id=deployed_model.id)
        logger.info("Undeployed old models")

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    endpoint.deploy(
        model=model,
        deployed_model_display_name=f"deployed-{timestamp}",
        machine_type="n1-standard-2",
        min_replica_count=1,
        max_replica_count=3,
        traffic_percentage=100,
    )

    logger.info(f"Model deployed to endpoint: {endpoint.resource_name}")
    return endpoint


def health_check(endpoint):
    test_instance = [[25.0, 50.0, 12, 3, 0.0, 0.0, 25.0, 50.0]]

    try:
        prediction = endpoint.predict(instances=test_instance)
        logger.info(f"Health check passed: {prediction.predictions}")
        return True
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return False


@functions_framework.cloud_event
def deploy_model_handler(cloud_event):
    try:
        model_filename = get_latest_model()

        model = upload_to_vertex_ai(model_filename)

        endpoint = deploy_to_endpoint(model)

        if health_check(endpoint):
            logger.info("Deployment successful")
            return {"status": "success", "endpoint": endpoint.resource_name}
        else:
            raise ValueError("Health check failed")

    except Exception as e:
        logger.error(f"Deployment failed: {str(e)}")
        raise


if __name__ == "__main__":
    deploy_model_handler(None)

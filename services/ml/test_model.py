import os
from google.cloud import aiplatform

PROJECT_ID = os.environ.get("PROJECT_ID", "greencop-473112")
REGION = os.environ.get("REGION", "europe-west1")

aiplatform.init(project=PROJECT_ID, location=REGION)

endpoints = aiplatform.Endpoint.list(
    filter='display_name="Anomaly Detection Endpoint"'
)

if not endpoints:
    print("No endpoint found")
    exit(1)

endpoint = endpoints[0]
print(f"Endpoint: {endpoint.resource_name}")
print(f"Deployed models: {len(endpoint.list_models())}")

test_instances = [
    [25.0, 50.0, 12, 3, 0.0, 0.0, 25.0, 50.0],
    [75.0, 80.0, 14, 4, 10.0, 15.0, 70.0, 75.0],
    [22.0, 45.0, 8, 1, -1.0, -2.0, 23.0, 46.0],
]

print("\nTesting predictions:")
for i, instance in enumerate(test_instances):
    prediction = endpoint.predict(instances=[instance])
    result = prediction.predictions[0]
    status = "ANOMALY" if result == -1 else "NORMAL"
    print(f"Test {i+1}: {status} (value={result})")
    print(f"  Input: temp={instance[0]}, humidity={instance[1]}")

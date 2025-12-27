#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

AUTO_APPROVE=""
if [ "$1" = "--auto-approve" ]; then
    AUTO_APPROVE="-auto-approve"
fi

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION=${REGION:-europe-west1}

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No active GCP project"
    exit 1
fi

echo "Deploying to project: $PROJECT_ID"
echo

echo "Step 1: Packaging Cloud Functions..."
"$SCRIPT_DIR/package-functions.sh"
echo

echo "Step 2: Building Docker images..."
"$SCRIPT_DIR/build-images.sh"
echo

echo "Step 3: Running Terraform..."
cd "$TERRAFORM_DIR"
terraform init -upgrade
terraform plan
terraform apply $AUTO_APPROVE
cd - > /dev/null

echo
echo "Deployment complete!"
echo

CUSTOMERS_URL=$(gcloud run services describe customers-service \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)" 2>/dev/null || echo "N/A")

ML_URL=$(gcloud run services describe ml-predict \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)" 2>/dev/null || echo "N/A")

echo "Customers Service: $CUSTOMERS_URL"
echo "ML Predict Service: $ML_URL"

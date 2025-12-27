#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION=${REGION:-europe-west1}
TAG=${TAG:-latest}

SERVICE_NAME="$1"

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No active GCP project. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Building images for project: $PROJECT_ID (tag: $TAG)"

build_service() {
    local service=$1
    local source_dir=$2
    local image_name="gcr.io/$PROJECT_ID/$service:$TAG"

    echo "Building $service from $source_dir..."

    gcloud builds submit "$source_dir" \
        --tag="$image_name" \
        --project="$PROJECT_ID" \
        --region="$REGION"

    echo "Built: $image_name"
}

if [ -z "$SERVICE_NAME" ] || [ "$SERVICE_NAME" = "all" ]; then
    build_service "customers-service" "$REPO_ROOT/services/customers"
    build_service "ml-predict" "$REPO_ROOT/services/ml"
    echo "Done. Update terraform.tfvars if needed."
else
    case "$SERVICE_NAME" in
        customers-service)
            build_service "customers-service" "$REPO_ROOT/services/customers"
            ;;
        ml-predict)
            build_service "ml-predict" "$REPO_ROOT/services/ml"
            ;;
        *)
            echo "Error: Unknown service '$SERVICE_NAME'"
            echo "Usage: $0 [customers-service|ml-predict|all]"
            exit 1
            ;;
    esac
fi

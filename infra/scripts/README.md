# Deployment Scripts

Automation scripts for deploying GreenCop infrastructure to Google Cloud Platform.

## Prerequisites

- `gcloud` CLI installed and authenticated
- Active GCP project configured: `gcloud config set project YOUR_PROJECT_ID`
- Terraform installed
- Service account credentials (`sa.json`) in `infra/terraform/`

## Scripts

### build-images.sh

Build and push Docker images to Google Container Registry using Cloud Build.

```bash
./infra/scripts/build-images.sh [service-name]

./infra/scripts/build-images.sh
./infra/scripts/build-images.sh customers-service
./infra/scripts/build-images.sh ml-predict
```

Environment variables:
- `TAG` - Image tag (default: `latest`)
- `REGION` - GCP region (default: `europe-west1`)

### package-functions.sh

Package Cloud Functions into ZIP files for deployment.

```bash
./infra/scripts/package-functions.sh [function-name]

./infra/scripts/package-functions.sh
./infra/scripts/package-functions.sh alert-detection
./infra/scripts/package-functions.sh alert-subscriber
```

### deploy-all.sh

Master orchestration script that runs all deployment steps.

```bash
./infra/scripts/deploy-all.sh [--auto-approve]

./infra/scripts/deploy-all.sh
./infra/scripts/deploy-all.sh --auto-approve
```

Steps:
1. Package Cloud Functions
2. Build and push Docker images
3. Run Terraform deployment

## Configuration

Create local config files from examples:

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
cp services/customers/.env.example services/customers/.env
```

Edit these files with your actual values. **Never commit them.**

## Service Account Setup

Before first deployment:

```bash
gcloud iam service-accounts create terraform \
  --display-name="Terraform Automation" \
  --project=YOUR_PROJECT_ID

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:terraform@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

gcloud iam service-accounts keys create infra/terraform/sa.json \
  --iam-account=terraform@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --project=YOUR_PROJECT_ID
```

## Deployment

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud auth login
./infra/scripts/deploy-all.sh
```

## Troubleshooting

**Error: No active GCP project**
```bash
gcloud config set project YOUR_PROJECT_ID
```

**Error: gcloud auth**
```bash
gcloud auth login
gcloud auth application-default login
```

**Cloud Build permission denied**
```bash
gcloud services enable cloudbuild.googleapis.com
```

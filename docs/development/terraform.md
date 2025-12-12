# Infrastructure with Terraform

GreenCop uses Terraform for infrastructure as code.

## Modules

Located in `/infra/terraform/modules/`:

- `cloud_run`: FastAPI service
- `cloud_sql`: PostgreSQL
- `pubsub`: Event topics
- `cloud_function`: Serverless functions
- `bigquery`: Data warehouse

## Usage

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Variables

See `variables.tf` for configuration options.

Note: Brief overview only as requested.

# Cloud Functions

Serverless processing in GreenCop.

## Data Ingestion Function

**Trigger**: Pub/Sub `data` topic
**Purpose**: Write to BigQuery
**Runtime**: Python 3.12

## Alert Detection Function

**Trigger**: Pub/Sub `data` topic
**Purpose**: Check thresholds
**Runtime**: Python 3.12

**Logic**:
```python
if temp > MAX_TEMP or humidity > MAX_HUMIDITY:
    publish_alert()
```

## Deployment

```bash
cd services/alerts
zip function_source.zip main.py requirements.txt
# Deploy via GCP Console or Terraform
```

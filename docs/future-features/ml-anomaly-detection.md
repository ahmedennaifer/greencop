# ML Anomaly Detection & Automatic Model Retraining

**Status**: ✅ **Implemented and Production-Ready**

## Overview

GreenCop's machine learning system provides intelligent anomaly detection and predictive forecasting with automatic model improvement through continuous retraining. The system learns from user feedback to deliver increasingly accurate predictions.

## Key Features

### Dual-Model Architecture

The ML system trains and deploys two models simultaneously:

1. **Anomaly Detection Model**
   - Algorithm: Isolation Forest (scikit-learn)
   - Purpose: Identify unusual sensor behavior patterns
   - Metrics: F1 Score, Accuracy
   - Typical Performance: 85-95% accuracy

2. **Forecasting Model**
   - Algorithm: Random Forest Regressor
   - Purpose: Predict future temperature and humidity values
   - Metrics: RMSE (temperature), MAE (humidity)
   - Prediction Window: 20 seconds ahead

### Automatic Model Retraining

The system automatically triggers retraining when conditions are met:

**Trigger Conditions:**
- After every **100 validated predictions**
- Triggered by: `auto_100_validated`

**Retraining Process:**
1. User validates predictions in the dashboard (marks as "ok" or "not ok")
2. System counts unused validated predictions (`used_in_training=false`)
3. When count reaches ≥100, Pub/Sub message published to `model-retraining` topic
4. Cloud Function triggers ML training service
5. Both models retrain on:
   - Validated prediction feedback
   - Historical sensor readings from BigQuery
6. New models saved to Google Cloud Storage
7. Predictions automatically marked as `used_in_training=true`
8. Training run metrics recorded in database

**Training Time:** Typically 3-5 seconds for both models

**Deployment:** Zero downtime - new models are deployed instantly

## Implementation Details

### Service Architecture

```
Location: /services/ml/
Entry Point: train.py
Cloud Function: retrain-models
Trigger: Pub/Sub topic "model-retraining"
Storage: Google Cloud Storage bucket
```

### Model Artifacts

**Anomaly Detection Model:**
```
anomaly_model_v{TIMESTAMP}.joblib
```

**Forecasting Model:**
```
forecasting_model_v{TIMESTAMP}.joblib
```

Models are versioned by timestamp and stored in GCS for auditing and rollback.

### Training Data Sources

1. **Validated Predictions:** User feedback from prediction validation workflow
2. **Historical Sensor Data:** BigQuery time-series data
3. **Feature Engineering:**
   - Rolling statistics (mean, std, min, max)
   - Time-based features (hour, day of week)
   - Sensor-specific baselines

### Database Schema

**Training Runs Table:** `model_training_runs`

```sql
CREATE TABLE model_training_runs (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50),  -- 'running', 'completed', 'failed'
    model_type VARCHAR(50),  -- 'anomaly', 'forecasting', 'both'
    training_data_count INTEGER,
    validated_data_count INTEGER,
    metrics JSONB,  -- Stores F1, accuracy, RMSE, MAE
    model_version VARCHAR(255),
    triggered_by VARCHAR(100),  -- 'auto_100_validated', 'manual'
    error_message TEXT
);
```

**Prediction Feedback Table:** `prediction_feedback`

```sql
CREATE TABLE prediction_feedback (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(255),
    timestamp TIMESTAMP,
    predicted_temp FLOAT,
    predicted_humidity FLOAT,
    actual_temp FLOAT,
    actual_humidity FLOAT,
    anomaly_predicted BOOLEAN,
    feedback VARCHAR(50),  -- 'ok', 'not_ok', NULL
    used_in_training BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### View Training History

```bash
GET /api/v1/ml/retraining/history?limit=20

Response:
[
  {
    "id": 428,
    "started_at": "2025-12-30T10:14:33Z",
    "completed_at": "2025-12-30T10:14:36Z",
    "status": "completed",
    "model_type": "both",
    "training_data_count": 6560,
    "validated_data_count": 120,
    "metrics": {
      "anomaly": {
        "f1_score": 0.865,
        "accuracy": 0.891
      },
      "forecasting": {
        "rmse_temp": 5.20,
        "mae_humidity": 3.02
      }
    },
    "model_version": "anomaly_model_v20251230_091435.joblib, forecasting_model_v20251230_091435.joblib",
    "triggered_by": "auto_100_validated"
  }
]
```

### Validate Predictions

```bash
PUT /api/v1/prediction-feedback/{id}
Content-Type: application/json

{
  "feedback": "ok"  // or "not_ok"
}

Response:
{
  "id": 6275,
  "feedback": "ok",
  "used_in_training": false
}
```

### Check Prediction Stats

```bash
GET /api/v1/prediction-feedback/stats

Response:
{
  "total_predictions": 6375,
  "validated_count": 1488,
  "ok_count": 1480,
  "not_ok_count": 8,
  "ready_for_retraining": true
}
```

## Use Cases

### 1. Detect Unusual Temperature Patterns

The Isolation Forest model identifies anomalous sensor behavior:
- Sudden temperature spikes
- Humidity fluctuations outside normal range
- Sensor drift over time
- Equipment malfunction indicators

**Example:**
```
Anomaly detected: humidity=38.29% (ML prediction: anomaly)
Confidence: 94%
Sensor: ESP32-A1B2C3
```

### 2. Predict Equipment Failures

Forecasting model predicts values 20 seconds ahead:
- Allows preventive action before threshold breach
- Identifies trends leading to failures
- Reduces false positive alerts

**Example:**
```
Predicted Temperature: 29.8°C (Threshold: 30°C)
Actual Temperature: 28.5°C
Trend: Rising, breach predicted in 15 seconds
```

### 3. Continuous Model Improvement

User feedback loop ensures models improve over time:
- Mark predictions as accurate or false positives
- System learns from corrections
- Performance metrics tracked per training run
- Compare model versions to identify improvements

**Example Progression:**
```
Run #424: F1=0.831 (110 validations)
Run #425: F1=0.842 (210 validations)
Run #426: F1=0.855 (105 validations)
Run #428: F1=0.865 (120 validations)
```

### 4. Optimize HVAC Schedules

Forecasting predictions help optimize cooling:
- Predict thermal load before it occurs
- Adjust HVAC based on predicted patterns
- Reduce energy costs while maintaining safety
- Learn seasonal patterns automatically

## Frontend Integration

### Models Page

View training history, metrics, and model performance:

**Features:**
- Search by ID, version, trigger, or status
- Sort by ID, date, F1 score, accuracy, or validated count
- Separate collapsible pane for failed training runs
- Performance metrics visualization
- Training data statistics

**Access:** Dashboard → Models (Flask icon in sidebar)

### Prediction Validation Workflow

1. Navigate to Predictions page
2. Review predicted vs actual values
3. Click "Validate" on individual predictions
4. Mark as "ok" (accurate) or "not ok" (false positive)
5. System automatically triggers retraining after 100 validations

## Performance Metrics

### Typical Training Run

```
Training Data: 6,000-7,000 rows
Validated Predictions: 100-120 per run
Training Time: 3-5 seconds
Models Trained: 2 (anomaly + forecasting)
```

### Accuracy Progression

| Validated Count | Typical F1 Score | Typical RMSE |
|----------------|------------------|--------------|
| 100            | 0.83-0.85        | 5.5-6.0°C    |
| 300            | 0.85-0.88        | 5.0-5.5°C    |
| 500+           | 0.90-0.95        | 4.5-5.0°C    |

### System Requirements

- **Memory:** 512MB-1GB during training
- **CPU:** 1-2 vCPUs
- **Storage:** 10-50MB per model version
- **Network:** Minimal (GCS upload only)

## Monitoring & Observability

### Logs

Training logs available in Cloud Functions console:

```
[INFO] Auto-retraining triggered by 100 validated predictions
[INFO] Fetching training data from BigQuery...
[INFO] Training anomaly detection model...
[INFO] Training forecasting model...
[INFO] Models saved to GCS: anomaly_model_v20251230_091435.joblib
[INFO] Marking 105 predictions as used_in_training
[INFO] Training run #426 completed successfully
```

### Metrics to Monitor

1. **Training Frequency:** Should trigger every 100 validations
2. **Training Success Rate:** Target >95% successful runs
3. **Model Performance:** F1 score should improve over time
4. **Training Duration:** Should stay under 10 seconds
5. **Validation Rate:** Track user validation engagement

## Troubleshooting

### Training Run Fails

**Symptoms:** Status shows "failed" in Models page

**Common Causes:**
- Insufficient training data
- BigQuery query timeout
- GCS permissions issue
- Memory exceeded during training

**Solution:**
1. Check Cloud Function logs for error details
2. Verify BigQuery dataset accessible
3. Confirm GCS bucket permissions
4. Review `error_message` field in database

### Models Not Improving

**Symptoms:** F1 score stagnant across runs

**Common Causes:**
- Inconsistent validation feedback
- Limited data diversity
- Model architecture limitations
- Overfitting to specific patterns

**Solution:**
1. Review validation quality (are users marking correctly?)
2. Ensure diverse sensor coverage in feedback
3. Consider hyperparameter tuning
4. Add more features to training data

### Retraining Not Triggering

**Symptoms:** 100+ validations but no new training run

**Common Causes:**
- Pub/Sub message delivery failure
- Cloud Function not triggered
- Database connection issue
- Logic bug in trigger calculation

**Solution:**
1. Check Pub/Sub topic metrics
2. Verify Cloud Function deployment
3. Review application logs for trigger logic
4. Manual trigger via API if needed

## Related Documentation

- [Predictions API Reference](../api-reference/data.md)
- [BigQuery Analytics](../advanced/bigquery-queries.md)
- [Cloud Functions Architecture](../advanced/cloud-functions.md)
- [Dashboard Features](../features/dashboard.md)

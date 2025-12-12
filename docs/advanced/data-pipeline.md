# Data Pipeline

Deep dive into the GreenCop data pipeline.

## Architecture

```
ESP32 → Gateway → Pub/Sub → Cloud Function → BigQuery
```

## Pub/Sub Topics

- **data**: Raw sensor readings
- **alerts**: Threshold violations

## Cloud Functions

### Data Ingestion
Streams sensor data to BigQuery.

**Code**: `/services/pubsub_bq_bridge/main.py`

### Alert Detection
Checks thresholds, publishes alerts.

**Code**: `/services/alerts/main.py`

## BigQuery Schema

```sql
CREATE TABLE sensor_data.readings (
  node_id STRING,
  message_id STRING,
  timestamp TIMESTAMP,
  temperature FLOAT64,
  humidity FLOAT64
)
PARTITION BY DATE(timestamp)
CLUSTER BY node_id, message_id;
```

## Performance

- Partitioned by day for fast queries
- Clustered by node_id for sensor lookups
- Streaming inserts for real-time data

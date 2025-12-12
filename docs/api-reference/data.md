# Data API

Query sensor readings from BigQuery.

## Endpoints

### Latest Reading
**GET** `/api/v1/data/latest/{sensor_id}`

**Response**:
```json
{
  "node_id": "sensor001",
  "temperature": 25.3,
  "humidity": 45.2,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Historical Data
**GET** `/api/v1/data/historical/{sensor_id}?start_time={iso}&end_time={iso}`

### Multi-Sensor Data
**POST** `/api/v1/data/multi-sensor`

**Body**:
```json
{"node_ids": ["sensor001", "sensor002"]}
```

### Sensor Statistics
**GET** `/api/v1/data/stats/{sensor_id}`

Returns aggregated stats for 1h, 24h, 7d, 30d windows.

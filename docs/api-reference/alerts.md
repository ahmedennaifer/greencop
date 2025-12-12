# Alerts API

Monitor and manage environmental alerts.

## Endpoints

### Active Alerts
**GET** `/api/v1/alerts/active`

Returns all unacknowledged alerts.

### Alert History
**GET** `/api/v1/alerts/history`

Last 50 alerts (includes acknowledged).

### Acknowledge Alert
**POST** `/api/v1/alerts/{alert_id}/acknowledge`

### Get Thresholds
**GET** `/api/v1/alerts/thresholds/{customer_id}`

**Response**:
```json
{
  "max_temperature": 50.0,
  "max_humidity": 50.0
}
```

### Update Thresholds
**POST** `/api/v1/alerts/thresholds/{customer_id}`

**Body**:
```json
{
  "max_temperature": 28.0,
  "max_humidity": 55.0
}
```

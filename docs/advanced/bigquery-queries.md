# BigQuery Queries

Example SQL queries for sensor data analysis.

## Latest Reading per Sensor

```sql
SELECT node_id, temperature, humidity, timestamp
FROM `sensor_data.readings`
QUALIFY ROW_NUMBER() OVER (PARTITION BY node_id ORDER BY timestamp DESC) = 1
```

## Average Temperature by Hour

```sql
SELECT
  DATE_TRUNC(timestamp, HOUR) as hour,
  AVG(temperature) as avg_temp
FROM `sensor_data.readings`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
GROUP BY hour
ORDER BY hour
```

## High Temperature Events

```sql
SELECT *
FROM `sensor_data.readings`
WHERE temperature > 50
AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY timestamp DESC
```

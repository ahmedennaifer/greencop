# Data Analytics

Analyze sensor data with interactive charts, statistics, and historical trends.

## Overview

GreenCop provides comprehensive data analytics to help you understand environmental patterns, identify trends, and make data-driven decisions about your infrastructure.

## Data Sources

### Real-Time Data
- Latest sensor readings from BigQuery
- Updated every few seconds
- Displayed on dashboard and sensor detail pages

### Historical Data  
- All sensor readings stored in BigQuery
- Partitioned by date for fast queries
- Queryable via API for custom time ranges

## Analytics Features

### Statistics

**Sensor Statistics API**: `GET /api/v1/data/stats/{sensor_id}`

Provides aggregated stats for multiple time windows:
- Last 1 hour
- Last 24 hours
- Last 7 days
- Last 30 days

**Metrics Provided**:
- Average temperature
- Minimum temperature
- Maximum temperature
- Average humidity
- Minimum humidity
- Maximum humidity

### Time-Series Charts

**Temperature Trends**:
- Line chart showing temperature over time
- Customizable time ranges (1h, 24h, 7d)
- Smooth interpolation
- Interactive tooltips

**Humidity Trends**:
- Line chart showing humidity over time
- Same time range options
- Parallel to temperature for correlation analysis

**Comparative Charts**:
- Bar charts comparing all sensors
- Side-by-side temperature and humidity
- Identify outliers quickly

## Data Visualization

### Chart Types

**Line Charts** (Trends):
- Best for: Time-series analysis
- Shows: Patterns, cycles, anomalies
- Used in: Sensor detail page, dashboard

**Bar Charts** (Comparison):
- Best for: Multi-sensor comparison
- Shows: Current state across fleet
- Used in: Dashboard

### Interactive Features

- **Hover Tooltips**: Exact values on mouse over
- **Zoom**: Click and drag to zoom (future)
- **Legend**: Toggle series visibility
- **Responsive**: Adapts to screen size

## Querying Data

### Via Dashboard
1. Navigate to sensor detail page
2. Select time range (1h/24h/7d)
3. View charts automatically
4. No manual query needed

### Via API

**Latest Reading**:
```bash
GET /api/v1/data/latest/{sensor_id}
```

**Historical Range**:
```bash
GET /api/v1/data/historical/{sensor_id}?start_time=2025-01-01T00:00:00Z&end_time=2025-01-15T23:59:59Z
```

**Multi-Sensor**:
```bash
POST /api/v1/data/multi-sensor
Body: {"node_ids": ["sensor1", "sensor2"]}
```

**Statistics**:
```bash
GET /api/v1/data/stats/{sensor_id}
```

## Data Insights

### Identifying Patterns

**Daily Cycles**:
- Temperature typically rises during day
- Drops at night
- Chart shows regular wave pattern

**Anomalies**:
- Sudden spikes or drops
- Sustained high/low periods
- Irregular patterns

**Trends**:
- Gradual increase over days (cooling failure)
- Gradual decrease (over-cooling)
- Seasonal variations

### Use Cases

**Capacity Planning**:
- Analyze peak usage times
- Size cooling infrastructure
- Plan maintenance windows

**Efficiency**:
- Identify over-cooling periods
- Optimize HVAC schedules
- Reduce energy costs

**Compliance**:
- Generate reports for audits
- Prove SLA adherence
- Document environmental controls

## Data Export

!!! note "Future Feature"
    CSV/Excel export is planned. Currently, use API to retrieve data programmatically.

### Current Options

**API Export**:
- Query historical data endpoint
- Parse JSON response
- Process in your own tools

**BigQuery Direct**:
- Connect to BigQuery dataset
- Use SQL for complex analytics
- Export to Google Sheets, Data Studio, etc.

## Performance

### Optimization

- BigQuery partitioned by day
- Clustered by node_id for fast lookups
- Dashboard limits to last 50 points
- Caching planned for future release

### Query Limits

- Historical data: Up to 30 days via API
- Statistics: Pre-computed for common windows
- BigQuery: Unlimited with direct access

## Best Practices

### For Accurate Analysis

1. **Sufficient Data**: Wait for 24h of data before analyzing trends
2. **Time Zones**: All timestamps in UTC, convert for local analysis
3. **Outliers**: Investigate extreme values, may be sensor errors
4. **Context**: Consider external factors (weather, usage patterns)

### Interpretation

**Normal Patterns**:
- Smooth curves without sudden changes
- Daily temperature cycles of 3-5°C
- Humidity relatively stable

**Warning Signs**:
- Sharp temperature spikes
- Sustained above-threshold conditions
- Erratic, noisy data (sensor issue)

## Next Steps

- [View Sensor Details](../user-guide/viewing-data.md)
- [Configure Alerts](../user-guide/configuring-alerts.md)
- [Data API Reference](../api-reference/data.md)
- [BigQuery Queries](../advanced/bigquery-queries.md)

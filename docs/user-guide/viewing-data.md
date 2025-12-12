# Viewing Sensor Data

Learn how to access, interpret, and analyze sensor readings across the GreenCop platform.

## Data Access Points

### 1. Dashboard (Overview)

**Best For**: Quick glance at entire system

**Shows**:
- Average temperature across all sensors
- Total active sensors
- Bar chart of all current readings
- Historical trend (30-day line chart)
- Recent alerts

**Refresh**: Automatic on page load

**Navigate**: Home icon in sidebar or logo click

### 2. Sensors Page (Current State)

**Best For**: Current readings for all sensors

**Shows**:
- Grid of all sensors
- Latest temperature per sensor
- Latest humidity per sensor
- Last update timestamp
- Room assignments

**Refresh**: Auto-polls every 10 seconds

**Navigate**: Sensors icon in sidebar

### 3. Sensor Detail Page (Deep Dive)

**Best For**: Detailed analysis of single sensor

**Shows**:
- Large current temperature and humidity
- Selectable time ranges (1h, 24h, 7d)
- Temperature history line chart
- Humidity history line chart
- Sensor metadata

**Refresh**: Manual or via time range selector

**Navigate**: Click any sensor card

## Reading the Data

### Temperature Display

**Format**: `25.3°C`
- Number: Actual temperature
- Unit: Degrees Celsius
- Precision: 0.1°C (one decimal place)

**Color Coding**:
- Orange background: Temperature data
- Red: Alert condition (> threshold)

**Typical Ranges**:
- 18-27°C: Ideal for servers
- 28-35°C: Warm, monitor closely
- >35°C: Concerning, investigate

### Humidity Display

**Format**: `45.2%`
- Number: Relative humidity
- Unit: Percentage
- Precision: 0.1%

**Color Coding**:
- Blue background: Humidity data
- Dark blue: Alert condition (> threshold)

**Typical Ranges**:
- 40-60%: Ideal for servers
- 30-70%: Acceptable
- <30% or >70%: Investigate

### Timestamps

**Format**: `1/15/2025, 10:30:45 AM`
- Date: Month/Day/Year
- Time: Hour:Minute:Second AM/PM
- Timezone: Browser local time (data stored as UTC)

**Freshness Indicators**:
- <1 min: Very fresh, green
- 1-5 min: Recent, normal
- 5-30 min: Aging, yellow
- >30 min: Stale, red (likely offline)

## Charts and Graphs

### Bar Chart (Dashboard)

**Purpose**: Compare multiple sensors at once

**Axes**:
- X-axis: Sensor names
- Y-axis: Temperature (°C) or Humidity (%)

**Bars**:
- Orange: Temperature
- Blue: Humidity
- Side-by-side for comparison

**Interaction**:
- Hover: See exact values
- No zoom/pan (fixed view)

### Line Chart (Trends)

**Purpose**: Visualize changes over time

**Axes**:
- X-axis: Time (formatted as HH:MM)
- Y-axis: Temperature (°C) or Humidity (%)

**Lines**:
- Orange: Temperature trend
- Blue: Humidity trend
- Smooth curves

**Interaction**:
- Hover: See point values
- Legend: Click to hide/show series

## Time Ranges

### Available Options

**1 Hour**:
- Last 60 minutes of data
- Most detailed view
- ~60-120 data points
- Best for: Real-time troubleshooting

**24 Hours**:
- Last day of data
- Shows daily patterns
- ~288-480 data points
- Best for: Daily cycle analysis

**7 Days**:
- Last week of data
- Weekly trends
- ~1000-2000 data points (sampled)
- Best for: Long-term patterns

### Selecting Time Range

1. Navigate to sensor detail page
2. Click one of three buttons: "1 Hour", "24 Hours", "7 Days"
3. Chart updates automatically
4. Selection highlighted in blue

## Data Freshness

### Live Polling

**Sensors Page**: Auto-refreshes every 10 seconds
**Dashboard**: Fetches on page load, manual refresh needed
**Sensor Detail**: Fetches on load and time range change

### Manual Refresh

- Reload browser page (F5 or Cmd+R)
- Navigate away and back
- Change time range (sensor detail page)

## Interpreting Patterns

### Normal Patterns

**Daily Temperature Cycle**:
- Rises during business hours (people, equipment active)
- Drops at night (less activity)
- 3-5°C variation typical
- Smooth wave pattern

**Stable Humidity**:
- Relatively flat line
- Minor variations (<5%)
- No sudden spikes

### Abnormal Patterns

**Sudden Spike**:
- Sharp upward jump
- Indicates: Equipment failure, cooling loss, heat source
- Action: Immediate investigation

**Gradual Rise**:
- Slow increase over hours/days
- Indicates: Cooling capacity issue, increasing load
- Action: Plan maintenance

**Erratic/Noisy**:
- Wild fluctuations
- Indicates: Sensor malfunction, poor placement
- Action: Check sensor hardware

**Flat Line**:
- No variation over time
- Indicates: Sensor stuck, not updating
- Action: Check sensor connectivity

## Empty States

### No Data Available

**Display**: "No data available" in gray text

**Causes**:
- Sensor just registered (wait 30 seconds)
- Sensor offline (check hardware)
- BigQuery issue (check backend logs)
- Sensor ID mismatch

**Solutions**:
- Wait for first reading
- Verify sensor is publishing
- Check sensor ID matches registration

### No Historical Data

**Display**: "No historical data available" in chart area

**Causes**:
- New sensor with <1 hour of data
- BigQuery ingestion issue
- Time range has no data points

**Solutions**:
- Wait for more data to accumulate
- Select different time range
- Check BigQuery table has rows

## Data Accuracy

### Sources of Error

- **Sensor Calibration**: ESP32/DHT sensors have ±0.5°C accuracy
- **Placement**: Poor location (sunlight, heat sources) skews readings
- **Network Delays**: 1-5 second lag from sensor to dashboard
- **Sampling**: Charts may show sampled data, not every point

### Ensuring Accuracy

1. Calibrate sensors before deployment
2. Place in representative locations
3. Avoid direct airflow over sensor
4. Cross-reference multiple sensors
5. Compare with calibrated thermometer

## Exporting Data

!!! note "Future Feature"
    CSV/Excel export coming soon

**Current Options**:
- API: Query historical data endpoint
- BigQuery: Direct SQL queries
- Screenshots: Browser screenshot tools

**API Example**:
```bash
GET /api/v1/data/historical/sensor-001?start_time=2025-01-01T00:00:00Z&end_time=2025-01-15T23:59:59Z
```

## Mobile Viewing

### Responsive Design

- Dashboard: Stacked layout on mobile
- Sensors: One card per row
- Charts: Full-width, scroll horizontally if needed
- All features accessible on mobile

### Tips for Mobile

- Rotate to landscape for better chart viewing
- Use zoom gestures for detail
- Refresh by pulling down (if supported)

## Next Steps

- [Configure Alert Thresholds](configuring-alerts.md)
- [Understand Data Analytics](../features/data-analytics.md)
- [Interpret Charts](interpreting-charts.md)
- [API Reference: Data](../api-reference/data.md)

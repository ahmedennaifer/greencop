# Interpreting Charts

Learn to read and analyze the temperature and humidity visualizations in GreenCop.

## Chart Types

### Bar Charts

**Used For**: Comparing current readings across multiple sensors

**Location**: Dashboard main area

**How to Read**:
- Each sensor has two bars side-by-side
- Left bar (orange): Current temperature
- Right bar (blue): Current humidity
- Y-axis: Value (°C or %)
- X-axis: Sensor names

**Insights**:
- Quickly identify outlier sensors
- Compare environmental conditions across rooms
- Spot sensors reporting abnormal values

### Line Charts

**Used For**: Viewing trends over time

**Locations**: Dashboard (historical trends), Sensor Detail Page

**How to Read**:
- X-axis: Time (chronological)
- Y-axis: Temperature (°C) or Humidity (%)
- Orange line: Temperature progression
- Blue line: Humidity progression
- Hover for exact values at any point

**Insights**:
- Identify daily cycles
- Spot gradual changes
- Detect anomalies or sudden spikes
- Correlate temperature and humidity

## Reading Patterns

### Normal Temperature Patterns

**Daily Cycle**:
```
Temp (°C)
30 |     /\
25 |    /  \
20 |___/    \___
   6am  12pm  6pm
```
- Rises during day (people, activity)
- Peaks afternoon (2-4 PM)
- Drops overnight
- Smooth curves

**Stable Environment**:
```
Temp (°C)
25 |____________
   12h   24h   36h
```
- Flat or minor variation
- Indicates good HVAC control
- Consistent load

### Abnormal Temperature Patterns

**Cooling Failure**:
```
Temp (°C)
40 |        ___
30 |      /
20 |_____/
   Start  1h  2h
```
- Sharp upward spike
- No recovery
- Immediate action needed

**Gradual Overheating**:
```
Temp (°C)
35 |         __
30 |      __
25 |   __
20 |__
   1d  2d  3d
```
- Slow increase over days
- Cooling capacity declining
- Plan maintenance

**Sensor Malfunction**:
```
Temp (°C)
40 |  __  __
30 | |  ||  |
20 ||  ||  ||
   1h 2h 3h
```
- Erratic readings
- Impossible fluctuations
- Check sensor hardware

### Humidity Patterns

**Normal Humidity**:
- Relatively stable (±5%)
- Minor daily variations
- Gradual changes only

**Concerning Humidity**:
- Sudden spikes (>10% in 1 hour)
- Sustained above 60%
- Wild fluctuations
- Inverse correlation with temp (unusual)

## Chart Interactions

### Hover Tooltips

**Desktop**:
1. Move mouse over chart
2. Tooltip appears with:
   - Exact timestamp
   - Temperature value
   - Humidity value
3. Follows cursor

**Mobile**:
- Tap and hold on data point
- Tooltip appears
- Release to dismiss

### Time Range Selection

**Sensor Detail Page**:
- Three buttons: "1 Hour", "24 Hours", "7 Days"
- Click to change displayed range
- Active button highlighted
- Chart re-renders with new data

**Effect on Chart**:
- 1h: Highly detailed, many points
- 24h: Moderate detail, daily patterns visible
- 7d: Sampled data, weekly trends

### Legend Interaction

**Desktop Charts**:
- Click legend item (Temperature/Humidity)
- Hides/shows that data series
- Useful for focusing on one metric
- Click again to restore

## Comparative Analysis

### Multiple Sensors

**On Dashboard**:
1. View bar chart
2. Compare heights of bars
3. Identify which sensors are hottest/coolest
4. Investigate outliers

**Questions to Ask**:
- Why is one sensor 5°C hotter?
- Are sensors in same room similar?
- Is one sensor closer to heat source?

### Temperature vs Humidity

**Look For**:
- Inverse relationship (temp up, humidity down)
- Correlated changes (both rising together)
- Independent variation

**Typical Patterns**:
- Temp ↑ Humidity ↓: Normal (hot air holds more moisture)
- Both ↑: External humidity source (leak, weather)
- Both ↓: Dry, cool conditions

## Alert Correlation

### Chart Context for Alerts

When alert triggers:
1. Go to sensor detail page
2. View chart leading up to alert
3. Identify:
   - Gradual buildup vs sudden spike
   - Time of day pattern
   - Related humidity change

### Root Cause Analysis

**Example**: Temperature alert at 2 PM

**Chart Shows**:
- Gradual rise since 10 AM
- Humidity stable
- Previous days had same pattern

**Conclusion**: Insufficient cooling during peak hours

**Action**: Increase HVAC capacity or cooling schedule

## Performance Indicators

### Healthy System

**Charts Show**:
- Smooth lines (no jagged edges)
- Predictable daily cycles
- All sensors within 3°C of each other
- Humidity 40-50% stable
- No alerts

### Warning Signs

**Charts Show**:
- Increasing baseline over days
- One sensor diverging from others
- Erratic, noisy data
- Humidity climbing
- Frequent threshold breaches

## Best Practices

### Regular Review

- Check dashboard daily
- Review sensor detail pages weekly
- Compare week-over-week trends
- Investigate any changes in patterns

### Pattern Recognition

- Learn your normal baseline
- Document expected daily cycles
- Note seasonal variations
- Set expectations for "normal"

### Documentation

- Screenshot abnormal patterns
- Note dates of significant events
- Correlate with facility changes
- Build historical knowledge base

## Troubleshooting Charts

### Chart Not Loading

**Symptoms**: Blank chart area or loading spinner

**Solutions**:
- Refresh page
- Check internet connection
- Verify backend API is running
- Look for JavaScript errors in console

### No Data Points

**Symptoms**: Empty chart with axes

**Causes**:
- Sensor not publishing data
- Time range has no readings
- BigQuery ingestion issue

**Solutions**:
- Verify sensor is online
- Select different time range
- Check BigQuery table for data

### Choppy/Jagged Lines

**Normal**: Actual sensor variation
**Abnormal**: Chart rendering issue, refresh page

## Next Steps

- [View Sensor Data](viewing-data.md)
- [Data Analytics Features](../features/data-analytics.md)
- [Configure Alerts](configuring-alerts.md)

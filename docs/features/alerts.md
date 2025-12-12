# Alerts

The alert system automatically detects when environmental conditions exceed safe thresholds and notifies you immediately.

## Alert Types

### Temperature Alerts

**Triggered when**: Temperature exceeds maximum threshold
**Default Threshold**: 50°C
**Icon**: Thermometer (orange)
**Severity**: High - can damage equipment

### Humidity Alerts

**Triggered when**: Humidity exceeds maximum threshold  
**Default Threshold**: 50%
**Icon**: Droplet (blue)
**Severity**: Medium - can cause condensation issues

## How Alerts Work

### Detection Pipeline

```
Sensor Reading → Pub/Sub → Alert Detection Function → Check Thresholds → Pub/Sub (alerts) → Database → Dashboard
```

1. Sensor publishes reading to gateway
2. Gateway publishes to `data` Pub/Sub topic
3. Alert Detection Cloud Function receives message
4. Function checks if temp > max_temperature OR humidity > max_humidity
5. If exceeded, publishes alert to `alerts` Pub/Sub topic
6. Alert Subscriber Function stores alert in PostgreSQL
7. Frontend displays alert on dashboard and alerts page

### Alert States

**Unacknowledged** (Active):
- Requires immediate attention
- Shown in "Active Alerts" section
- Counted in dashboard statistics
- Highlighted with colored background

**Acknowledged**:
- User has reviewed the alert
- Moved to "Alert History"
- No longer counted as active
- Shows checkmark icon

## Viewing Alerts

### Dashboard - Recent Alerts

- Shows 6 most recent alerts
- Click "View All" to see complete list
- Click any alert card to go to Alerts page

### Alerts Page

Navigate to **Alerts** in sidebar to access:

#### Active Alerts Section
- All unacknowledged alerts
- Count displayed prominently
- Color-coded by type (orange/blue)
- "Acknowledge" button for each alert

#### Alert History Section  
- Last 20 alerts (includes acknowledged)
- Chronological order (newest first)
- Shows which alerts have been acknowledged
- Sensor name lookup for each alert

## Alert Information

Each alert displays:

- **Sensor Name**: Which sensor triggered the alert
- **Alert Type**: Temperature or Humidity
- **Message**: Descriptive text (e.g., "High temperature detected")
- **Timestamp**: When the alert was triggered
- **Status**: Acknowledged or not

## Managing Alerts

### Acknowledging Alerts

**Purpose**: Mark that you've seen and are addressing the alert

**Steps**:
1. Go to Alerts page
2. Find the alert in "Active Alerts" section
3. Click **Acknowledge** button
4. Alert moves to history with checkmark

**Effect**:
- Removed from active count
- No longer highlighted
- Archived in history

### Configuring Thresholds

**Location**: Settings page

**Steps**:
1. Navigate to **Settings** in sidebar
2. Adjust "Maximum Temperature" slider or input
3. Adjust "Maximum Humidity" slider or input
4. Click **Save Settings**

**Default Values**:
- Max Temperature: 50°C
- Max Humidity: 50%

**Recommendations**:
- Server rooms: 18-27°C, 40-60% humidity
- Storage: 15-25°C, 30-50% humidity
- Customize based on equipment specifications

## Auto-Refresh

- Alerts page refreshes every 30 seconds
- New alerts appear automatically
- No manual refresh needed

## Empty States

### No Active Alerts

**Display**: Green checkmark icon with "All Clear" message
**Meaning**: All environmental conditions within safe limits

### No Alert History  

**Display**: "No alert history" message
**Meaning**: No alerts have been triggered yet

## Alert Notifications

!!! note "Future Feature"
    Email and SMS notifications are planned for future releases. Currently, alerts are only visible in the web dashboard.

## Best Practices

### Regular Monitoring

- Check Alerts page daily
- Acknowledge alerts after investigating
- Track patterns in alert frequency
- Adjust thresholds if too many false positives

### Investigation

When alert triggers:
1. Check affected sensor's detail page
2. Look for trends leading up to alert
3. Verify sensor is reporting correctly
4. Inspect physical environment
5. Take corrective action (e.g., adjust cooling)
6. Acknowledge alert after resolution

### Threshold Tuning

- Start with conservative (lower) thresholds
- Monitor for false positives
- Gradually adjust based on normal operating conditions
- Set different thresholds per customer (not per sensor)

## Troubleshooting

### Alerts Not Triggering

**Check**:
1. Verify Alert Detection Cloud Function is deployed
2. Confirm function has correct threshold environment variables
3. Check Pub/Sub `data` topic has messages
4. Review Cloud Function logs for errors

### Too Many Alerts

**Solutions**:
1. Increase thresholds in Settings
2. Investigate environmental issues
3. Check sensor calibration
4. Fix cooling/HVAC problems

### Can't Acknowledge Alert

**Possible Causes**:
- Network error
- Backend unavailable
- Permissions issue

**Solutions**:
- Refresh page and try again
- Check browser console for errors
- Verify you're logged in

## Technical Details

### Database Schema

```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,  -- 'temperature' or 'humidity'
    message TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE
);
```

### API Endpoints

- `GET /api/v1/alerts/active` - Get unacknowledged alerts
- `GET /api/v1/alerts/history` - Get all alerts (limit 50)
- `POST /api/v1/alerts/{alert_id}/acknowledge` - Mark as acknowledged
- `GET /api/v1/alerts/thresholds/{customer_id}` - Get thresholds
- `POST /api/v1/alerts/thresholds/{customer_id}` - Update thresholds

## Next Steps

- [Configure Alert Thresholds](../user-guide/../user-guide/configuring-alerts.md)
- [Understand Data Analytics](data-analytics.md)
- [API Reference: Alerts](../api-reference/alerts.md)

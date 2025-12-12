# Configuring Alerts

Set custom thresholds to receive alerts when environmental conditions exceed safe limits.

## Overview

Alert thresholds determine when GreenCop triggers notifications. Configure these based on your equipment specifications and environmental requirements.

## Accessing Settings

1. Log into GreenCop dashboard
2. Click **Settings** in the sidebar
3. Navigate to "Alert Configuration" section

## Threshold Configuration

### Maximum Temperature

**Purpose**: Alert when any sensor reports temperature above this value

**Default**: 50°C

**Recommended Ranges**:
- Standard server rooms: 25-27°C
- High-density computing: 27-30°C
- Storage facilities: 20-25°C
- Safety maximum: 35-40°C

**Setting the Threshold**:
1. Find "Maximum Temperature" input/slider
2. Enter desired value (in Celsius)
3. Value applies to ALL sensors in your account
4. Click "Save Settings"

### Maximum Humidity

**Purpose**: Alert when relative humidity exceeds this percentage

**Default**: 50%

**Recommended Ranges**:
- Standard server rooms: 40-50%
- Precision equipment: 45-55%
- General storage: 30-60%
- Safety maximum: 60-70%

**Setting the Threshold**:
1. Find "Maximum Humidity" input/slider
2. Enter desired percentage (0-100)
3. Applies globally across account
4. Click "Save Settings"

## How Thresholds Work

### Detection Logic

```
IF temperature > max_temperature THEN create_alert("temperature")
IF humidity > max_humidity THEN create_alert("humidity")
```

### Alert Flow

1. Sensor publishes reading to gateway
2. Gateway sends to Pub/Sub `data` topic
3. Alert Detection Cloud Function receives message
4. Function compares values to your thresholds
5. If exceeded, publishes to `alerts` Pub/Sub topic
6. Alert Subscriber stores alert in database
7. Dashboard displays alert immediately

### Checking Frequency

- Every sensor reading is checked
- Typical frequency: Every 30 seconds per sensor
- No delay between threshold breach and alert

## Customization

### Per-Customer Thresholds

- Each customer account has own threshold settings
- All sensors under that account use same thresholds
- No per-sensor or per-room thresholds (yet)

### Future Enhancements

Planned features:
- Per-sensor threshold overrides
- Per-room threshold groups
- Time-based thresholds (different limits for day/night)
- Rate-of-change alerts (rapid temperature increase)
- Low threshold alerts (temperature too cold)

## Best Practices

### Setting Appropriate Thresholds

**Too Low**:
- Results in excessive false alarms
- Alert fatigue (ignoring real issues)
- Wasted investigation time

**Too High**:
- Miss early warning signs
- Equipment damage before alert
- SLA violations

**Just Right**:
- Start conservative (lower than absolute max)
- Monitor for false positives
- Gradually tune based on actual conditions
- Set 2-5°C below equipment max spec

### Example Scenarios

**Scenario 1: Standard Office Server Room**
- Max Temp: 27°C (equipment rated to 35°C)
- Max Humidity: 55% (equipment rated to 80%)
- Reasoning: 8°C safety margin

**Scenario 2: High-Performance Computing**
- Max Temp: 30°C (equipment generates more heat)
- Max Humidity: 45% (tighter control needed)
- Reasoning: Balanced for performance vs safety

**Scenario 3: Archive Storage**
- Max Temp: 22°C (preserve media longevity)
- Max Humidity: 40% (prevent moisture damage)
- Reasoning: Preservation-focused

## Testing Thresholds

### Verification Steps

1. Set test thresholds (e.g., 20°C)
2. Wait for sensor reading above threshold
3. Verify alert appears in dashboard
4. Check alert timing (should be near-instant)
5. Acknowledge alert
6. Reset to production thresholds

### Simulating Alerts

!!! warning
    Physically heating sensor may damage it

**Safe Methods**:
- Temporarily lower threshold
- Wait for natural temperature variation
- Use test sensor in controlled environment

## Updating Thresholds

### When to Adjust

- Seasonal changes (summer/winter different norms)
- Equipment upgrades (new specs)
- After false positive patterns
- Regulatory requirement changes
- SLA updates

### How to Update

1. Navigate to Settings page
2. Modify temperature and/or humidity values
3. Click **Save Settings**
4. Confirmation message appears
5. New thresholds active immediately

**Effect**: Next sensor reading uses new thresholds

## Troubleshooting

### Thresholds Not Saving

**Symptoms**: Click save but values revert

**Solutions**:
- Check browser console for errors
- Verify you're logged in
- Ensure values are valid numbers
- Check network connection

### Alerts Still Using Old Thresholds

**Symptoms**: Alert triggers at old threshold value

**Causes**:
- Alert Detection Function has cached environment variables
- Function not redeployed after threshold change

**Solutions**:
- Wait 1-2 minutes for function cold start
- Trigger new sensor reading
- Redeploy Cloud Function with new env vars

### No Alerts Triggering

**Symptoms**: Values exceed threshold but no alerts

**Checks**:
1. Verify Alert Detection Function is deployed
2. Check function environment variables
3. Confirm Pub/Sub topics exist
4. Review Cloud Function logs
5. Ensure Alert Subscriber is running

## Advanced Configuration

### Via Environment Variables

For Cloud Function deployment:

```bash
# Alert Detection Function
MAX_ALLOWED_TEMP=50.0
MAX_ALLOWED_HUMIDITY=50.0
ALERT_TOPIC=alerts
PROJECT_ID=your-project
```

### Via API

**Get Thresholds**:
```bash
GET /api/v1/alerts/thresholds/{customer_id}
```

**Update Thresholds**:
```bash
POST /api/v1/alerts/thresholds/{customer_id}
{
  "max_temperature": 28.0,
  "max_humidity": 55.0
}
```

## Next Steps

- [View and Manage Alerts](../features/alerts.md)
- [Understand Alert System](../advanced/cloud-functions.md)
- [API Reference: Alerts](../api-reference/alerts.md)

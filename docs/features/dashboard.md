# Dashboard

The GreenCop dashboard provides a comprehensive overview of your entire IoT monitoring system, displaying real-time statistics, sensor readings, environmental trends, and recent alerts all in one place.

## Overview

The dashboard is the first page you see after logging into GreenCop. It aggregates data from all your sensors and presents it in an easy-to-understand format with interactive charts and statistics cards.

## Key Components

### Statistics Cards

Four main statistics are displayed at the top of the dashboard:

#### 1. Total Rooms
- **Icon**: Server (blue)
- **Display**: Count of all server rooms in your account
- **Purpose**: Quick overview of how many locations you're monitoring

#### 2. Active Sensors
- **Icon**: Activity (green)
- **Display**: Total number of registered sensors across all rooms
- **Purpose**: Monitor your sensor fleet size

#### 3. Active Alerts
- **Icon**: Alert Triangle (red)
- **Display**: Number of unacknowledged alerts
- **Purpose**: Immediate visibility into issues requiring attention
- **Action**: Click to navigate to the Alerts page

#### 4. Average Temperature
- **Icon**: Thermometer (orange)
- **Display**: Average temperature across all sensors
- **Purpose**: Overall environmental health indicator
- **Format**: Displayed in degrees Celsius with one decimal place

## Charts

### Temperature & Humidity Chart (Bar Chart)

**Type**: Grouped Bar Chart
**Location**: Left side of charts section
**Purpose**: Compare current readings across all sensors

**Features**:
- Each sensor shown as a group of two bars
- Orange bars: Temperature (°C)
- Blue bars: Humidity (%)
- Responsive design adapts to screen size
- Interactive tooltips on hover

**Data**:
- Shows latest reading for each sensor
- Auto-refreshes when new data arrives
- Sensor names displayed on X-axis

**Use Cases**:
- Identify sensors with abnormal readings
- Compare conditions across different rooms
- Quick visual scan of entire system

### Historical Trends Chart (Line Chart)

**Type**: Multi-Line Chart
**Location**: Right side of charts section
**Purpose**: Visualize temperature and humidity trends over time

**Features**:
- Orange line: Temperature trend
- Blue line: Humidity trend
- Last 50 data points displayed (from 30-day window)
- Smooth line interpolation
- Interactive tooltips showing exact values
- Time labels on X-axis

**Data**:
- Based on data from the first sensor in your account
- Automatically updates every few minutes
- Shows patterns and anomalies over time

**Use Cases**:
- Identify daily temperature cycles
- Detect gradual environmental changes
- Spot cooling system failures
- Plan maintenance based on trends

## Recent Alerts Section

**Location**: Bottom of dashboard
**Title**: "Recent Alerts" with alert icon
**Purpose**: Quick access to the 6 most recent alerts

### Alert Cards

Each alert displays:

- **Icon**: Thermometer (temperature alerts) or Droplets (humidity alerts)
- **Background**: Orange for temperature, blue for humidity
- **Message**: Description of the alert condition
- **Timestamp**: When the alert was triggered
- **Status**: Checkmark if acknowledged

**Interactions**:
- Click any alert card to navigate to the full Alerts page
- Hover effect highlights the card

### Empty State

If no alerts exist:
- Alert triangle icon (gray)
- "No recent alerts" message
- Clean, minimalist display

## Loading States

The dashboard handles loading gracefully:

- **Initial Load**: "Loading..." placeholders in stat cards
- **Data Fetch**: Spinner or loading message
- **Charts**: "Loading historical data..." message
- **No Data**: Helpful empty states with call-to-action buttons

## Empty States

### No Sensors

**Display when**: No sensors are registered

**Content**:
- Activity icon (large, gray)
- "No Sensor Data" heading
- "Register sensors to start monitoring" message
- **Button**: "Go to Sensors" - navigates to sensor registration

### No Rooms

**Condition**: User has no server rooms created

**Result**: Some features may not be fully functional

**Action**: Encouraged to create rooms via the Rooms page

## Data Refresh

### Automatic Updates

- Dashboard data is fetched on component mount
- Refetches when rooms data changes
- Real-time updates for actively displayed sensors

### Manual Refresh

- Refresh browser page to force data reload
- Navigate away and back to trigger re-fetch

## Responsive Design

### Desktop View (>1024px)
- 4 stat cards in a single row
- 2 charts side-by-side
- 3 columns for recent alerts

### Tablet View (768-1024px)
- 2 stat cards per row (2 rows total)
- 2 charts side-by-side
- 2 columns for recent alerts

### Mobile View (<768px)
- 1 stat card per row (4 rows)
- Charts stacked vertically
- 1 column for recent alerts

## Quick Actions

From the dashboard, you can quickly navigate to:

- **Sensors Page**: Click "Go to Sensors" button (in empty state)
- **Alerts Page**: Click "View All" button in Recent Alerts section
- **Individual Alert**: Click any alert card

## Performance

### Optimization Features

- Sensors fetched in parallel for all rooms
- Latest data fetched for all sensors simultaneously
- Historical data limited to last 50 points
- Charts rendered only when data is available
- Error handling prevents entire dashboard from failing

### Loading Time

- Initial load: 2-5 seconds (depends on sensor count)
- Data refresh: 1-2 seconds
- Chart render: < 1 second

## Best Practices

### For Optimal Dashboard Experience

1. **Create Rooms First**: Organize sensors into logical rooms
2. **Register Sensors**: Add sensors to see data on dashboard
3. **Monitor Regularly**: Check dashboard daily for anomalies
4. **Investigate Alerts**: Click alerts to acknowledge and investigate
5. **Compare Trends**: Use historical chart to spot patterns

### Interpreting the Dashboard

**Normal Conditions**:
- Average temperature: 18-25°C
- Active alerts: 0
- Trend lines relatively stable
- All sensors showing data

**Warning Signs**:
- Average temperature > 30°C
- Active alerts > 0
- Trend lines sharply increasing
- Missing data from sensors

## Troubleshooting

### Dashboard Not Loading

**Cause**: Network error or backend unavailable

**Solution**:
1. Check internet connection
2. Verify backend is running
3. Check browser console for errors
4. Try refreshing the page

### No Data Showing

**Cause**: No sensors registered or no sensor data

**Solution**:
1. Go to Sensors page and register sensors
2. Ensure ESP32 devices are connected
3. Check that sensors are publishing data
4. Verify gateway is receiving messages

### Charts Not Rendering

**Cause**: Insufficient data or data format issue

**Solution**:
1. Wait for sensors to publish more readings
2. Check that at least one sensor has historical data
3. Ensure BigQuery contains sensor data
4. Check browser console for JavaScript errors

### Incorrect Average Temperature

**Cause**: Calculation includes sensors without recent data

**Solution**:
- Average only includes sensors with valid readings
- Check individual sensors for data freshness
- Remove or fix non-reporting sensors

## Next Steps

- [Manage Server Rooms](../user-guide/managing-rooms.md)
- [Register Sensors](../user-guide/managing-sensors.md)
- [Configure Alerts](../user-guide/configuring-alerts.md)
- [View Sensor Details](../user-guide/viewing-data.md)

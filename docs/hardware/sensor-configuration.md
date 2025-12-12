# Sensor Configuration

Configure ESP32 sensors for your environment.

## Configuration File

**Location**: `services/sensors/hardware/config.py`

```python
WIFI_SSID = "your-wifi-network"
WIFI_PASSWORD = "your-password"
```

## Main Script Settings

**Location**: `services/sensors/hardware/main.py`

```python
class CONFIG:
    SERVER_HOST_NAME = "greencop-gateway.local"  # mDNS hostname
    SERVER_PORT = 8080
```

## Auto-Registration

Sensor automatically:
1. Connects to WiFi
2. Discovers gateway via mDNS
3. Registers with unique hardware ID
4. Starts publishing data

No manual registration needed!

## Next Steps
- [Troubleshooting](troubleshooting.md)
- [Hardware Specifications](specifications.md)

# ESP32 Setup Guide

Complete guide to setting up ESP32 sensor nodes.

## Hardware Requirements

- ESP32 development board
- USB cable (for programming)
- DHT11 or DHT22 sensor (optional - code uses random data)
- 2x LEDs (green and red)
- 2x 220Ω resistors
- Breadboard and jumper wires

## Pin Connections

- **GPIO 5**: Green LED (+ resistor) → Data publishing indicator
- **GPIO 4**: Red LED (+ resistor) → Error indicator
- **GND**: Common ground for LEDs

## Software Setup

### 1. Install MicroPython

Download firmware:
```bash
wget https://micropython.org/resources/firmware/ESP32_GENERIC-20240222-v1.22.2.bin
```

Flash to ESP32:
```bash
esptool.py --port /dev/ttyUSB0 erase_flash
esptool.py --port /dev/ttyUSB0 write_flash -z 0x1000 ESP32_GENERIC-20240222-v1.22.2.bin
```

### 2. Upload Sensor Code

Files to upload:
- `services/sensors/hardware/main.py`
- `services/sensors/hardware/config.py`

Using ampy:
```bash
pip install adafruit-ampy
ampy --port /dev/ttyUSB0 put config.py
ampy --port /dev/ttyUSB0 put main.py
```

### 3. Configure WiFi

Edit `config.py`:
```python
WIFI_SSID = "YourWiFiNetwork"
WIFI_PASSWORD = "YourPassword"
```

### 4. Start Sensor

Reboot ESP32 or run:
```python
import main
```

## LED Indicators

- **Green Blinking**: Publishing sensor data
- **Red Flash**: Error (network, gateway unreachable)
- **Both Off**: Idle or not configured

## Troubleshooting

### Can't Connect to WiFi
- Verify SSID and password in config.py
- Check 2.4GHz network (ESP32 doesn't support 5GHz)
- Ensure router allows new devices

### Can't Find Gateway
- Verify gateway is running
- Check ESP32 on same network
- Test mDNS: `ping greencop-gateway.local`

### Red LED Always On
- Gateway unreachable
- Network error
- Check serial output for details

## Next Steps
- [Sensor Configuration](sensor-configuration.md)
- [Gateway Setup](../getting-started/architecture-update.md)

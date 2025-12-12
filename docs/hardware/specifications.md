# Hardware Specifications

Technical specifications for ESP32 sensor nodes.

## ESP32 Microcontroller

- **Processor**: Xtensa dual-core 32-bit LX6
- **Clock Speed**: Up to 240 MHz
- **WiFi**: 802.11 b/g/n (2.4 GHz)
- **Flash**: 4 MB
- **RAM**: 520 KB SRAM
- **Power**: 3.3V, 160-260mA active

## Supported Sensors

- **DHT11**: ±2°C, ±5% RH
- **DHT22**: ±0.5°C, ±2% RH
- **Other**: Any I2C/SPI environmental sensor

## Power Requirements

- **Voltage**: 5V USB or 3.3V regulated
- **Current**: 200mA average, 400mA peak
- **Battery**: Can run on LiPo with regulator

## Network

- **Protocol**: WiFi 2.4GHz
- **Discovery**: mDNS
- **Communication**: HTTP/JSON

## Next Steps
- [ESP32 Setup Guide](esp32-setup.md)

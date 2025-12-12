# Hardware Troubleshooting

Common ESP32 sensor issues and solutions.

## Connection Issues

### WiFi Won't Connect
**Check**: SSID and password in config.py
**Check**: 2.4GHz network (not 5GHz)
**Solution**: Reset ESP32, reflash firmware if needed

### Gateway Not Found
**Check**: Gateway running and broadcasting mDNS
**Check**: Same network as gateway
**Solution**: Use hardcoded IP as fallback

## LED Indicators

- Green blinking: Normal operation
- Red flash: Error condition
- Both off: Not running or powered off

## Data Issues

### No Data in Dashboard
**Check**: Sensor publishing (green LED)
**Check**: Gateway receiving messages
**Check**: BigQuery ingestion working

### Erratic Readings
**Check**: Sensor hardware connections
**Solution**: Replace DHT sensor

## Next Steps
- [ESP32 Setup](esp32-setup.md)
- [Gateway Troubleshooting](../getting-started/architecture-update.md)

# Sensors API

Manage ESP32 sensor registration and metadata.

## Endpoints

### Create Sensor
**POST** `/api/v1/sensors/new_sensor`

**Body**:
```json
{
  "id": "sensor001",
  "name": "Rack 1 Sensor",
  "type": "ESP32",
  "room_id": 1
}
```

### List Sensors by Room
**GET** `/api/v1/sensors/list_sensors/{room_id}`

### Get Sensor
**GET** `/api/v1/sensors/sensor/{sensor_id}`

### Delete Sensor
**DELETE** `/api/v1/sensors/delete_sensor/{sensor_id}`

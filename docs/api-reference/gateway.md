# Gateway API

Local Go gateway service endpoints for ESP32 sensor node communication.

## Overview

The gateway service runs locally on your network and provides HTTP endpoints for ESP32 sensors to:
- Register themselves
- Publish sensor data
- Send heartbeat health checks
- List registered nodes

**Base URL**: `http://greencop-gateway.local:8080` (via mDNS)

**Alternative**: `http://<gateway-ip>:8080` (direct IP)

**Technology**: Go HTTP server

**Location**: `/services/sensors/software/`

## Endpoints

### Register Node

Register a new ESP32 sensor node with the gateway.

**Endpoint**: `POST /api/v1/register`

**Authentication**: None (local network only)

**Request Body**:
```json
{
  "node_id": "20e7c89f14ec",
  "ip_addr": "192.168.1.42"
}
```

**Fields**:
- `node_id` (string): Unique hardware ID from ESP32
- `ip_addr` (string): ESP32's IP address on local network

**Success Response** (201 Created):
```json
{
  "message": "Node registered successfully",
  "node_id": "20e7c89f14ec"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Invalid request body"
}
```

**Example cURL**:
```bash
curl -X POST http://greencop-gateway.local:8080/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "20e7c89f14ec",
    "ip_addr": "192.168.1.42"
  }'
```

**ESP32 Implementation**:
```python
# From /services/sensors/hardware/main.py
payload = {
    "node_id": self.node_id,
    "ip_addr": node_ip,
}
res = requests.post(
    f"http://{server_ip}:{self.port}/api/v1/register",
    json=payload
)
```

**What Happens**:
1. Gateway receives registration
2. Stores node in manager's in-memory registry
3. Node marked as registered and online
4. Returns success confirmation

---

### Publish Message

Send temperature and humidity readings to the gateway.

**Endpoint**: `POST /api/v1/message`

**Authentication**: None (local network only)

**Request Body**:
```json
{
  "id": "abc123def456",
  "node_id": "20e7c89f14ec",
  "temperature": 25.3,
  "humidity": 45.2
}
```

**Fields**:
- `id` (string): Unique message ID
- `node_id` (string): Sensor's hardware ID
- `temperature` (float): Temperature in Celsius
- `humidity` (float): Relative humidity percentage

**Success Response** (200 OK):
```json
{
  "status": "published",
  "message_id": "abc123def456"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Invalid message format"
}
```

500 Internal Server Error:
```json
{
  "error": "Failed to publish to Pub/Sub"
}
```

**Example cURL**:
```bash
curl -X POST http://greencop-gateway.local:8080/api/v1/message \
  -H "Content-Type: application/json" \
  -d '{
    "id": "abc123",
    "node_id": "20e7c89f14ec",
    "temperature": 25.3,
    "humidity": 45.2
  }'
```

**ESP32 Implementation**:
```python
# Generates random message ID and sensor data
message = bytes([urandom.getrandbits(8) for _ in range(4)])
msg_id = ubinascii.hexlify(message).decode()
payload = {
    "id": msg_id,
    "node_id": self.node_id,
    "temperature": random.uniform(20, 60),
    "humidity": random.uniform(30, 60),
}
res = requests.post(
    f"http://{server_ip}:{self.port}/api/v1/message",
    json=payload
)
```

**What Happens**:
1. Gateway receives sensor data
2. Validates message format
3. Publishes to Google Cloud Pub/Sub `data` topic
4. Returns success confirmation
5. Cloud Functions process the published message

---

### Heartbeat

Health check endpoint for sensor nodes to confirm they're online.

**Endpoint**: `POST /api/v1/heartbeat`

**Authentication**: None (local network only)

**Request Body**:
```json
{
  "node_id": "20e7c89f14ec"
}
```

**Fields**:
- `node_id` (string): Sensor's hardware ID

**Success Response** (200 OK):
```json
{
  "status": "alive",
  "node_id": "20e7c89f14ec",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Example cURL**:
```bash
curl -X POST http://greencop-gateway.local:8080/api/v1/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "20e7c89f14ec"
  }'
```

**ESP32 Implementation**:
```python
payload = {
    "node_id": self.node_id,
}
res = requests.post(
    f"http://{server_ip}:{self.port}/api/v1/heartbeat",
    json=payload
)
```

**What Happens**:
1. Gateway receives heartbeat
2. Updates node's last-seen timestamp
3. Marks node as healthy/alive
4. Returns acknowledgment

**Frequency**: ESP32 sends heartbeat between each sensor reading (typically every 30-60 seconds)

---

### List Nodes

Retrieve list of all registered sensor nodes.

**Endpoint**: `GET /api/v1/nodes`

**Authentication**: None (local network only)

**Request**: No body required

**Success Response** (200 OK):
```json
{
  "nodes": [
    {
      "node_id": "20e7c89f14ec",
      "ip_addr": "192.168.1.42",
      "registered_at": "2025-01-15T10:00:00Z",
      "last_seen": "2025-01-15T10:30:00Z",
      "status": "online"
    },
    {
      "node_id": "f0a1b2c3d4e5",
      "ip_addr": "192.168.1.43",
      "registered_at": "2025-01-15T09:45:00Z",
      "last_seen": "2025-01-15T10:29:55Z",
      "status": "online"
    }
  ],
  "total": 2
}
```

**Example cURL**:
```bash
curl -X GET http://greencop-gateway.local:8080/api/v1/nodes
```

**Use Cases**:
- Debugging: See all registered sensors
- Monitoring: Check which nodes are online
- Administration: Verify network setup

---

## mDNS Discovery

### How ESP32 Finds Gateway

ESP32 sensors use mDNS to discover the gateway automatically:

```python
# config.py constant
SERVER_HOST_NAME = "greencop-gateway.local"

# Resolve via mDNS
addr_info = usocket.getaddrinfo(hostname, port)
server_ip = addr_info[0][-1][0]
# Returns actual IP like "192.168.1.100"
```

**Benefits**:
- No hardcoded IP addresses
- Works across DHCP changes
- Zero-configuration setup
- Automatic service discovery

**Gateway Broadcast Details**:
- Service Name: `greencop-gateway`
- Service Type: `_http._tcp`
- Hostname: `greencop-gateway.local`
- Port: `8080`

## Data Flow

```
ESP32 Sensor
    ↓ (1) Resolve mDNS hostname
gateway IP = 192.168.1.100
    ↓ (2) Register node
POST /api/v1/register
    ↓ (3) Publish sensor data
POST /api/v1/message
    ↓ (4) Send heartbeat
POST /api/v1/heartbeat

Gateway (Go Service)
    ↓ (5) Publish to Pub/Sub
Google Cloud Pub/Sub "data" topic
    ↓ (6) Trigger Cloud Functions
Data Ingestion + Alert Detection
```

## Error Handling

### Connection Failures

**ESP32 Behavior**:
- Retries registration up to 5 times
- Reconnects to WiFi if needed
- LED indicators show error state (red LED)
- Continues attempting to send messages

**Gateway Behavior**:
- Logs failed Pub/Sub publishes
- Returns 500 error to sensor
- Sensor will retry on next reading cycle

### Network Issues

**mDNS Resolution Fails**:
```python
# ESP32 falls back or retries
try:
    server_ip = resolve_host()
except Exception as e:
    print(f"Cannot resolve gateway: {e}")
    # Wait and retry
```

**Gateway Unreachable**:
- ESP32 LED shows red error
- Sensor continues trying
- Data accumulates in sensor (not persisted)
- Publishes when connection restored

## Security Notes

**Local Network Only**:
- Gateway intended for same network as sensors
- No authentication on gateway endpoints
- Relies on network isolation for security

**Production Considerations**:
- Run gateway on trusted network
- Use firewall to restrict access
- Consider VPN for remote sensors
- Monitor gateway logs for anomalies

## Running the Gateway

**Development**:
```bash
cd services/sensors/software
go run cmd/main.go
```

**Production** (systemd):
```ini
[Unit]
Description=GreenCop Gateway Service
After=network.target

[Service]
Type=simple
User=greencop
ExecStart=/usr/local/bin/greencop-gateway
Restart=always

[Install]
WantedBy=multi-user.target
```

**Docker**:
```bash
docker build -t greencop-gateway .
docker run -p 8080:8080 --name gateway greencop-gateway
```

## Logging

Gateway uses **zap** logger for structured logging:

**Log Events**:
- Node registrations
- Message publishes
- Heartbeat receivals
- mDNS broadcasting status
- Pub/Sub publish errors

**Example Log Output**:
```
INFO mDNS broadcasting hostname=greencop-gateway.local
INFO Node registered node_id=20e7c89f14ec ip=192.168.1.42
INFO Message published node_id=20e7c89f14ec message_id=abc123
INFO Heartbeat received node_id=20e7c89f14ec
```

## Next Steps

- [ESP32 Setup Guide](../hardware/esp32-setup.md)
- [mDNS Auto-Discovery](../getting-started/architecture-update.md)
- [Backend Development](../development/backend-development.md)

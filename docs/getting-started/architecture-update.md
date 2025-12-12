# Distributed Architecture & Auto-Discovery

## Gateway Service (Go)

### Overview

GreenCop includes a **local gateway service** written in Go that acts as a bridge between ESP32 sensor nodes and the cloud infrastructure. This creates a mini distributed system architecture.

```
ESP32 Sensors (Edge)
       ↓ mDNS Discovery
       ↓ HTTP POST
Go Gateway Service (Local)
       ↓ Pub/Sub Publish
Google Cloud Platform
```

### Gateway Components

**Language**: Go
**Location**: `/services/sensors/software/`

**Key Features**:
- HTTP server on port 8080
- mDNS broadcasting for auto-discovery
- Node registration management
- Message publishing to GCP Pub/Sub
- Heartbeat monitoring
- Logging middleware

### Gateway Endpoints

**POST `/api/v1/register`**
- Register new ESP32 sensor node
- Stores node ID and IP address
- Returns 201 Created on success

**POST `/api/v1/message`**
- Receive sensor data from ESP32
- Publishes to Google Cloud Pub/Sub `data` topic
- Returns 200 OK on success

**POST `/api/v1/heartbeat`**
- Health check from sensor nodes
- Updates last-seen timestamp
- Keeps node marked as alive

**GET `/api/v1/nodes`**
- List all registered nodes
- Shows node IDs and IP addresses
- Admin/debugging endpoint

## mDNS Auto-Discovery

### What is mDNS?

**mDNS** (Multicast DNS) is a protocol that allows devices on a local network to discover each other without DNS servers or hardcoded IP addresses.

**Benefits**:
- No manual IP configuration needed
- Works across DHCP IP changes
- Zero-configuration networking
- Automatic service discovery

### How It Works in GreenCop

#### Gateway Side (Go Service)

**Broadcast Details**:
```go
Service Name: "greencop-gateway"
Service Type: "_http._tcp"
Hostname: "greencop-gateway.local."
Port: 8080
Metadata: "version=1.0"
```

**Implementation**:
1. Gateway starts HTTP server on port 8080
2. Calls `StartDNS()` to initialize mDNS
3. Gets all local non-loopback IPv4 addresses
4. Creates mDNS service with hostname `greencop-gateway.local`
5. Broadcasts presence on local network
6. ESP32 sensors can now find gateway by hostname

**Code Reference**: `/services/sensors/software/internal/gateway/server.go:60-94`

#### ESP32 Side (MicroPython)

**Discovery Process**:
```python
# ESP32 resolves hostname using mDNS
SERVER_HOST_NAME = "greencop-gateway.local"
server_ip = usocket.getaddrinfo(hostname, port)[0][-1][0]
```

**Process**:
1. ESP32 connects to WiFi
2. Uses mDNS to resolve `greencop-gateway.local`
3. Gets gateway's current IP address
4. Makes HTTP requests to that IP
5. No hardcoded IPs needed!

**Code Reference**: `/services/sensors/hardware/main.py:52-54`

## Mini Distributed System

### System Components

```
┌─────────────────────────────────────┐
│         ESP32 Sensor Nodes          │
│  (Distributed Edge Devices)         │
│  - Auto-discover gateway via mDNS   │
│  - Register on startup              │
│  - Publish data periodically        │
│  - Send heartbeats                  │
└──────────────┬──────────────────────┘
               │ HTTP (local network)
               ↓
┌─────────────────────────────────────┐
│      Go Gateway Service             │
│  (Local Coordinator)                │
│  - mDNS broadcasting                │
│  - Node registration                │
│  - Message aggregation              │
│  - Pub/Sub publishing               │
└──────────────┬──────────────────────┘
               │ Pub/Sub
               ↓
┌─────────────────────────────────────┐
│    Google Cloud Platform            │
│  (Cloud Processing & Storage)       │
│  - Event streaming                  │
│  - Data warehouse                   │
│  - Alert detection                  │
└─────────────────────────────────────┘
```

### Distributed System Characteristics

**Edge Layer** (ESP32):
- Autonomous operation
- Self-registration
- Health reporting
- Local data generation

**Coordination Layer** (Go Gateway):
- Service discovery (mDNS)
- Node management
- Message routing
- Cloud integration

**Cloud Layer** (GCP):
- Centralized processing
- Long-term storage
- Analytics
- User interface

### Benefits of This Architecture

**Scalability**:
- Add unlimited ESP32 sensors
- Gateway handles aggregation
- Cloud auto-scales processing

**Resilience**:
- Sensors operate independently
- Gateway acts as buffer
- Pub/Sub ensures reliable delivery

**Flexibility**:
- Easy to add new sensors (just power on)
- No network reconfiguration needed
- Gateway can run anywhere on local network

**Zero-Configuration**:
- ESP32 finds gateway automatically
- No IP address management
- Plug-and-play deployment

## Data Flow Example

### Sensor Startup Sequence

```
1. ESP32 powers on
   └─> Connects to WiFi (from config.py)

2. ESP32 discovers gateway
   └─> Resolves "greencop-gateway.local" via mDNS
   └─> Gets gateway IP (e.g., 192.168.1.100)

3. ESP32 registers with gateway
   └─> POST http://192.168.1.100:8080/api/v1/register
   └─> Payload: {node_id: "20e7c89f14ec", ip_addr: "192.168.1.42"}
   └─> Gateway stores node in memory

4. ESP32 starts publishing
   └─> Generates temperature/humidity data
   └─> POST http://192.168.1.100:8080/api/v1/message
   └─> Gateway publishes to Pub/Sub

5. ESP32 sends heartbeats
   └─> POST http://192.168.1.100:8080/api/v1/heartbeat
   └─> Confirms node is alive
```

### Message Publishing Flow

```
ESP32 Sensor:
  temperature = 25.3°C
  humidity = 45.2%
       ↓
  POST /api/v1/message
  {
    "node_id": "20e7c89f14ec",
    "message_id": "abc123",
    "temperature": 25.3,
    "humidity": 45.2
  }
       ↓
Go Gateway:
  Receives HTTP request
  Validates payload
  Publishes to Pub/Sub "data" topic
       ↓
Google Pub/Sub:
  Distributes message to subscribers:
    - Data Ingestion Function
    - Alert Detection Function
       ↓
Cloud Functions:
  Process message
  Store in BigQuery
  Check thresholds
```

## Running the Gateway

### Local Development

```bash
cd services/sensors/software
go run cmd/main.go
```

**Output**:
```
Starting gateway server on: :8080
mDNS broadcasting: greencop-gateway.local
```

### Production Deployment

**Option 1: Local Server**
- Run on Raspberry Pi or local server
- Must be on same network as ESP32 sensors
- Persistent process (use systemd/supervisor)

**Option 2: Cloud VM**
- Deploy to Compute Engine VM
- Configure VPN for sensor connectivity
- More complex but centralized

## Configuration

### Gateway Environment

```bash
# GCP Project for Pub/Sub
PROJECT_ID=greencop-prod

# Pub/Sub topic for sensor data
DATA_TOPIC=data

# Server port (default: 8080)
PORT=8080
```

### ESP32 Configuration

```python
# config.py
WIFI_SSID = "your-wifi-network"
WIFI_PASSWORD = "your-password"

# main.py
SERVER_HOST_NAME = "greencop-gateway.local"  # mDNS hostname
SERVER_PORT = 8080
```

## Troubleshooting mDNS

### ESP32 Can't Find Gateway

**Symptoms**: `OSError: [Errno 202] EAI_FAIL` when resolving hostname

**Causes**:
- Gateway not running
- Different network segments
- mDNS blocked by firewall
- WiFi isolation mode enabled

**Solutions**:
1. Verify gateway is running and broadcasting
2. Check ESP32 and gateway on same network
3. Disable AP isolation on router
4. Test with `ping greencop-gateway.local` from computer
5. Use hardcoded IP as fallback

### Gateway Not Broadcasting

**Check**:
```bash
# On Linux/Mac
dns-sd -B _http._tcp
# Should show: greencop-gateway._http._tcp

# Or use avahi
avahi-browse -t _http._tcp
```

**Fix**:
- Restart gateway service
- Check firewall allows UDP port 5353 (mDNS)
- Verify network interface has valid IP

## Next Steps

- [ESP32 Hardware Setup](../hardware/esp32-setup.md)
- [Gateway API Details](../api-reference/gateway.md)
- [Development Guide](../development/backend-development.md)

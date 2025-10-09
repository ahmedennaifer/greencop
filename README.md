## GreenCop - WIP (PA)

All-in-one server room management solution combining cloud services with IoT monitoring (Raspberry Pi based sensors).

## What's Built So Far

### Customer Management Service
- Customer registration and authentication (JWT + bcrypt)
- Server room CRUD operations
- **Sensor management API** - Full CRUD operations for sensors
- PostgreSQL database with migrations (Alembic)
- FastAPI REST API
- **Docker containerization** - Ready for deployment

### Sensors IoT Service ✨ NEW
- **Go-based CLI tool** for sensor registration and management
- **Config-driven sensor setup** - YAML configuration for easy deployment
- **HTTP client integration** - Connects to Customer API for sensor registration
- **Cobra CLI framework** - Professional command-line interface
- **Structured logging** - Built-in logging for operations and debugging

### Project Structure
```
greencop/
├── services/
│   ├── customers/          # Customer & server room management + Sensor API
│   ├── sensors/            # ✨ Go CLI for IoT sensor management
│   ├── kafka/              # (empty - planned message streaming)
│   └── ml-pipeline/        # (empty - planned ML training/inference)
├── web/                    # (empty - planned frontend)
└── .github/workflows/      # CI/CD with pytest
```

### Current Architecture
```
┌─────────────────┐    ┌─────────────────┐
│  Customer API   │◄───┤  Sensors CLI    │ ✅ Working
│   (FastAPI)     │    │   (Go/Cobra)    │
│  + Sensor API   │    └─────────────────┘
└─────────────────┘             │
         │                      │
┌─────────────────┐             │
│  PostgreSQL DB  │ ✅ Working  │
│   (customers,   │             │
│   rooms,        │◄────────────┘
│   sensors)      │
└─────────────────┘

┌─────────────────┐
│   Docker        │ ✅ Working
│ Containerization│
└─────────────────┘

[ Kafka Pipeline ]  🚧 Planned
[ ML Services ]     🚧 Planned
[ Web Dashboard ]   🚧 Planned
[ Raspberry Pi ]    🚧 Planned
```

## Core Idea

**Cloud + IoT Solution:**
- Raspberry Pi sensors in server rooms → Kafka streams → ML analysis → Web dashboard
- Predictive maintenance and anomaly detection
- Customer multi-tenancy with room/sensor management

## Tech Stack (Current)
- **Backend APIs:** FastAPI, Python 3.12
- **IoT Service:** Go 1.23+, Cobra CLI
- **Database:** PostgreSQL, SQLAlchemy
- **Auth:** JWT tokens
- **Package Manager:** UV (Python), Go modules
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and start with Docker
git clone <repo>
cd services/customers
docker-compose up --build
# → http://localhost:8080/docs
```

### Option 2: Local Development
```bash
# Setup Python service
git clone <repo>
cd services/customers
uv sync

# Configure database
cp .env.example .env # TODO
# Edit .env with DB credentials

# Run migrations
uv run alembic upgrade head

# Start Customer API
uv run python main.py
# → http://localhost:8080/docs
```

### Sensors CLI Setup
```bash
# Build the sensors CLI
cd services/sensors
go build -o sensors

# Configure sensor (edit config.yaml)
# Then register a sensor
./sensors register --config-file cmd/config.yaml
```

## API Endpoints

### Customer Management
```
POST /api/v1/customers/register
POST /api/v1/customers/login
POST /api/v1/customers/info/{id}
```

### Server Room Management
```
POST /api/v1/server_rooms/new_room
GET  /api/v1/server_rooms/{room_id}
PUT  /api/v1/server_rooms/{room_id}
DELETE /api/v1/server_rooms/{room_id}
```

### Sensor Management ✨ NEW
```
POST /api/v1/sensors/new_sensor
GET  /api/v1/sensors/sensor/{sensor_id}
GET  /api/v1/sensors/list_sensors/{room_id}
PUT  /api/v1/sensors/update_sensor/{sensor_id}
DELETE /api/v1/sensors/delete_sensor/{sensor_id}
```

### Health & Monitoring
```
GET  /health
```

### Sensors CLI Commands ✨ NEW
```bash
./sensors register --config-file <path>  # Register sensor via config
./sensors --help                         # Show available commands
```

## Next Steps
1. **Sensor data collection** - Real sensor readings via CLI
2. **Kafka pipeline** - Stream sensor data for real-time processing
3. **ML analytics** - Predictive maintenance and anomaly detection
4. **Web dashboard** - Real-time monitoring interface
5. **Raspberry Pi integration** - Deploy CLI on IoT devices
6. **Cloud infrastructure** - Production deployment

## Configuration

### Sensor CLI Config (config.yaml)
```yaml
customer:
  new: false          # Use existing customer
  id: 1              # Customer ID

sensor:
  type: "heat"       # Sensor type (heat, humidity, etc.)
  name: "sensor_01"  # Unique sensor name
  room_id: 1         # Target room ID
```

## Development Notes
- **Database models**: Extended with sensor tables and relationships
- **API validation**: Pydantic schemas for sensor operations
- **Error handling**: Comprehensive logging and HTTP error responses
- **CLI architecture**: Modular Go design with Cobra commands
- **Docker ready**: Full containerization for easy deployment

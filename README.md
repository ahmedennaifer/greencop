## GreenCop - WIP (PA)

All-in-one server room management solution combining cloud services with IoT monitoring (Raspberry Pi based sensors).

## What's Built So Far

### Customer Management Service
- Customer registration and authentication (JWT + bcrypt)
- Server room CRUD operations
- PostgreSQL database with migrations (Alembic)
- FastAPI REST API

### Project Structure
```
greencop/
├── services/
│   ├── customers/          # Customer & server room management
│   ├── kafka/              # (empty - planned message streaming)
│   └── ml-pipeline/        # (empty - planned ML training/inference)
├── web/                    # (empty - planned frontend)
└── .github/workflows/      # CI/CD with pytest
```

### Current Architecture
```
┌─────────────────┐
│  Customer API   │ ✅ Working
│   (FastAPI)     │
└─────────────────┘
         │
┌─────────────────┐
│  PostgreSQL DB  │ ✅ Working
│   (with models  │
│   for customers,│
│   rooms, sensors)│
└─────────────────┘

[ Kafka Pipeline ]  🚧 Planned
[ ML Services ]     🚧 Planned
[ Web Dashboard ]   🚧 Planned
[ IoT Integration ] 🚧 Planned
```

## Core Idea

**Cloud + IoT Solution:**
- Raspberry Pi sensors in server rooms → Kafka streams → ML analysis → Web dashboard
- Predictive maintenance and anomaly detection
- Customer multi-tenancy with room/sensor management

## Tech Stack (Current)
- **Backend:** FastAPI, Python 3.12
- **Database:** PostgreSQL, SQLAlchemy
- **Auth:** JWT tokens
- **Package Manager:** UV
- **CI/CD:** GitHub Actions

## Quick Start

```bash
# Setup
git clone <repo>
uv sync

# Configure database
cp .env.example .env # TODO
# Edit .env with DB credentials

# Run migrations
uv run alembic upgrade head

# Start API
cd services/customers
uv run python main.py
# → http://localhost:8080/docs
```

## API Endpoints

```
POST /api/v1/customers/register
POST /api/v1/customers/login
POST /api/v1/customers/info/{id}
POST /api/v1/server_rooms/new_room
GET  /health
```

## Next Steps
1. Kafka setup for sensor data
2. ML pipeline for predictive analytics
3. Web dashboard
4. Raspberry Pi integration for IoT sensors
5. Cloud infra

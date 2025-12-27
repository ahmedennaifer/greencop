# Quick Start Guide

Get GreenCop monitoring your infrastructure in **5 minutes**.

## What You'll Accomplish

By the end of this guide, you'll have:

- ✅ A running GreenCop instance
- ✅ At least one sensor registered
- ✅ Real-time temperature/humidity data streaming
- ✅ Alerts configured for your thresholds

## Prerequisites

- Docker and Docker Compose installed
- Google Cloud Platform account (free tier works)
- 15 minutes of time

!!! tip
    Don't have GCP? No problem. Use our test data generator to explore the dashboard without real sensors. Skip to Step 6 after getting the system running.

## Step 1: Clone and Configure

```bash
git clone https://github.com/ahmedennaifer/greencop.git
cd greencop/services/customers
cp .env.example .env
```

Edit `.env` with your settings:

```bash
DB_URL=postgresql://greencop:greencop@db:5432/greencop
SECRET_KEY=change-this-in-production
GOOGLE_CLOUD_PROJECT=your-project-id  # Optional for local dev
```

!!! tip "First-Time Setup"
    The initial database migration takes ~30 seconds. Grab coffee while it runs.

## Step 2: Start the System

```bash
docker-compose up -d
docker-compose exec app alembic upgrade head
```

**What to Expect**:
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/health
- Startup time: ~60 seconds

## Step 3: Start Gateway & Frontend

**Terminal 1 - Go Gateway**:
```bash
cd services/sensors/software
go run cmd/main.go
```

Gateway broadcasts via mDNS at `greencop-gateway.local`.

**Terminal 2 - Frontend**:
```bash
cd web/frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## Step 4: Create Your Account

Navigate to http://localhost:5173/register

!!! tip
    Use a real email if you want to test alert notifications later. Otherwise, test@example.com works fine for local dev.

**Register with**:
- Email: your@email.com
- Username: 6-12 characters
- Password: 8+ characters, mixed alphanumeric

## Step 5: Add Your First Room

1. Click **Rooms** in sidebar
2. Click **Add Room**
3. Name: "Main Server Room"
4. Click **Create**

!!! tip "Room Strategy"
    Name rooms by physical location (Building A, Floor 2) rather than function (Production Servers). Makes it easier to find the right thermometer when the alert comes in at 2 AM.

## Step 6: Register a Sensor

### Option A: Real ESP32 Hardware

Follow the [ESP32 Setup Guide](../hardware/esp32-setup.md) to deploy physical sensors.

### Option B: Test Data Generator (Recommended for First Run)

Use the API to simulate sensor data:

```bash
# Register a test sensor
curl -X POST http://localhost:8080/api/v1/sensors/new_sensor \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "sensor_id": "TEST-SENSOR-001",
    "position": "Rack 1, Top"
  }'
```

!!! tip
    Start with the test data generator. It simulates realistic sensor patterns including occasional anomalies. Perfect for understanding how alerts work before deploying real hardware.

## Step 7: Verify Data Flow

Within 30 seconds, you should see:

- ✅ Live data on dashboard
- ✅ Temperature/humidity charts populating
- ✅ Sensor status: "Online" with green indicator

## Configure Alerts

1. Click **Settings** in sidebar
2. Set thresholds:
   - Maximum Temperature: 30°C
   - Maximum Humidity: 60%
3. Click **Save**

!!! tip "Alert Threshold Strategy"
    Set hard limits 5°C above your comfort zone for true emergencies. Use ML alerts (once trained) for everything else to reduce noise.

## Troubleshooting

### Backend Won't Start

**Error**: `Connection refused to database`

**Solution**:
```bash
docker-compose ps  # Check if db is running
docker-compose restart db
```

### Frontend Can't Connect

**Error**: `Network Error` or `Failed to fetch`

**Solution**: Verify backend health:
```bash
curl http://localhost:8080/health
# Expected: {"status": "healthy"}
```

### Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed`

**Solution**: Change port in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Use 8081 instead
```

### Database Migration Fails

**Error**: `sqlalchemy.exc.OperationalError`

**Solution**: Wait for database to be ready, then retry:
```bash
sleep 10
docker-compose exec app alembic upgrade head
```

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web dashboard |
| Backend API | http://localhost:8080 | REST API |
| API Docs | http://localhost:8080/docs | Interactive Swagger docs |
| PostgreSQL | localhost:5432 | Database |

## Stopping the Services

Stop all services:
```bash
docker-compose down
```

Stop and remove all data (fresh start):
```bash
docker-compose down -v
```

## Next Steps

!!! info "Ready for More?"
    - **Deploy Real Sensors**: [ESP32 Setup Guide](../hardware/esp32-setup.md)
    - **Configure Advanced Alerts**: [Alert Configuration](../user-guide/configuring-alerts.md)
    - **Explore the API**: [API Reference](../api-reference/overview.md)
    - **Understand Architecture**: [System Design](architecture.md)
    - **Contribute Code**: [Development Guide](../development/local-setup.md)

## What You Just Built

You now have a complete IoT monitoring stack:

- **Edge**: ESP32 sensors auto-registering via mDNS
- **Ingestion**: Go gateway routing to Pub/Sub
- **Processing**: Cloud Functions analyzing data
- **Storage**: BigQuery (analytics) + PostgreSQL (metadata)
- **Application**: FastAPI backend + React frontend
- **Intelligence**: ML anomaly detection (trains on your data)

**Cost to run this stack**: ~$0/month on GCP free tier for <10 sensors.

Ready to scale? Professional plan supports 100 sensors with 30-day retention for $149/month.

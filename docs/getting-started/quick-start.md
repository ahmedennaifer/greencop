# Quick Start Guide

Get GreenCop up and running in 5 minutes with Docker Compose.

## Prerequisites

Before you begin, ensure you have:

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git installed
- At least 4GB of RAM available

## 5-Minute Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ahmedennaifer/greencop.git
cd greencop
```

### Step 2: Configure Environment

Create environment file for the backend:

```bash
cd services/customers
cp .env.example .env
```

Edit `.env` with your preferred settings:

```bash
# Database Configuration
DB_URL=postgresql://greencop:greencop@db:5432/greencop

# JWT Secret (change in production!)
SECRET_KEY=your-secret-key-here

# Google Cloud (optional for local dev)
GOOGLE_CLOUD_PROJECT=your-project-id
```

!!! tip "Local Development"
    For local development, you can use the default values. The SECRET_KEY should be changed for production deployments.

### Step 3: Start the Services

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database (port 5432)
- FastAPI backend (port 8080)
- Cloud SQL Proxy (if configured)

### Step 4: Run Database Migrations

```bash
docker-compose exec app alembic upgrade head
```

### Step 4.5: Start the Go Gateway

In a new terminal:

```bash
cd services/sensors/software
go run cmd/main.go
```

The gateway will start broadcasting via mDNS at `greencop-gateway.local`.

### Step 5: Start the Frontend

In a new terminal:

```bash
cd web/frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

### Step 6: Access the Dashboard

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the GreenCop login page!

## Create Your First Account

1. Click **Register** on the login page
2. Enter your details:
   - Email: your@email.com
   - Username: yourusername (6-12 characters)
   - Password: YourSecurePass123 (8+ characters, mixed alphanumeric)
3. Click **Register**
4. You'll be redirected to the login page
5. Log in with your credentials

## Explore the Dashboard

Once logged in, you'll see the main dashboard with:

- **Overview Cards**: Rooms, Sensors, Alerts, Average Temperature
- **Charts**: Real-time sensor readings
- **Sidebar Navigation**: Access all features

## Add Your First Server Room

1. Click **Rooms** in the sidebar
2. Click **Add Room**
3. Enter room details:
   - Name: "Main Server Room"
4. Click **Create**

## Add Your First Sensor

1. Click **Sensors** in the sidebar
2. Click **Add Sensor**
3. Enter sensor details:
   - Name: "Rack 1 Temp Sensor"
   - Type: "temperature"
   - Room: Select your created room
   - Sensor ID: "sensor-001"
4. Click **Create**

!!! info "Test Data"
    Initially, sensors won't have data until you deploy ESP32 hardware or simulate sensor data through the API.

## Configure Alerts

1. Click **Settings** in the sidebar
2. Set alert thresholds:
   - Maximum Temperature: 50°C
   - Maximum Humidity: 50%
3. Click **Save Settings**

## What's Next?

### Deploy Real Sensors

Learn how to set up ESP32 hardware:

[ESP32 Setup Guide](../hardware/esp32-setup.md){ .md-button .md-button--primary }

### Explore the API

Test the API endpoints:

[API Reference](../api-reference/overview.md){ .md-button }

### Learn All Features

Comprehensive feature guide:

[User Guide](../user-guide/registration.md){ .md-button }

## Troubleshooting

### Backend Won't Start

**Error**: `Connection refused to database`

**Solution**: Ensure PostgreSQL is running:

```bash
docker-compose ps
```

If the database isn't running:

```bash
docker-compose restart db
```

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `Failed to fetch`

**Solution**: Verify backend is running on port 8080:

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"status": "healthy"}
```

### Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**: Stop the conflicting service or change the port in `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"  # Changed from 8080:8080
```

### Database Migration Fails

**Error**: `sqlalchemy.exc.OperationalError`

**Solution**: Ensure database is ready and run migrations:

```bash
docker-compose exec app alembic upgrade head
```

## Stopping the Services

To stop all services:

```bash
cd services/customers
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web dashboard |
| Backend API | http://localhost:8080 | REST API |
| API Docs | http://localhost:8080/docs | Interactive API documentation |
| PostgreSQL | localhost:5432 | Database |

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | postgresql://greencop:greencop@db:5432/greencop | Database connection string |
| `SECRET_KEY` | a_very_secret_key | JWT signing secret |
| `GOOGLE_CLOUD_PROJECT` | None | GCP project ID (optional for local) |

## Next Steps

Now that you have GreenCop running:

1. **Understand the System**: Read the [Architecture Guide](architecture.md)
2. **Deploy Sensors**: Set up [ESP32 Hardware](../hardware/esp32-setup.md)
3. **Explore Features**: Check out [Features Overview](../features/dashboard.md)
4. **API Integration**: Learn the [API Reference](../api-reference/overview.md)
5. **Development**: Contribute with [Development Guide](../development/local-setup.md)

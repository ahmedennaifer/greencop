# Local Development Setup

Set up Green Cop for local development.

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.12+
- Go 1.21+ (for gateway)

## Quick Start

### Backend
```bash
cd services/customers
cp .env.example .env
docker-compose up -d
docker-compose exec app alembic upgrade head
```

### Frontend
```bash
cd web/frontend
npm install
npm run dev
```

### Gateway
```bash
cd services/sensors/software
go run cmd/main.go
```

## Environment Variables

See installation guide for complete list.

## Next Steps
- [Frontend Development](frontend-development.md)
- [Backend Development](backend-development.md)

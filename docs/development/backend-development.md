# Backend Development

Develop the FastAPI backend.

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic

## Running Locally

```bash
cd services/customers
docker-compose up
```

## API Documentation

Auto-generated at:
- Swagger: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## Adding Endpoints

1. Create route in `api/routes/`
2. Define schema in `api/schemas/`
3. Update model if needed in `database/models/`

## Next Steps
- [Database Migrations](database-migrations.md)
- [Testing](testing.md)

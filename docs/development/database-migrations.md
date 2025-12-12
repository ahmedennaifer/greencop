# Database Migrations

Manage database schema with Alembic.

## Create Migration

```bash
cd services/customers
alembic revision -m "Add new field"
```

## Run Migrations

```bash
alembic upgrade head
```

## Rollback

```bash
alembic downgrade -1
```

## Check Current Version

```bash
alembic current
```

# API Reference Overview

Complete guide to the GreenCop REST API.

## Base URL

**Local Development**:
```
http://localhost:8080
```

**Production (Cloud Run)**:
```
https://your-service-xxxxx-uc.a.run.app
```

## Authentication

### JWT Bearer Token

GreenCop uses JWT (JSON Web Tokens) for authentication.

**How to Authenticate**:

1. Register or login to get a token:
```bash
POST /api/v1/customers/login
{
  "email": "user@example.com",
  "password": "YourPassword123"
}
```

2. Response contains token:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

3. Include token in all subsequent requests:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Details**:
- Algorithm: HS256
- Expiration: 30 minutes
- Stored in: localStorage (frontend)
- Header format: `Authorization: Bearer <token>`

## API Categories

### Authentication
- [Login & Registration](authentication.md)
- Token management

### Customers
- [Account management](customers.md)
- Profile updates

### Server Rooms
- [CRUD operations](server-rooms.md)
- Room listing

### Sensors
- [Sensor registration](sensors.md)
- Sensor management

### Data
- [Reading queries](data.md)
- Historical data
- Statistics

### Alerts
- [Alert monitoring](alerts.md)
- Threshold configuration

## Request Format

### Headers

**Required for all authenticated endpoints**:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### JSON Body

Example POST request:
```json
{
  "name": "Server Room 1",
  "field2": "value"
}
```

## Response Format

### Success Response

**Status Code**: 200, 201, 204

```json
{
  "id": 1,
  "name": "Server Room 1",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Error Response

**Status Codes**: 400, 401, 404, 500

```json
{
  "detail": "Error message describing what went wrong"
}
```

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no body) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

## Common Patterns

### Pagination

Currently not implemented. All list endpoints return full results.

**Future**:
```
GET /api/v1/sensors?page=1&limit=20
```

### Filtering

Currently not implemented.

**Future**:
```
GET /api/v1/sensors?room_id=5
```

### Sorting

Not currently supported.

## Rate Limiting

**Current**: No rate limiting

**Future**: TBD based on usage patterns

## CORS

**Allowed Origins**:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative dev port)

**Methods**: All
**Headers**: All
**Credentials**: Enabled

## Interactive Documentation

FastAPI provides auto-generated interactive API docs:

**Swagger UI**:
```
http://localhost:8080/docs
```

**ReDoc**:
```
http://localhost:8080/redoc
```

## Example Requests

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/v1/customers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'

# Get rooms (with token)
curl -X GET http://localhost:8080/api/v1/server_rooms/list_rooms/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

// Login
const { data } = await api.post('/api/v1/customers/login', {
  email: 'user@example.com',
  password: 'Pass123'
});

// Store token
const token = data.access_token;

// Use token for requests
const rooms = await api.get('/api/v1/server_rooms/list_rooms/1', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Using Python (requests)

```python
import requests

BASE_URL = "http://localhost:8080"

# Login
response = requests.post(f"{BASE_URL}/api/v1/customers/login", json={
    "email": "user@example.com",
    "password": "Pass123"
})
token = response.json()["access_token"]

# Use token
headers = {"Authorization": f"Bearer {token}"}
rooms = requests.get(f"{BASE_URL}/api/v1/server_rooms/list_rooms/1", headers=headers)
print(rooms.json())
```

## Error Handling

### Common Errors

**401 Unauthorized**:
```json
{
  "detail": "Could not validate credentials"
}
```
**Solution**: Check token is valid and included in header

**404 Not Found**:
```json
{
  "detail": "Room not found"
}
```
**Solution**: Verify resource ID exists

**400 Bad Request**:
```json
{
  "detail": "Invalid email format"
}
```
**Solution**: Check request body matches schema

## Versioning

**Current Version**: v1

**URL Pattern**: `/api/v1/...`

Future versions will use `/api/v2/...` etc.

## Next Steps

- [Authentication API](authentication.md)
- [Customers API](customers.md)
- [Server Rooms API](server-rooms.md)
- [Sensors API](sensors.md)
- [Data API](data.md)
- [Alerts API](alerts.md)

# Authentication API

User registration, login, and token management endpoints.

## Endpoints

### Register New User

Create a new customer account.

**Endpoint**: `POST /api/v1/customers/register`

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "myusername",
  "password": "SecurePass123"
}
```

**Validation**:
- Email: Must be valid email format, unique
- Username: 6-12 characters, unique
- Password: Min 8 chars, must contain uppercase, lowercase, number

**Success Response** (201):
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "myusername"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "detail": "Email already registered"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:8080/api/v1/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myuser",
    "password": "SecurePass123"
  }'
```

---

### Login

Authenticate and receive JWT token.

**Endpoint**: `POST /api/v1/customers/login`

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNjQyNjg0ODAwfQ.signature",
  "token_type": "bearer"
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "detail": "Incorrect email or password"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:8080/api/v1/customers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Token Usage**:
Store the `access_token` and include in subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration**: 30 minutes

---

## Security

### Password Hashing
- Algorithm: bcrypt
- Automatic salting
- Stored hashed, never plain text

### JWT Tokens
- Algorithm: HS256
- Secret key from environment
- 30-minute expiration
- No refresh tokens (yet)

## Next Steps
- [Customer Account Management](customers.md)
- [Create Server Rooms](server-rooms.md)

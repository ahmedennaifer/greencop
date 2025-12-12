# Customers API

Manage customer account information.

## Endpoints

### Get Customer Info

Retrieve customer account details.

**Endpoint**: `POST /api/v1/customers/info/{customer_id}`

**Authentication**: Required (JWT)

**Path Parameters**:
- `customer_id` (integer): Customer ID

**Success Response** (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "myuser"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:8080/api/v1/customers/info/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Update Customer

Update customer account details.

**Endpoint**: `PATCH /api/v1/customers/{customer_id}`

**Authentication**: Required (JWT)

**Path Parameters**:
- `customer_id` (integer): Customer ID

**Request Body** (all fields optional):
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "password": "NewSecurePass123"
}
```

**Success Response** (200):
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "username": "newusername"
}
```

**Example cURL**:
```bash
curl -X PATCH http://localhost:8080/api/v1/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
```

---

## Data Model

```typescript
interface Customer {
  id: number;
  email: string;
  username: string;
  // password_hash not returned in responses
}
```

## Next Steps
- [Server Rooms API](server-rooms.md)
- [Sensors API](sensors.md)

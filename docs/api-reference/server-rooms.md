# Server Rooms API

CRUD operations for managing server rooms.

## Endpoints

### Create Room
**POST** `/api/v1/server_rooms/new_room`

**Auth**: Required

**Body**:
```json
{"name": "Data Center 1", "customer_id": 1}
```

**Response** (201):
```json
{"id": 1, "name": "Data Center 1", "customer_id": 1}
```

### List Rooms
**GET** `/api/v1/server_rooms/list_rooms/{customer_id}`

**Response** (200):
```json
[
  {"id": 1, "name": "Data Center 1", "customer_id": 1},
  {"id": 2, "name": "Server Room 2", "customer_id": 1}
]
```

### Get Room
**GET** `/api/v1/server_rooms/room/{room_id}`

**Response** (200):
```json
{"id": 1, "name": "Data Center 1", "customer_id": 1}
```

### Update Room
**PUT** `/api/v1/server_rooms/update_room/{room_id}`

**Body**:
```json
{"name": "Updated Room Name"}
```

### Delete Room
**DELETE** `/api/v1/server_rooms/delete_room/{room_id}`

**Response** (204): No content

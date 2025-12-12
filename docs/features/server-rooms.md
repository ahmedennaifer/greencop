# Server Rooms

Organize your sensors into logical groups representing physical locations or organizational units.

## What are Server Rooms?

Server rooms in GreenCop are containers for grouping sensors. They can represent:

- Physical server rooms or data centers
- Different buildings or facilities
- Organizational departments
- Any logical grouping that makes sense for your use case

## Key Concepts

### Organization Hierarchy

```
Customer (User Account)
  └── Server Rooms
        └── Sensors
```

- Each customer can have multiple rooms
- Each room can contain multiple sensors
- Sensors must belong to a room

### Use Cases

- **Data Center**: Separate rooms for different server racks
- **Campus**: Different buildings each as a room
- **Departments**: IT, Storage, Production rooms
- **Clients**: MSP managing multiple customer locations

## Managing Rooms

### Creating a Room

**From Rooms Page**:
1. Navigate to **Rooms** in sidebar
2. Click **New Room** button (top right)
3. Enter room name (e.g., "Data Center 1")
4. Click **Create Room**

**From Dashboard**:
- If no rooms exist, you'll be prompted to create one

**Requirements**:
- Room name is required
- Must be logged in
- Unique names recommended (not enforced)

### Viewing Rooms

**Rooms Page**: 
- Grid of room cards
- Each card shows:
  - Room icon (server)
  - Room name
  - Room ID
  - Sensor count (currently shows 0 - future enhancement)
  - Status indicator (Active)

**Dashboard**:
- Total room count in statistics card

### Deleting a Room

**Warning**: Deleting a room also deletes all sensors assigned to it!

**Steps**:
1. Go to Rooms page
2. Find the room card
3. Click the trash icon (red) in top-right of card
4. Confirm deletion in dialog

**Effect**:
- Room removed from database
- All sensors in room also deleted
- Historical sensor data preserved in BigQuery

## Room Information

### Displayed Fields

- **Name**: User-defined room name
- **ID**: Auto-generated unique identifier
- **Sensors**: Count of sensors in room (future enhancement)
- **Status**: Always "Active" (future: could show offline if no sensors reporting)

### Future Enhancements

Planned features:
- Room description field
- Geographic location (lat/long)
- Floor plan or diagram upload
- Capacity and size fields
- Contact person assignment
- Custom metadata fields

## Room Features

### Sensor Assignment

When creating a sensor, you must assign it to a room:
- Dropdown selector shows all your rooms
- Required field - can't create sensor without room
- Can move sensors between rooms (via sensor update)

### Filtering

- Dashboard shows data from all rooms
- Sensors page groups sensors by room name
- Can filter views by room (future enhancement)

## Best Practices

### Naming Conventions

Good room names:
- "Building A - Floor 3 - Server Room"
- "East Data Center"
- "Production Environment"
- "Client ABC - Main Office"

Avoid:
- Generic names like "Room 1"
- Very long names (breaks UI layout)
- Special characters that might cause issues

### Organization

- Create rooms BEFORE adding sensors
- Use consistent naming scheme across all rooms
- Plan room structure before deployment
- Consider future scalability

### Maintenance

- Review room list periodically
- Remove rooms no longer in use
- Update names if physical locations change
- Keep room count manageable (<100 for best performance)

## Empty States

### No Rooms Created

**Display**: Server icon with "No server rooms yet" message
**Action**: Button to create first room
**Location**: Rooms page

**Next Step**: Click "Create Server Room" to get started

### No Sensors in Room

**Display**: Room card shows "Sensors: 0"
**Action**: Navigate to Sensors page to add sensors
**Note**: Empty rooms are allowed but not useful

## Responsive Design

### Desktop
- 3 room cards per row
- Full card details visible
- Hover effects for interactions

### Tablet  
- 2 room cards per row
- Adjusted spacing

### Mobile
- 1 room card per row
- Stacked layout
- Touch-friendly buttons

## Technical Details

### Database Schema

```sql
CREATE TABLE server_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    customer_id INTEGER REFERENCES customers(id)
);
```

### API Endpoints

- `POST /api/v1/server_rooms/new_room` - Create room
- `GET /api/v1/server_rooms/list_rooms/{customer_id}` - List all rooms
- `GET /api/v1/server_rooms/room/{room_id}` - Get room details
- `PUT /api/v1/server_rooms/update_room/{room_id}` - Update room (future)
- `DELETE /api/v1/server_rooms/delete_room/{room_id}` - Delete room

### Data Model

```typescript
interface ServerRoom {
  id: number;
  name: string;
  customer_id: number;
}
```

## Troubleshooting

### Can't Create Room

**Symptoms**: Create button disabled or error on submit

**Solutions**:
- Ensure you're logged in
- Check room name is not empty
- Verify network connection
- Check browser console for errors

### Room Not Showing

**Symptoms**: Created room doesn't appear in list

**Solutions**:
- Refresh the page
- Check you're viewing the correct customer account
- Verify room was created (check network tab)
- Contact support if persists

### Can't Delete Room

**Symptoms**: Error when trying to delete

**Possible Causes**:
- Room has sensors (should still allow deletion with warning)
- Network error
- Permissions issue

**Solutions**:
- Manually delete all sensors first
- Refresh and try again
- Check backend logs

## Integration with Other Features

### With Sensors
- Sensors must be assigned to a room
- Room selector shown in sensor creation modal
- Sensor cards display room name

### With Dashboard
- Total rooms count displayed
- All sensors across all rooms shown in charts
- No per-room filtering (yet)

### With Alerts
- Alerts associated with sensors
- Can trace alert → sensor → room
- Future: room-level alert aggregation

## Next Steps

- [Add Sensors to Rooms](../user-guide/managing-sensors.md)
- [View Room Data](../user-guide/viewing-data.md)
- [API Reference: Rooms](../api-reference/server-rooms.md)

from fastapi import APIRouter, Depends, HTTPException
import logging

from sqlalchemy.orm.session import Session

from customers.api.schemas.server_room import ServerRoomBase
from customers.database.session import get_db
from customers.database.models.server_room import ServerRoom

server_room_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@server_room_router.post("/new_room")
async def create_new_room(server_room: ServerRoomBase, db: Session = Depends(get_db)):
    logger.debug(
        f"Adding new room with name {server_room.name} for customer: {server_room.customer_id}"
    )
    logger.debug("Checking if room exists...")
    server_room_exists = (
        db.query(ServerRoom)
        .filter(
            ServerRoom.customer_id == server_room.customer_id
            and ServerRoom.name == server_room.name
        )
        .first()
    )
    if server_room_exists:
        logger.warning(
            f"Room {server_room_exists.name} already exists for customer: {server_room.customer_id}"
        )
        raise HTTPException(status_code=400, detail="Room already exists for customer")
    # add to db
    logger.debug("Adding to db..")
    try:
        db_server_room = ServerRoom(
            name=server_room.name, customer_id=server_room.customer_id
        )
        db.add(db_server_room)
        db.commit()
        db.refresh(db_server_room)
        logger.info(
            f"Added room {db_server_room.name} to customer: {db_server_room.customer_id}"
        )
        return db_server_room
    except Exception as e:
        logger.error(
            f"Error adding server room {db_server_room.id}:{db_server_room.name} to db: {e}"
        )
        db.rollback()

        raise HTTPException(
            status_code=401, detail=f"Error registering customer to db: {e}"
        )

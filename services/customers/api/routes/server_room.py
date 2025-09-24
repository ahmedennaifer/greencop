from fastapi import APIRouter, Depends, HTTPException, status
import logging

from sqlalchemy.orm.session import Session

from customers.api.schemas.server_room import ServerRoomBase
from customers.database.session import get_db
from customers.database.models.server_room import ServerRoom
from customers.database.models.customer import Customer

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
            ServerRoom.customer_id == server_room.customer_id,
            ServerRoom.name == server_room.name,
        )
        .first()
    )
    if server_room_exists:
        logger.info(server_room_exists.name)
        logger.warning(
            f"Room {server_room_exists.name} already exists for customer: {server_room.customer_id}"
        )
        raise HTTPException(status_code=400, detail="Room already exists for customer")
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
            f"Error adding server room {db_server_room.id}:{db_server_room.name} to db: {e}"  # pyright: ignore
        )
        db.rollback()

        raise HTTPException(
            status_code=401, detail=f"Error registering customer to db: {e}"
        )


# TODO: make secure with get_current_user
@server_room_router.get("/list_rooms/{customer_id}")
async def list_server_rooms(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    logger.debug(f"Found customer with id {customer_id}")
    if not customer:
        logger.error(f"Customer with id {customer_id} not found!")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id:{customer_id} does not exist",
        )
    try:
        rooms = db.query(ServerRoom).filter(ServerRoom.customer_id == customer_id).all()
        logger.debug(f"Found {len(rooms)} for customer_id: {customer_id}")
        return rooms
    except Exception as e:
        logger.error(f"Error while fetching rooms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error while fetching rooms for customer_id {customer_id}",
        )


@server_room_router.get("/list_room_by_id/{server_room_id}")
async def list_server_room_by_id(server_room_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Fetching server room with id:{server_room_id}")
    try:
        server_room = (
            db.query(ServerRoom).filter(ServerRoom.id == server_room_id).first()
        )
        if not server_room:
            logger.error(f"Server room with id {server_room_id} not found!")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Server room with id:{server_room_id} does not exist",
            )
        logger.info(
            f"Found room with name: {server_room.name} for room id: {server_room_id}"
        )
        return server_room

    except Exception as e:
        logger.error(f"Error while fetching room with id {server_room_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error while fetching room with id {server_room_id}",
        )

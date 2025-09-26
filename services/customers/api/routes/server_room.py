from fastapi import APIRouter, Depends, HTTPException, status
import logging

from sqlalchemy.orm.session import Session

from customers.api.schemas.server_room import (
    ServerRoomBase,
    ServerRoomCreate,
    ServerRoom,
)
from customers.database.session import get_db
from customers.database.models.server_room import ServerRoom as ServerRoomModel
from customers.database.models.customer import Customer

server_room_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@server_room_router.post("/new_room", response_model=ServerRoom)
async def create_new_room(server_room: ServerRoomCreate, db: Session = Depends(get_db)):
    logger.debug(
        f"Adding new room with name {server_room.name} for customer: {server_room.customer_id}"
    )
    logger.debug("Checking if room exists...")
    server_room_exists = (
        db.query(ServerRoomModel)
        .filter(
            ServerRoomModel.customer_id == server_room.customer_id,
            ServerRoomModel.name == server_room.name,
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
        db_server_room = ServerRoomModel(
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

        raise HTTPException(status_code=500, detail=f"Error creating server room: {e}")


@server_room_router.get("/room/{room_id}", response_model=ServerRoom)
async def get_server_room(room_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Fetching server room with id: {room_id}")

    room = db.query(ServerRoomModel).filter(ServerRoomModel.id == room_id).first()
    if not room:
        logger.warning(f"Server room with id {room_id} not found")
        raise HTTPException(status_code=404, detail="Server room not found")

    return room


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
        rooms = db.query(ServerRoomModel).filter(ServerRoomModel.customer_id == customer_id).all()
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
            db.query(ServerRoomModel).filter(ServerRoomModel.id == server_room_id).first()
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


@server_room_router.put("/update_room/{room_id}", response_model=ServerRoom)
async def update_server_room(
    room_id: int, room_update: ServerRoomCreate, db: Session = Depends(get_db)
):
    logger.debug(f"Updating server room with id: {room_id}")

    db_room = db.query(ServerRoomModel).filter(ServerRoomModel.id == room_id).first()
    if not db_room:
        logger.warning(f"Server room with id {room_id} not found")
        raise HTTPException(status_code=404, detail="Server room not found")

    try:
        db_room.name = room_update.name
        db_room.customer_id = room_update.customer_id
        db.commit()
        db.refresh(db_room)
        logger.info(f"Updated server room {db_room.id}")
        return db_room
    except Exception as e:
        logger.error(f"Error updating server room: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating server room: {e}")


@server_room_router.delete("/delete_room/{room_id}")
async def delete_server_room(room_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Deleting server room with id: {room_id}")

    db_room = db.query(ServerRoomModel).filter(ServerRoomModel.id == room_id).first()
    if not db_room:
        logger.warning(f"Server room with id {room_id} not found")
        raise HTTPException(status_code=404, detail="Server room not found")

    try:
        db.delete(db_room)
        db.commit()
        logger.info(f"Deleted server room {room_id}")
        return {"message": "Server room deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting server room: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting server room: {e}")

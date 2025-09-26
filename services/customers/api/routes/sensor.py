from fastapi import APIRouter, Depends, HTTPException
import logging

from sqlalchemy.orm.session import Session

from customers.api.schemas.sensor import SensorCreate, Sensor
from customers.database.session import get_db
from customers.database.models.sensor import Sensor as SensorModel

sensor_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@sensor_router.post("/new_sensor", response_model=Sensor)
async def create_sensor(sensor: SensorCreate, db: Session = Depends(get_db)):
    logger.debug(f"Creating sensor {sensor.name} for room: {sensor.room_id}")

    existing_sensor = (
        db.query(SensorModel)
        .filter(SensorModel.room_id == sensor.room_id, SensorModel.name == sensor.name)
        .first()
    )
    if existing_sensor:
        logger.warning(f"Sensor {sensor.name} already exists in room: {sensor.room_id}")
        raise HTTPException(
            status_code=400, detail="Sensor already exists in this room"
        )

    try:
        db_sensor = SensorModel(
            name=sensor.name, type=sensor.type, room_id=sensor.room_id
        )
        db.add(db_sensor)
        db.commit()
        db.refresh(db_sensor)
        logger.info(f"Created sensor {db_sensor.name} with id: {db_sensor.id}")
        return db_sensor
    except Exception as e:
        logger.error(f"Error creating sensor: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating sensor: {e}")


@sensor_router.get("/sensor/{sensor_id}", response_model=Sensor)
async def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Fetching sensor with id: {sensor_id}")

    sensor = db.query(SensorModel).filter(SensorModel.id == sensor_id).first()
    if not sensor:
        logger.warning(f"Sensor with id {sensor_id} not found")
        raise HTTPException(status_code=404, detail="Sensor not found")

    return sensor


@sensor_router.get("/list_sensors/{room_id}")
async def list_sensors_by_room(room_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Fetching sensors for room: {room_id}")

    sensors = db.query(SensorModel).filter(SensorModel.room_id == room_id).all()
    return sensors


@sensor_router.put("/update_sensor/{sensor_id}", response_model=Sensor)
async def update_sensor(
    sensor_id: int, sensor_update: SensorCreate, db: Session = Depends(get_db)
):
    logger.debug(f"Updating sensor with id: {sensor_id}")

    db_sensor = db.query(SensorModel).filter(SensorModel.id == sensor_id).first()
    if not db_sensor:
        logger.warning(f"Sensor with id {sensor_id} not found")
        raise HTTPException(status_code=404, detail="Sensor not found")

    try:
        db_sensor.name = sensor_update.name
        db_sensor.type = sensor_update.type
        db_sensor.room_id = sensor_update.room_id
        db.commit()
        db.refresh(db_sensor)
        logger.info(f"Updated sensor {db_sensor.id}")
        return db_sensor
    except Exception as e:
        logger.error(f"Error updating sensor: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating sensor: {e}")


@sensor_router.delete("/delete_sensor/{sensor_id}")
async def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Deleting sensor with id: {sensor_id}")

    db_sensor = db.query(SensorModel).filter(SensorModel.id == sensor_id).first()
    if not db_sensor:
        logger.warning(f"Sensor with id {sensor_id} not found")
        raise HTTPException(status_code=404, detail="Sensor not found")

    try:
        db.delete(db_sensor)
        db.commit()
        logger.info(f"Deleted sensor {sensor_id}")
        return {"message": "Sensor deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting sensor: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting sensor: {e}")


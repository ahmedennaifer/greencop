import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from customers.database.session import get_db
from customers.database.models.alert import Alert as AlertModel, AlertThreshold as AlertThresholdModel
from customers.api.schemas.alert import Alert, AlertThresholdUpdate, AlertThreshold

alert_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@alert_router.get("/active", response_model=List[Alert])
async def get_active_alerts(db: Session = Depends(get_db)):
    """Get all active (unacknowledged) alerts"""
    try:
        alerts = db.query(AlertModel).filter(AlertModel.acknowledged == False).order_by(AlertModel.timestamp.desc()).all()
        return alerts
    except Exception as e:
        logger.error(f"Error fetching active alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/history", response_model=List[Alert])
async def get_alert_history(limit: int = 50, db: Session = Depends(get_db)):
    """Get alert history"""
    try:
        alerts = db.query(AlertModel).order_by(AlertModel.timestamp.desc()).limit(limit).all()
        return alerts
    except Exception as e:
        logger.error(f"Error fetching alert history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/sensor/{sensor_id}", response_model=List[Alert])
async def get_sensor_alerts(sensor_id: int, db: Session = Depends(get_db)):
    """Get alerts for a specific sensor"""
    try:
        alerts = db.query(AlertModel).filter(AlertModel.sensor_id == sensor_id).order_by(AlertModel.timestamp.desc()).all()
        return alerts
    except Exception as e:
        logger.error(f"Error fetching sensor alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/{alert_id}/acknowledge", response_model=Alert)
async def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Acknowledge an alert"""
    try:
        alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.acknowledged = True
        db.commit()
        db.refresh(alert)
        return alert
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error acknowledging alert: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/thresholds/{customer_id}", response_model=AlertThreshold)
async def get_thresholds(customer_id: int, db: Session = Depends(get_db)):
    """Get alert thresholds for a customer"""
    try:
        thresholds = db.query(AlertThresholdModel).filter(AlertThresholdModel.customer_id == customer_id).first()

        if not thresholds:
            # Create default thresholds
            thresholds = AlertThresholdModel(
                customer_id=customer_id,
                max_temperature=50.0,
                max_humidity=50.0
            )
            db.add(thresholds)
            db.commit()
            db.refresh(thresholds)

        return thresholds
    except Exception as e:
        logger.error(f"Error fetching thresholds: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/thresholds/{customer_id}", response_model=AlertThreshold)
async def update_thresholds(
    customer_id: int,
    threshold_data: AlertThresholdUpdate,
    db: Session = Depends(get_db)
):
    """Update alert thresholds for a customer"""
    try:
        thresholds = db.query(AlertThresholdModel).filter(AlertThresholdModel.customer_id == customer_id).first()

        if not thresholds:
            thresholds = AlertThresholdModel(
                customer_id=customer_id,
                max_temperature=threshold_data.max_temperature,
                max_humidity=threshold_data.max_humidity
            )
            db.add(thresholds)
        else:
            thresholds.max_temperature = threshold_data.max_temperature
            thresholds.max_humidity = threshold_data.max_humidity

        db.commit()
        db.refresh(thresholds)
        return thresholds
    except Exception as e:
        logger.error(f"Error updating thresholds: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

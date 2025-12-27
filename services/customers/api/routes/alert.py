import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from customers.database.session import get_db
from customers.database.models.alert import (
    Alert as AlertModel,
    AlertThreshold as AlertThresholdModel,
)
from customers.api.schemas.alert import (
    Alert,
    AlertThresholdUpdate,
    AlertThreshold,
    FeedbackSchema,
)

alert_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@alert_router.get("/active", response_model=List[Alert])
async def get_active_alerts(db: Session = Depends(get_db)):
    """Get all active (unacknowledged) alerts"""
    try:
        alerts = (
            db.query(AlertModel)
            .filter(AlertModel.acknowledged == False)
            .order_by(AlertModel.timestamp.desc())
            .all()
        )
        return alerts
    except Exception as e:
        logger.error(f"Error fetching active alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/history", response_model=List[Alert])
async def get_alert_history(limit: int = 50, db: Session = Depends(get_db)):
    """Get alert history"""
    try:
        alerts = (
            db.query(AlertModel)
            .order_by(AlertModel.timestamp.desc())
            .limit(limit)
            .all()
        )
        return alerts
    except Exception as e:
        logger.error(f"Error fetching alert history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@alert_router.get("/anomalies", response_model=List[Alert])
async def get_anomalies(limit: int = 100, db: Session = Depends(get_db)):
    """Get anomaly alerts"""
    try:
        alerts = (
            db.query(AlertModel)
            .filter(AlertModel.alert_type == "anomaly")
            .order_by(AlertModel.timestamp.desc())
            .limit(limit)
            .all()
        )
        return alerts
    except Exception as e:
        logger.error(f"Error fetching anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/sensor/{sensor_id}", response_model=List[Alert])
async def get_sensor_alerts(sensor_id: int, db: Session = Depends(get_db)):
    """Get alerts for a specific sensor"""
    try:
        alerts = (
            db.query(AlertModel)
            .filter(AlertModel.sensor_id == sensor_id)
            .order_by(AlertModel.timestamp.desc())
            .all()
        )
        return alerts
    except Exception as e:
        logger.error(f"Error fetching sensor alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/{alert_id}/acknowledge", response_model=Alert)
async def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
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


@alert_router.post("/{alert_id}/feedback", response_model=Alert)
async def submit_feedback(
    alert_id: int, feedback: FeedbackSchema, db: Session = Depends(get_db)
):
    try:
        alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.feedback = feedback.feedback_type
        db.commit()
        db.refresh(alert)
        return alert
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/thresholds/{customer_id}", response_model=AlertThreshold)
async def get_thresholds(customer_id: int, db: Session = Depends(get_db)):
    """Get alert thresholds for a customer"""
    try:
        thresholds = (
            db.query(AlertThresholdModel)
            .filter(AlertThresholdModel.customer_id == customer_id)
            .first()
        )

        if not thresholds:
            thresholds = AlertThresholdModel(
                customer_id=customer_id, max_temperature=50.0, max_humidity=50.0
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
    db: Session = Depends(get_db),
):
    """Update alert thresholds for a customer"""
    try:
        thresholds = (
            db.query(AlertThresholdModel)
            .filter(AlertThresholdModel.customer_id == customer_id)
            .first()
        )

        if not thresholds:
            thresholds = AlertThresholdModel(
                customer_id=customer_id,
                max_temperature=threshold_data.max_temperature,
                max_humidity=threshold_data.max_humidity,
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


@alert_router.get("/anomalies/stats")
async def get_anomaly_stats(db: Session = Depends(get_db)):
    """Get anomaly statistics"""
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta

        anomalies = (
            db.query(AlertModel).filter(AlertModel.alert_type == "anomaly").all()
        )

        total_anomalies = len(anomalies)

        hourly_counts = {}
        daily_counts = {}
        sensor_counts = {}

        for alert in anomalies:
            hour_key = alert.timestamp.strftime("%Y-%m-%d %H:00")
            day_key = alert.timestamp.strftime("%Y-%m-%d")

            hourly_counts[hour_key] = hourly_counts.get(hour_key, 0) + 1
            daily_counts[day_key] = daily_counts.get(day_key, 0) + 1
            sensor_counts[alert.sensor_id] = sensor_counts.get(alert.sensor_id, 0) + 1

        last_24h = (
            db.query(AlertModel)
            .filter(
                AlertModel.alert_type == "anomaly",
                AlertModel.timestamp >= datetime.utcnow() - timedelta(hours=24),
            )
            .count()
        )

        last_7d = (
            db.query(AlertModel)
            .filter(
                AlertModel.alert_type == "anomaly",
                AlertModel.timestamp >= datetime.utcnow() - timedelta(days=7),
            )
            .count()
        )

        return {
            "total_anomalies": total_anomalies,
            "last_24h": last_24h,
            "last_7d": last_7d,
            "hourly_distribution": sorted(hourly_counts.items()),
            "daily_distribution": sorted(daily_counts.items()),
            "sensor_distribution": sorted(
                sensor_counts.items(), key=lambda x: x[1], reverse=True
            ),
        }
    except Exception as e:
        logger.error(f"Error fetching anomaly stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/anomalies", response_model=List[Alert])
async def get_anomalies(limit: int = 100, db: Session = Depends(get_db)):
    """Get all anomaly alerts"""
    try:
        anomalies = (
            db.query(AlertModel)
            .filter(AlertModel.alert_type == "anomaly")
            .order_by(AlertModel.timestamp.desc())
            .limit(limit)
            .all()
        )
        return anomalies
    except Exception as e:
        logger.error(f"Error fetching anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/acknowledge-all")
async def acknowledge_all_alerts(db: Session = Depends(get_db)):
    try:
        updated = (
            db.query(AlertModel)
            .filter(AlertModel.acknowledged == False)
            .update({"acknowledged": True})
        )
        db.commit()
        return {"acknowledged": updated}
    except Exception as e:
        logger.error(f"Error acknowledging all alerts: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/confirm-all")
async def confirm_all_alerts(db: Session = Depends(get_db)):
    try:
        updated = (
            db.query(AlertModel)
            .filter(AlertModel.feedback == None)
            .update({"feedback": "true_positive"})
        )
        db.commit()
        return {"confirmed": updated}
    except Exception as e:
        logger.error(f"Error confirming all alerts: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/anomalies/clear-all")
async def clear_all_anomalies(db: Session = Depends(get_db)):
    try:
        updated = (
            db.query(AlertModel)
            .filter(AlertModel.alert_type == "anomaly", AlertModel.acknowledged == False)
            .update({"acknowledged": True})
        )
        db.commit()
        return {"cleared": updated}
    except Exception as e:
        logger.error(f"Error clearing all anomalies: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

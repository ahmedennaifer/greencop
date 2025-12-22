import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from customers.database.session import get_db
from customers.database.models.prediction_feedback import (
    PredictionFeedback as PredictionFeedbackModel,
)
from customers.api.schemas.prediction_feedback import (
    PredictionFeedback,
    PredictionFeedbackCreate,
    PredictionFeedbackUpdate,
)

prediction_feedback_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@prediction_feedback_router.post("/", response_model=PredictionFeedback)
async def create_prediction_feedback(
    feedback_data: PredictionFeedbackCreate, db: Session = Depends(get_db)
):
    """Store prediction feedback"""
    try:
        feedback = PredictionFeedbackModel(**feedback_data.dict())
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback
    except Exception as e:
        logger.error(f"Error creating prediction feedback: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.put("/{feedback_id}", response_model=PredictionFeedback)
async def update_prediction_feedback(
    feedback_id: int,
    feedback_update: PredictionFeedbackUpdate,
    db: Session = Depends(get_db),
):
    """Update prediction feedback (OK/KO)"""
    try:
        feedback = (
            db.query(PredictionFeedbackModel)
            .filter(PredictionFeedbackModel.id == feedback_id)
            .first()
        )

        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        feedback.feedback = feedback_update.feedback
        db.commit()
        db.refresh(feedback)
        return feedback
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating prediction feedback: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get(
    "/sensor/{sensor_id}", response_model=List[PredictionFeedback]
)
async def get_sensor_feedback(
    sensor_id: str, limit: int = 20, db: Session = Depends(get_db)
):
    """Get prediction feedback for a specific sensor"""
    try:
        feedbacks = (
            db.query(PredictionFeedbackModel)
            .filter(PredictionFeedbackModel.sensor_id == sensor_id)
            .order_by(PredictionFeedbackModel.timestamp.desc())
            .limit(limit)
            .all()
        )

        return feedbacks
    except Exception as e:
        logger.error(f"Error fetching sensor feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get("/all", response_model=List[PredictionFeedback])
async def get_all_feedback(limit: int = 50, db: Session = Depends(get_db)):
    """Get all prediction feedback"""
    try:
        feedbacks = (
            db.query(PredictionFeedbackModel)
            .order_by(PredictionFeedbackModel.timestamp.desc())
            .limit(limit)
            .all()
        )

        return feedbacks
    except Exception as e:
        logger.error(f"Error fetching feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get("/validated-training-data")
async def get_validated_training_data(db: Session = Depends(get_db)):
    """Get validated predictions (marked OK) for ML model retraining"""
    try:
        validated = (
            db.query(PredictionFeedbackModel)
            .filter(PredictionFeedbackModel.feedback == 'ok')
            .all()
        )

        training_data = [{
            'sensor_id': fb.sensor_id,
            'timestamp': fb.timestamp.isoformat(),
            'predicted_temp': fb.predicted_temp,
            'predicted_humidity': fb.predicted_humidity,
            'actual_temp': fb.actual_temp,
            'actual_humidity': fb.actual_humidity,
            'anomaly_predicted': fb.anomaly_predicted,
        } for fb in validated]

        return {
            'total_validated_ok': len(training_data),
            'ready_for_retraining': len(training_data) >= 100,
            'training_data': training_data
        }
    except Exception as e:
        logger.error(f"Error fetching validated training data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get("/stats")
async def get_feedback_stats(db: Session = Depends(get_db)):
    """Get prediction feedback statistics"""
    try:
        total_predictions = db.query(PredictionFeedbackModel).count()
        ok_count = db.query(PredictionFeedbackModel).filter(PredictionFeedbackModel.feedback == 'ok').count()
        not_ok_count = db.query(PredictionFeedbackModel).filter(PredictionFeedbackModel.feedback == 'not_ok').count()
        validated_count = ok_count + not_ok_count

        return {
            'total_predictions': total_predictions,
            'validated_count': validated_count,
            'ok_count': ok_count,
            'not_ok_count': not_ok_count,
            'ready_for_retraining': ok_count >= 100
        }
    except Exception as e:
        logger.error(f"Error fetching feedback stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

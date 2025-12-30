import json
import logging
import os
from typing import List
from datetime import datetime

from customers.api.schemas.prediction_feedback import (
    PredictionFeedback,
    PredictionFeedbackCreate,
    PredictionFeedbackUpdate,
)
from customers.database.models.prediction_feedback import (
    PredictionFeedback as PredictionFeedbackModel,
)
from customers.database.session import get_db
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from google.cloud import bigquery, pubsub_v1
from sqlalchemy.orm import Session

prediction_feedback_router = APIRouter()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
DATASET_ID = os.environ.get("DATASET_ID", "sensor_data")
TABLE_ID = os.environ.get("TABLE_ID", "readings")


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




def _check_and_trigger_retraining():
    logger.info("=== FUNCTION ENTERED ===")
    try:
        logger.info("=== TRIGGER CHECK STARTED ===")
        from customers.database.session import SessionLocal

        logger.info("=== GETTING DB SESSION ===")
        db = SessionLocal()
        logger.info("=== DB SESSION ACQUIRED ===")
        try:
            ok_count = (
                db.query(PredictionFeedbackModel)
                .filter(PredictionFeedbackModel.feedback == "ok")
                .filter(PredictionFeedbackModel.used_in_training == False)
                .count()
            )

            logger.info(f"Unused validated predictions: {ok_count}")

            if ok_count < 100:
                logger.info("Below 100 threshold, exiting")
                return

            logger.info("Importing ModelTrainingRun")
            from customers.database.models.model_training_run import ModelTrainingRun
            logger.info("ModelTrainingRun imported successfully")

            running = (
                db.query(ModelTrainingRun)
                .filter(ModelTrainingRun.triggered_by == "auto_100_validated")
                .filter(ModelTrainingRun.status == "running")
                .first()
            )

            if running:
                logger.info(f"Training run {running.id} already in progress")
                return

            logger.info(f"Unused validated predictions ready for training: {ok_count}")

            if ok_count < 100:
                logger.info(f"Only {ok_count} unused validations, need 100")
                return

            logger.info("CREATING TRAINING RUN")
            training_run = ModelTrainingRun(
                status="running",
                model_type="both",
                validated_data_count=ok_count,
                triggered_by="auto_100_validated",
            )
            db.add(training_run)
            db.commit()
            db.refresh(training_run)

            logger.info(f"Training run {training_run.id} created, publishing to Pub/Sub")
            publisher = pubsub_v1.PublisherClient()
            topic_path = f"projects/{PROJECT_ID}/topics/model-retraining"
            message = {
                "training_run_id": training_run.id,
                "validated_count": ok_count,
                "trigger": "auto_100_validated",
            }

            message["event_type"] = "training_start"
            message["timestamp"] = datetime.utcnow().isoformat()

            publisher.publish(topic_path, json.dumps(message).encode())
            logger.info(f"Triggered retraining run {training_run.id} with {ok_count} validations")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"TRIGGER ERROR: {e}", exc_info=True)


@prediction_feedback_router.put("/{feedback_id}", response_model=PredictionFeedback)
async def update_prediction_feedback(
    feedback_id: int,
    feedback_update: PredictionFeedbackUpdate,
    db: Session = Depends(get_db),
):
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

        if feedback_update.feedback in ["ok", "not_ok"]:
            _check_and_trigger_retraining()

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
            .filter(PredictionFeedbackModel.feedback == "ok")
            .all()
        )

        training_data = [
            {
                "sensor_id": fb.sensor_id,
                "timestamp": fb.timestamp.isoformat(),
                "predicted_temp": fb.predicted_temp,
                "predicted_humidity": fb.predicted_humidity,
                "actual_temp": fb.actual_temp,
                "actual_humidity": fb.actual_humidity,
                "anomaly_predicted": fb.anomaly_predicted,
            }
            for fb in validated
        ]

        return {
            "total_validated_ok": len(training_data),
            "ready_for_retraining": len(training_data) >= 100,
            "training_data": training_data,
        }
    except Exception as e:
        logger.error(f"Error fetching validated training data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get("/stats")
async def get_feedback_stats(db: Session = Depends(get_db)):
    """Get prediction feedback statistics"""
    try:
        total_predictions = db.query(PredictionFeedbackModel).count()
        ok_count = (
            db.query(PredictionFeedbackModel)
            .filter(PredictionFeedbackModel.feedback == "ok")
            .count()
        )
        not_ok_count = (
            db.query(PredictionFeedbackModel)
            .filter(PredictionFeedbackModel.feedback == "not_ok")
            .count()
        )
        validated_count = ok_count + not_ok_count

        return {
            "total_predictions": total_predictions,
            "validated_count": validated_count,
            "ok_count": ok_count,
            "not_ok_count": not_ok_count,
            "ready_for_retraining": ok_count >= 100,
        }
    except Exception as e:
        logger.error(f"Error fetching feedback stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get("/search", response_model=List[PredictionFeedback])
async def search_predictions(
    sensor_id: str = None,
    start_date: str = None,
    end_date: str = None,
    limit: int = 100,
    offset: int = 0,
    order_by: str = "timestamp",
    order_dir: str = "desc",
    db: Session = Depends(get_db),
):
    """Search predictions with filters"""
    try:
        from datetime import datetime

        query = db.query(PredictionFeedbackModel)

        if sensor_id:
            query = query.filter(PredictionFeedbackModel.sensor_id == sensor_id)

        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(PredictionFeedbackModel.timestamp >= start_dt)

        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.filter(PredictionFeedbackModel.timestamp <= end_dt)

        if order_by == "timestamp":
            order_col = PredictionFeedbackModel.timestamp
        else:
            order_col = PredictionFeedbackModel.id

        if order_dir == "desc":
            query = query.order_by(order_col.desc())
        else:
            query = query.order_by(order_col.asc())

        predictions = query.offset(offset).limit(limit).all()
        return predictions
    except Exception as e:
        logger.error(f"Error searching predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@prediction_feedback_router.get("/{feedback_id}", response_model=PredictionFeedback)
async def get_prediction_by_id(feedback_id: int, db: Session = Depends(get_db)):
    """Get prediction by ID"""
    try:
        prediction = (
            db.query(PredictionFeedbackModel)
            .filter(PredictionFeedbackModel.id == feedback_id)
            .first()
        )
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

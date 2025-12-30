import logging
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from customers.database.session import get_db
from customers.database.models.model_training_run import ModelTrainingRun
from customers.api.schemas.model_training_run import ModelTrainingRunResponse

ml_retraining_router = APIRouter()
logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")


@ml_retraining_router.get("/status/{run_id}", response_model=ModelTrainingRunResponse)
async def get_training_status(run_id: int, db: Session = Depends(get_db)):
    run = db.query(ModelTrainingRun).filter(ModelTrainingRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Training run not found")
    return run


@ml_retraining_router.get("/history", response_model=List[ModelTrainingRunResponse])
async def get_training_history(limit: int = 20, db: Session = Depends(get_db)):
    runs = db.query(ModelTrainingRun)\
        .order_by(ModelTrainingRun.started_at.desc())\
        .limit(limit)\
        .all()
    return runs

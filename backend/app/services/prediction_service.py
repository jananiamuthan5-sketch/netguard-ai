"""
NetGuard AI - Prediction Service Layer
Encapsulates business logic for database persistence and coordination with the ML inference engine.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionCreate


class PredictionService:
    """
    Service class managing CRUD operations for network intrusion analysis records.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Prediction]:
        """
        Retrieves paginated list of historic prediction runs.
        """
        return self.db.query(Prediction).offset(skip).limit(limit).all()

    def get_by_id(self, prediction_id: int) -> Optional[Prediction]:
        """
        Retrieves a single prediction record by ID.
        """
        return self.db.query(Prediction).filter(Prediction.id == prediction_id).first()

    def create(self, record_in: PredictionCreate) -> Prediction:
        """
        Persists a newly completed network analysis session to SQLite.
        """
        db_obj = Prediction(
            file_name=record_in.file_name,
            total_records=record_in.total_records,
            normal_count=record_in.normal_count,
            intrusion_count=record_in.intrusion_count,
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

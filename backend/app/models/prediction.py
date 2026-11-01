"""
NetGuard AI - Prediction ORM Model
Defines the database schema for persisting network traffic analysis runs and prediction history.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String
from app.database.session import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class Prediction(Base):
    """
    SQLAlchemy Model representing a network traffic analysis session/record.
    Stores metadata regarding analyzed network logs, flow counts, and intrusion counts.
    """
    __tablename__ = "predictions"

    # Primary key identifier
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Name of the uploaded network capture/log file analyzed
    file_name = Column(String(255), nullable=False, index=True)

    # Total number of network flow records parsed in this analysis
    total_records = Column(Integer, nullable=False, default=0)

    # Count of records classified as Normal/Benign traffic
    normal_count = Column(Integer, nullable=False, default=0)

    # Count of records classified as Potential Intrusion/Malicious traffic
    intrusion_count = Column(Integer, nullable=False, default=0)

    # Timestamp of when the prediction analysis took place
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<Prediction(id={self.id}, file_name='{self.file_name}', "
            f"total={self.total_records}, normal={self.normal_count}, intrusion={self.intrusion_count})>"
        )

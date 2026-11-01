"""
NetGuard AI - Prediction Pydantic Schemas
Defines request and response validation schemas for network intrusion predictions.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PredictionBase(BaseModel):
    """
    Base properties for network analysis prediction record.
    """
    file_name: str = Field(..., description="Name of the analyzed network log or flow file", max_length=255)
    total_records: int = Field(default=0, ge=0, description="Total number of network flow records parsed")
    normal_count: int = Field(default=0, ge=0, description="Count of records classified as Normal/Benign")
    intrusion_count: int = Field(default=0, ge=0, description="Count of records classified as Intrusion/Malicious")


class PredictionCreate(PredictionBase):
    """
    Schema used when creating a new prediction record in the database.
    """
    pass


class PredictionResponse(PredictionBase):
    """
    Schema for returning a prediction record via API.
    """
    id: int = Field(..., description="Unique database identifier for this prediction record")
    created_at: datetime = Field(..., description="Timestamp of when prediction was performed")

    model_config = ConfigDict(from_attributes=True)

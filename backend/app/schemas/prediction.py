"""
NetGuard AI - Prediction Pydantic Schemas
Defines request and response validation schemas for network intrusion predictions.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
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
    Schema for returning a persisted prediction record via API.
    """
    id: int = Field(..., description="Unique database identifier for this prediction record")
    created_at: datetime = Field(..., description="UTC timestamp of when prediction was performed")

    model_config = ConfigDict(from_attributes=True)


class AnalyzedRecordDetail(BaseModel):
    """Classification output for an individual evaluated network flow record."""
    id: int = Field(..., description="1-based row index from the uploaded CSV")
    protocol: str = Field(..., description="Transport protocol (e.g., tcp, udp, icmp)")
    service: str = Field(..., description="Network destination service (e.g., http, private)")
    flag: str = Field(..., description="Connection status flag (e.g., SF, S0, REJ)")
    src_bytes: int = Field(..., description="Bytes transmitted from source to destination")
    dst_bytes: int = Field(..., description="Bytes transmitted from destination to source")
    prediction: str = Field(..., description="Classification label: NORMAL or POTENTIAL INTRUSION")
    is_intrusion: bool = Field(..., description="True when flagged as a potential intrusion")
    confidence: float = Field(..., description="Model confidence percentage for predicted class")
    threat_score: float = Field(..., description="Probability percentage of intrusion class")
    severity: str = Field(..., description="Severity rating: BENIGN, MEDIUM, HIGH, or CRITICAL")


class AnalysisResponse(BaseModel):
    """Response schema for CSV network traffic classification analysis."""
    session_id: int = Field(..., description="Database ID assigned to this persisted session")
    file_name: str = Field(..., description="Uploaded CSV file name")
    created_at: str = Field(..., description="ISO-8601 UTC timestamp")
    total_records: int = Field(..., description="Total number of flows evaluated")
    normal_count: int = Field(..., description="Number of flows classified as NORMAL")
    intrusion_count: int = Field(..., description="Number of flows classified as POTENTIAL INTRUSION")
    intrusion_percentage: float = Field(..., description="Percentage of intrusion flows in upload")
    threat_status: str = Field(..., description="Overall capture status: NORMAL_TRAFFIC or THREAT_DETECTED")
    evaluated_sample_count: int = Field(..., description="Count of detailed record predictions returned")
    records: List[AnalyzedRecordDetail] = Field(default_factory=list, description="Per-flow prediction details")


class SessionAnalyticsItem(BaseModel):
    """Per-session analytics summary used for longitudinal trend charts."""
    id: int
    file_name: str
    total: int
    normal: int
    intrusion: int
    intrusion_rate: float
    created_at: str


class AnalyticsResponse(BaseModel):
    """Aggregated security telemetry metrics computed from SQLite history."""
    total_sessions: int = Field(..., description="Total uploaded analysis sessions recorded")
    total_records: int = Field(..., description="Cumulative flow records evaluated")
    normal_count: int = Field(..., description="Cumulative normal flows")
    intrusion_count: int = Field(..., description="Cumulative detected intrusions")
    intrusion_rate: float = Field(..., description="Overall intrusion percentage across all history")
    threat_level: str = Field(..., description="Aggregated posture: NORMAL, LOW, MODERATE, or ELEVATED")
    sessions: List[SessionAnalyticsItem] = Field(default_factory=list, description="Session breakdown list")


class ModelInfoResponse(BaseModel):
    """Metadata and benchmark evaluation metrics for the active ML pipeline."""
    trained: bool = Field(..., description="Whether a trained model artifact is available")
    status: str = Field(..., description="Current model status: Active, Untrained, or Error")
    model_name: Optional[str] = Field(None, description="Selected production classifier algorithm")
    dataset_name: Optional[str] = Field(None, description="Benchmark dataset used for training")
    evaluation_metrics: Optional[Dict[str, Any]] = Field(None, description="Test set performance metrics")

    model_config = ConfigDict(extra="allow")

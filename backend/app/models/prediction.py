"""Pydantic models for predictions"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PredictionRequest(BaseModel):
    """Request model for match prediction"""
    home_team: str = Field(..., description="Home team name")
    away_team: str = Field(..., description="Away team name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "home_team": "Arsenal",
                "away_team": "Chelsea"
            }
        }


class PredictionResponse(BaseModel):
    """Response model for match prediction"""
    home_team: str
    away_team: str
    home_win_probability: float = Field(..., ge=0, le=1)
    draw_probability: float = Field(..., ge=0, le=1)
    away_win_probability: float = Field(..., ge=0, le=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "home_team": "Arsenal",
                "away_team": "Chelsea",
                "home_win_probability": 0.45,
                "draw_probability": 0.30,
                "away_win_probability": 0.25
            }
        }


class PredictionHistoryResponse(BaseModel):
    """Response model for prediction history"""
    id: int
    home_team: str
    away_team: str
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    predicted_outcome: str
    confidence: float
    actual_outcome: Optional[str] = None
    is_correct: Optional[bool] = None
    created_at: datetime
    model_version: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "home_team": "Arsenal",
                "away_team": "Chelsea",
                "home_win_probability": 0.69,
                "draw_probability": 0.19,
                "away_win_probability": 0.12,
                "predicted_outcome": "home_win",
                "confidence": 0.69,
                "actual_outcome": None,
                "is_correct": None,
                "created_at": "2024-11-06T10:00:00",
                "model_version": "v1.0"
            }
        }


class ModelAccuracyResponse(BaseModel):
    """Response model for model accuracy statistics"""
    total_predictions: int
    correct_predictions: int
    accuracy_percentage: float
    model_version: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_predictions": 100,
                "correct_predictions": 62,
                "accuracy_percentage": 62.0,
                "model_version": "v1.0"
            }
        }

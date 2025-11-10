"""Prediction endpoints"""
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prediction import (
    PredictionRequest, 
    PredictionResponse, 
    PredictionHistoryResponse,
    ModelAccuracyResponse
)
from app.database import get_db
from app.services import database_service
from typing import List, Optional
import json


router = APIRouter(prefix="/api/predict", tags=["predictions"])


@router.get("/teams", response_model=List[str])
async def get_teams(request: Request):
    """Get list of available teams"""
    try:
        predictor = request.app.state.predictor
        if predictor is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please train and deploy the model first."
            )
        teams = predictor.get_teams()
        return sorted(teams)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=PredictionResponse)
async def predict_match(
    request: Request,
    prediction_request: PredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Predict match outcome probabilities"""
    try:
        predictor = request.app.state.predictor
        if predictor is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please train and deploy the model first."
            )
        
        # Validate teams are different
        if prediction_request.home_team == prediction_request.away_team:
            raise HTTPException(
                status_code=400,
                detail="Home and away teams must be different"
            )
        
        # Get prediction from model
        probabilities = predictor.predict(
            home_team=prediction_request.home_team,
            away_team=prediction_request.away_team
        )
        
        # Save prediction to database
        try:
            prediction_record = await database_service.create_prediction(
                db=db,
                home_team=prediction_request.home_team,
                away_team=prediction_request.away_team,
                home_win_prob=probabilities["home_win"],
                draw_prob=probabilities["draw"],
                away_win_prob=probabilities["away_win"],
                model_version="v1.0",  # You can make this dynamic
            )
            print(f"✓ Saved prediction to database (ID: {prediction_record.id})")
        except Exception as db_error:
            # Log error but don't fail the prediction
            print(f"⚠️  Failed to save prediction to database: {db_error}")
        
        return PredictionResponse(
            home_team=prediction_request.home_team,
            away_team=prediction_request.away_team,
            home_win_probability=probabilities["home_win"],
            draw_probability=probabilities["draw"],
            away_win_probability=probabilities["away_win"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/history", response_model=List[PredictionHistoryResponse])
async def get_prediction_history(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, le=200),
    skip: int = Query(default=0, ge=0),
    home_team: Optional[str] = None,
    away_team: Optional[str] = None,
):
    """Get prediction history with optional filtering"""
    try:
        predictions = await database_service.get_prediction_history(
            db=db,
            limit=limit,
            skip=skip,
            home_team=home_team,
            away_team=away_team,
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")


@router.get("/stats", response_model=ModelAccuracyResponse)
async def get_model_stats(
    db: AsyncSession = Depends(get_db),
    model_version: Optional[str] = None,
):
    """Get model accuracy statistics"""
    try:
        stats = await database_service.get_model_accuracy(
            db=db,
            model_version=model_version,
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")


@router.get("/predictions/{prediction_id}", response_model=PredictionHistoryResponse)
async def get_prediction(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific prediction by ID"""
    try:
        prediction = await database_service.get_prediction_by_id(db, prediction_id)
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving prediction: {str(e)}")

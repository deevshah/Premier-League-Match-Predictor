"""API routes for analytics and dashboard data"""
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import database_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db),
):
    """
    Get overview analytics for dashboard
    
    Returns:
    - Total predictions made
    - Model accuracy
    - Predictions this week
    - Active model version
    """
    try:
        # Get total predictions
        from sqlalchemy import select, func
        from app.models.database_models import Prediction
        
        total_result = await db.execute(select(func.count(Prediction.id)))
        total_predictions = total_result.scalar()
        
        # Get predictions this week
        week_ago = datetime.utcnow() - timedelta(days=7)
        week_result = await db.execute(
            select(func.count(Prediction.id)).where(Prediction.created_at >= week_ago)
        )
        predictions_this_week = week_result.scalar()
        
        # Get model accuracy
        accuracy_stats = await database_service.get_model_accuracy(db)
        
        # Get active model version
        active_model = await database_service.get_active_model_version(db)
        model_version = active_model.version if active_model else "v1.0"
        
        return {
            "total_predictions": total_predictions,
            "predictions_this_week": predictions_this_week,
            "accuracy_percentage": accuracy_stats["accuracy_percentage"],
            "total_predictions_with_outcomes": accuracy_stats["total_predictions"],
            "correct_predictions": accuracy_stats["correct_predictions"],
            "active_model_version": model_version,
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview: {str(e)}")


@router.get("/recent-predictions")
async def get_recent_predictions(
    limit: int = Query(10, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get recent predictions for dashboard"""
    try:
        predictions = await database_service.get_prediction_history(
            db=db,
            limit=limit,
            skip=0,
        )
        
        return {
            "count": len(predictions),
            "predictions": [
                {
                    "id": p.id,
                    "home_team": p.home_team,
                    "away_team": p.away_team,
                    "predicted_outcome": p.predicted_outcome,
                    "confidence": p.confidence,
                    "actual_outcome": p.actual_outcome,
                    "is_correct": p.is_correct,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
                for p in predictions
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching predictions: {str(e)}")


@router.get("/prediction-distribution")
async def get_prediction_distribution(
    db: AsyncSession = Depends(get_db),
):
    """
    Get distribution of prediction outcomes
    
    Returns count and percentage for:
    - Home win predictions
    - Draw predictions
    - Away win predictions
    """
    try:
        from sqlalchemy import select, func
        from app.models.database_models import Prediction
        
        # Count each outcome type
        result = await db.execute(
            select(
                Prediction.predicted_outcome,
                func.count(Prediction.id).label('count')
            ).group_by(Prediction.predicted_outcome)
        )
        
        distribution = {row[0]: row[1] for row in result}
        total = sum(distribution.values())
        
        # Calculate percentages
        return {
            "home_win": {
                "count": distribution.get("home_win", 0),
                "percentage": round(distribution.get("home_win", 0) / total * 100, 1) if total > 0 else 0
            },
            "draw": {
                "count": distribution.get("draw", 0),
                "percentage": round(distribution.get("draw", 0) / total * 100, 1) if total > 0 else 0
            },
            "away_win": {
                "count": distribution.get("away_win", 0),
                "percentage": round(distribution.get("away_win", 0) / total * 100, 1) if total > 0 else 0
            },
            "total": total
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching distribution: {str(e)}")


@router.get("/accuracy-by-confidence")
async def get_accuracy_by_confidence(
    db: AsyncSession = Depends(get_db),
):
    """
    Get model accuracy broken down by confidence levels
    
    Returns accuracy for different confidence ranges:
    0-50%, 50-60%, 60-70%, 70-80%, 80-90%, 90-100%
    """
    try:
        from sqlalchemy import select, and_
        from app.models.database_models import Prediction
        
        confidence_ranges = [
            (0.0, 0.5, "0-50%"),
            (0.5, 0.6, "50-60%"),
            (0.6, 0.7, "60-70%"),
            (0.7, 0.8, "70-80%"),
            (0.8, 0.9, "80-90%"),
            (0.9, 1.0, "90-100%"),
        ]
        
        results = []
        
        for min_conf, max_conf, label in confidence_ranges:
            # Get predictions in this confidence range with outcomes
            query = select(Prediction).where(
                and_(
                    Prediction.confidence >= min_conf,
                    Prediction.confidence < max_conf,
                    Prediction.actual_outcome.isnot(None)
                )
            )
            
            result = await db.execute(query)
            predictions = result.scalars().all()
            
            total = len(predictions)
            correct = sum(1 for p in predictions if p.is_correct)
            accuracy = (correct / total * 100) if total > 0 else 0
            
            results.append({
                "range": label,
                "min_confidence": min_conf,
                "max_confidence": max_conf,
                "total_predictions": total,
                "correct_predictions": correct,
                "accuracy": round(accuracy, 1)
            })
        
        return {
            "confidence_ranges": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching accuracy by confidence: {str(e)}")


@router.get("/team/{team_name}")
async def get_team_analytics(
    team_name: str,
    db: AsyncSession = Depends(get_db),
):
    """Get comprehensive analytics for a specific team"""
    try:
        # Get basic team stats
        team_stats = await database_service.get_team_prediction_stats(db, team_name)
        
        # Get all predictions involving this team
        from sqlalchemy import select, or_
        from app.models.database_models import Prediction
        
        result = await db.execute(
            select(Prediction).where(
                or_(
                    Prediction.home_team == team_name,
                    Prediction.away_team == team_name
                )
            ).order_by(Prediction.created_at.desc())
        )
        
        predictions = result.scalars().all()
        
        # Calculate win rate predictions
        predicted_wins = sum(
            1 for p in predictions
            if (p.home_team == team_name and p.predicted_outcome == "home_win") or
               (p.away_team == team_name and p.predicted_outcome == "away_win")
        )
        
        # Calculate actual win rate (where outcomes exist)
        predictions_with_outcomes = [p for p in predictions if p.actual_outcome]
        actual_wins = sum(
            1 for p in predictions_with_outcomes
            if (p.home_team == team_name and p.actual_outcome == "home_win") or
               (p.away_team == team_name and p.actual_outcome == "away_win")
        )
        
        # Average confidence
        avg_confidence = sum(p.confidence for p in predictions) / len(predictions) if predictions else 0
        
        return {
            "team": team_name,
            "total_predictions": team_stats["total_predictions"],
            "as_home_team": team_stats["as_home_team"],
            "as_away_team": team_stats["as_away_team"],
            "predicted_win_rate": round(predicted_wins / len(predictions) * 100, 1) if predictions else 0,
            "actual_win_rate": round(actual_wins / len(predictions_with_outcomes) * 100, 1) if predictions_with_outcomes else None,
            "average_confidence": round(avg_confidence, 3),
            "predictions_with_outcomes": len(predictions_with_outcomes),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching team analytics: {str(e)}")

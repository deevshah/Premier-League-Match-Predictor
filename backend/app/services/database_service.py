"""Database CRUD operations for predictions"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database_models import Prediction, ModelVersion, PredictionStats


async def create_prediction(
    db: AsyncSession,
    home_team: str,
    away_team: str,
    home_win_prob: float,
    draw_prob: float,
    away_win_prob: float,
    model_version: Optional[str] = None,
    match_date: Optional[datetime] = None,
) -> Prediction:
    """Create a new prediction record"""
    
    # Determine predicted outcome (highest probability)
    probs = {
        'home_win': home_win_prob,
        'draw': draw_prob,
        'away_win': away_win_prob
    }
    predicted_outcome = max(probs, key=probs.get)
    confidence = max(probs.values())
    
    prediction = Prediction(
        home_team=home_team,
        away_team=away_team,
        home_win_probability=home_win_prob,
        draw_probability=draw_prob,
        away_win_probability=away_win_prob,
        predicted_outcome=predicted_outcome,
        confidence=confidence,
        model_version=model_version,
        match_date=match_date,
    )
    
    db.add(prediction)
    await db.flush()
    await db.refresh(prediction)
    
    return prediction


async def get_prediction_history(
    db: AsyncSession,
    limit: int = 100,
    skip: int = 0,
    home_team: Optional[str] = None,
    away_team: Optional[str] = None,
) -> List[Prediction]:
    """Get prediction history with optional filtering"""
    
    query = select(Prediction).order_by(Prediction.created_at.desc())
    
    if home_team:
        query = query.where(Prediction.home_team == home_team)
    if away_team:
        query = query.where(Prediction.away_team == away_team)
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


async def get_prediction_by_id(db: AsyncSession, prediction_id: int) -> Optional[Prediction]:
    """Get a specific prediction by ID"""
    result = await db.execute(
        select(Prediction).where(Prediction.id == prediction_id)
    )
    return result.scalar_one_or_none()


async def update_prediction_outcome(
    db: AsyncSession,
    prediction_id: int,
    actual_outcome: str,
) -> Optional[Prediction]:
    """Update prediction with actual match outcome"""
    prediction = await get_prediction_by_id(db, prediction_id)
    
    if prediction:
        prediction.actual_outcome = actual_outcome
        prediction.is_correct = (prediction.predicted_outcome == actual_outcome)
        await db.flush()
        await db.refresh(prediction)
    
    return prediction


async def get_model_accuracy(
    db: AsyncSession,
    model_version: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> dict:
    """Calculate model accuracy statistics"""
    
    # Build query conditions
    conditions = [Prediction.actual_outcome.isnot(None)]
    
    if model_version:
        conditions.append(Prediction.model_version == model_version)
    if start_date:
        conditions.append(Prediction.created_at >= start_date)
    if end_date:
        conditions.append(Prediction.created_at <= end_date)
    
    # Get total predictions with outcomes
    total_query = select(func.count(Prediction.id)).where(and_(*conditions))
    total_result = await db.execute(total_query)
    total = total_result.scalar()
    
    # Get correct predictions
    correct_query = select(func.count(Prediction.id)).where(
        and_(*conditions, Prediction.is_correct == True)
    )
    correct_result = await db.execute(correct_query)
    correct = correct_result.scalar()
    
    # Calculate accuracy
    accuracy = (correct / total * 100) if total > 0 else 0
    
    return {
        "total_predictions": total,
        "correct_predictions": correct,
        "accuracy_percentage": round(accuracy, 2),
        "model_version": model_version,
    }


async def get_team_prediction_stats(
    db: AsyncSession,
    team_name: str,
) -> dict:
    """Get prediction statistics for a specific team"""
    
    # As home team
    home_query = select(Prediction).where(Prediction.home_team == team_name)
    home_result = await db.execute(home_query)
    home_predictions = home_result.scalars().all()
    
    # As away team
    away_query = select(Prediction).where(Prediction.away_team == team_name)
    away_result = await db.execute(away_query)
    away_predictions = away_result.scalars().all()
    
    total = len(home_predictions) + len(away_predictions)
    
    return {
        "team": team_name,
        "total_predictions": total,
        "as_home_team": len(home_predictions),
        "as_away_team": len(away_predictions),
    }


async def create_model_version(
    db: AsyncSession,
    version: str,
    model_type: str,
    accuracy: Optional[float] = None,
    precision: Optional[float] = None,
    train_samples: Optional[int] = None,
    features: Optional[str] = None,
    trained_date: Optional[datetime] = None,
    is_active: bool = False,
    notes: Optional[str] = None,
) -> ModelVersion:
    """Create a new model version record"""
    
    model = ModelVersion(
        version=version,
        model_type=model_type,
        accuracy=accuracy,
        precision=precision,
        train_samples=train_samples,
        features=features,
        trained_date=trained_date or datetime.utcnow(),
        is_active=is_active,
        notes=notes,
    )
    
    db.add(model)
    await db.flush()
    await db.refresh(model)
    
    return model


async def get_active_model_version(db: AsyncSession) -> Optional[ModelVersion]:
    """Get the currently active model version"""
    result = await db.execute(
        select(ModelVersion).where(ModelVersion.is_active == True)
    )
    return result.scalar_one_or_none()


async def set_active_model(db: AsyncSession, version: str) -> ModelVersion:
    """Set a model version as active (deactivates others)"""
    
    # Deactivate all models
    deactivate_query = select(ModelVersion)
    result = await db.execute(deactivate_query)
    all_models = result.scalars().all()
    
    for model in all_models:
        model.is_active = False
    
    # Activate the specified version
    activate_result = await db.execute(
        select(ModelVersion).where(ModelVersion.version == version)
    )
    model = activate_result.scalar_one_or_none()
    
    if model:
        model.is_active = True
        await db.flush()
        await db.refresh(model)
    
    return model

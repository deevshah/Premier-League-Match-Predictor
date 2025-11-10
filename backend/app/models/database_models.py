"""SQLAlchemy database models"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Index
from sqlalchemy.sql import func
from app.database import Base


class Prediction(Base):
    """Store match predictions and their outcomes"""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    home_team = Column(String(100), nullable=False, index=True)
    away_team = Column(String(100), nullable=False, index=True)
    
    # Predicted probabilities
    home_win_probability = Column(Float, nullable=False)
    draw_probability = Column(Float, nullable=False)
    away_win_probability = Column(Float, nullable=False)
    
    # Predicted outcome (highest probability)
    predicted_outcome = Column(String(20), nullable=False)  # 'home_win', 'draw', 'away_win'
    confidence = Column(Float, nullable=False)  # Max probability
    
    # Actual outcome (to be updated later)
    actual_outcome = Column(String(20), nullable=True)  # 'home_win', 'draw', 'away_win'
    is_correct = Column(Boolean, nullable=True)
    
    # Model info
    model_version = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    match_date = Column(DateTime(timezone=True), nullable=True)
    
    # Add composite index for common queries
    __table_args__ = (
        Index('idx_teams', 'home_team', 'away_team'),
        Index('idx_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Prediction(id={self.id}, {self.home_team} vs {self.away_team}, outcome={self.predicted_outcome})>"


class ModelVersion(Base):
    """Track different model versions and their performance"""
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), unique=True, nullable=False, index=True)
    
    # Model metadata
    model_type = Column(String(100), nullable=False)  # 'RandomForestClassifier', etc.
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    train_samples = Column(Integer, nullable=True)
    test_samples = Column(Integer, nullable=True)
    
    # Feature info
    features = Column(Text, nullable=True)  # JSON string of feature list
    
    # Status
    is_active = Column(Boolean, default=False)
    
    # Metadata
    trained_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ModelVersion(version={self.version}, active={self.is_active})>"


class PredictionStats(Base):
    """Aggregate statistics for model performance tracking"""
    __tablename__ = "prediction_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Performance metrics
    total_predictions = Column(Integer, default=0)
    correct_predictions = Column(Integer, default=0)
    accuracy_rate = Column(Float, nullable=True)
    
    # By outcome type
    home_wins_predicted = Column(Integer, default=0)
    draws_predicted = Column(Integer, default=0)
    away_wins_predicted = Column(Integer, default=0)
    
    home_wins_correct = Column(Integer, default=0)
    draws_correct = Column(Integer, default=0)
    away_wins_correct = Column(Integer, default=0)
    
    # Average confidence
    avg_confidence = Column(Float, nullable=True)
    
    # Model version
    model_version = Column(String(50), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<PredictionStats(date={self.date}, accuracy={self.accuracy_rate})>"


class TeamPerformance(Base):
    """Track historical team performance for features"""
    __tablename__ = "team_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), nullable=False, index=True)
    
    # Match stats
    season = Column(String(20), nullable=False)
    matches_played = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    
    # Scoring stats
    goals_for = Column(Float, nullable=True)
    goals_against = Column(Float, nullable=True)
    shots = Column(Float, nullable=True)
    shots_on_target = Column(Float, nullable=True)
    
    # Additional features
    avg_possession = Column(Float, nullable=True)
    avg_distance = Column(Float, nullable=True)
    
    # Metadata
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_team_season', 'team_name', 'season'),
    )
    
    def __repr__(self):
        return f"<TeamPerformance(team={self.team_name}, season={self.season})>"

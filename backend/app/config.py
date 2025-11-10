"""Configuration settings for the API"""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings"""
    
    app_name: str = "Premier League Match Predictor API"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./premier_league.db"  # Default SQLite for local dev
    # For PostgreSQL: "postgresql+asyncpg://user:password@localhost/dbname"
    
    # CORS settings
    cors_origins: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
    ]
    cors_origin_regex: Optional[str] = r"https://.*\.vercel\.app"
    
    # Model paths
    model_file_path: str = "data/model.joblib"
    feature_meta_file_path: str = "data/feature_meta.json"
    reference_data_file_path: str = "data/features_reference.csv"
    
    model_config = {
        "env_file": ".env",
        "protected_namespaces": ('settings_',),
    }


settings = Settings()

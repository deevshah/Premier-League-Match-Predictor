"""Predictor service for loading model and making predictions"""
import joblib
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List
from app.config import settings


class PredictorService:
    """Service for making match predictions"""
    
    def __init__(self):
        """Initialize predictor by loading model and data"""
        self.base_path = Path(__file__).parent.parent.parent
        self.model = self._load_model()
        self.feature_meta = self._load_feature_meta()
        self.reference_data = self._load_reference_data()
    
    def _load_model(self):
        """Load the trained model"""
        model_path = self.base_path / settings.model_file_path
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        return joblib.load(model_path)
    
    def _load_feature_meta(self) -> Dict:
        """Load feature metadata"""
        meta_path = self.base_path / settings.feature_meta_file_path
        if not meta_path.exists():
            raise FileNotFoundError(f"Feature metadata not found at {meta_path}")
        with open(meta_path, 'r') as f:
            return json.load(f)
    
    def _load_reference_data(self) -> pd.DataFrame:
        """Load reference data for features"""
        data_path = self.base_path / settings.reference_data_file_path
        if not data_path.exists():
            raise FileNotFoundError(f"Reference data not found at {data_path}")
        return pd.read_csv(data_path)
    
    def get_teams(self) -> List[str]:
        """Get list of available teams"""
        if "Team" in self.reference_data.columns:
            return self.reference_data["Team"].unique().tolist()
        else:
            raise ValueError("Team column not found in reference data")
    
    def predict(self, home_team: str, away_team: str) -> Dict[str, float]:
        """
        Make a prediction for a match between two teams
        
        Args:
            home_team: Name of the home team
            away_team: Name of the away team
            
        Returns:
            Dictionary with win/draw/loss probabilities
        """
        # Build feature vector from reference data
        features = self._build_features(home_team, away_team)
        
        # Make prediction
        probabilities = self.model.predict_proba([features])[0]
        
        # Model predicts binary: 0 = Loss/Draw, 1 = Win
        # probabilities[0] = probability of loss/draw
        # probabilities[1] = probability of win
        
        home_win_prob = float(probabilities[1])
        loss_draw_prob = float(probabilities[0])
        
        # For simplicity, split loss/draw probability as 60% draw, 40% away win
        # In a more sophisticated model, you'd train a multi-class classifier
        draw_prob = loss_draw_prob * 0.6
        away_win_prob = loss_draw_prob * 0.4
        
        # Normalize probabilities to sum to 1.0
        total = home_win_prob + draw_prob + away_win_prob
        home_win_prob = home_win_prob / total
        draw_prob = draw_prob / total
        away_win_prob = away_win_prob / total
        
        # Determine predicted outcome
        probs = {
            'home_win': home_win_prob,
            'draw': draw_prob,
            'away_win': away_win_prob
        }
        predicted_outcome = max(probs, key=probs.get)
        confidence = max(probs.values())
        
        return {
            "home_win": home_win_prob,
            "draw": draw_prob,
            "away_win": away_win_prob,
            "home_win_probability": home_win_prob,
            "draw_probability": draw_prob,
            "away_win_probability": away_win_prob,
            "predicted_outcome": predicted_outcome,
            "confidence": confidence,
            "model_version": "v1.0"
        }
    
    def _build_features(self, home_team: str, away_team: str) -> List[float]:
        """
        Build feature vector for prediction based on trained model features
        
        Features in order:
        1. venue_code (0 for away, 1 for home)
        2. opponent_code (encoded opponent)
        3. hour (default to 15:00 kickoff)
        4. day_code (default to Saturday = 5)
        5-12. Rolling averages: GF, GA, Sh, SoT, Dist, FK, PK, PKatt
        """
        # Get team statistics from reference data
        home_stats = self.reference_data[self.reference_data["Team"] == home_team]
        away_stats = self.reference_data[self.reference_data["Team"] == away_team]
        
        if home_stats.empty:
            raise ValueError(f"Team '{home_team}' not found in reference data")
        if away_stats.empty:
            raise ValueError(f"Team '{away_team}' not found in reference data")
        
        # Build features in the exact order expected by the model
        features = []
        
        # 1. venue_code: 1 for home, 0 for away (home team always plays at home)
        features.append(1)
        
        # 2. opponent_code: Simple hash-based encoding for opponent
        # In production, you'd want to maintain the same encoding as training
        # For now, use a simple hash
        opponent_code = hash(away_team) % 100
        features.append(opponent_code)
        
        # 3. hour: Default to 15:00 (typical Premier League kickoff time)
        features.append(15)
        
        # 4. day_code: Default to Saturday (5)
        features.append(5)
        
        # 5-12. Rolling average features from home team
        rolling_cols = self.feature_meta.get("rolling_cols", ["GF", "GA", "Sh", "SoT", "Dist", "FK", "PK", "PKatt"])
        for col in rolling_cols:
            rolling_col = f"{col}_rolling"
            if rolling_col in home_stats.columns:
                features.append(float(home_stats[rolling_col].iloc[0]))
            else:
                # Fallback to base column if rolling not available
                if col in home_stats.columns:
                    features.append(float(home_stats[col].iloc[0]))
                else:
                    features.append(0.0)
        
        return features

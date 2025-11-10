"""API routes for Premier League fixtures."""
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.prediction import PredictionRequest, PredictionResponse
from app.services.predictor import PredictorService

router = APIRouter(prefix="/api/fixtures", tags=["fixtures"])


def get_predictor() -> PredictorService:
    """Return the shared predictor service instance."""
    from app.main import predictor

    return predictor


def to_slug(name: str) -> str:
    """Normalise club names to slug form for comparisons."""
    if not isinstance(name, str):
        return ""

    cleaned = name.lower()
    cleaned = cleaned.replace("&", "and")
    cleaned = cleaned.replace("fc", "")
    cleaned = cleaned.replace(".", "")
    cleaned = cleaned.replace("'", "")
    cleaned = " ".join(cleaned.split())
    return cleaned.replace(" ", "-")


@router.get("/upcoming")
async def get_upcoming_fixtures(
    limit: Optional[int] = 50,
    home_team: Optional[str] = None,
    away_team: Optional[str] = None,
):
    """Return upcoming fixtures optionally filtered by home/away team."""
    fixtures_path = Path("data/upcoming_fixtures.csv")

    if not fixtures_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Fixtures data not found. Run scrape_fixtures.ipynb to generate it.",
        )

    try:
        fixtures_df = pd.read_csv(fixtures_path)

        if home_team:
            fixtures_df = fixtures_df[fixtures_df["home_team"] == home_team]
        if away_team:
            fixtures_df = fixtures_df[fixtures_df["away_team"] == away_team]

        fixtures_df = fixtures_df.head(limit)
        fixtures = fixtures_df.to_dict("records")

        return {"count": len(fixtures), "fixtures": fixtures}
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=500, detail=f"Error loading fixtures: {exc}") from exc


@router.get("/teams/{team_slug}/upcoming")
async def get_team_upcoming_fixtures(
    team_slug: str,
    limit: Optional[int] = 20,
    predictor: PredictorService = Depends(get_predictor),
):
    """Return upcoming fixtures (with predictions) for a given club slug."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not available. Model not loaded.",
        )

    fixtures_path = Path("data/upcoming_fixtures.csv")
    if not fixtures_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Fixtures data not found. Run scrape_fixtures.ipynb to generate it.",
        )

    try:
        fixtures_df = pd.read_csv(fixtures_path)
        fixtures_df["home_team_slug"] = fixtures_df["home_team"].apply(to_slug)
        fixtures_df["away_team_slug"] = fixtures_df["away_team"].apply(to_slug)

        slug = to_slug(team_slug)
        matching = fixtures_df[
            (fixtures_df["home_team_slug"] == slug)
            | (fixtures_df["away_team_slug"] == slug)
        ].head(limit)

        if matching.empty:
            raise HTTPException(
                status_code=404,
                detail="No upcoming fixtures found for this team.",
            )

        results = []
        for _, fixture in matching.iterrows():
            home_team = fixture["home_team"]
            away_team = fixture["away_team"]
            prediction = predictor.predict(home_team, away_team)

            results.append(
                {
                    "match_date": fixture["match_date"],
                    "match_time": fixture.get("match_time", "TBD"),
                    "home_team": home_team,
                    "away_team": away_team,
                    "home_team_slug": to_slug(home_team),
                    "away_team_slug": to_slug(away_team),
                    "venue": fixture.get("venue", "Unknown"),
                    "prediction": {
                        "home_win_probability": prediction["home_win_probability"],
                        "draw_probability": prediction["draw_probability"],
                        "away_win_probability": prediction["away_win_probability"],
                        "predicted_outcome": prediction["predicted_outcome"],
                        "confidence": prediction["confidence"],
                    },
                }
            )

        return {"count": len(results), "fixtures_with_predictions": results}
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=500, detail=f"Error loading fixtures: {exc}") from exc


@router.get("/upcoming/with-predictions")
async def get_fixtures_with_predictions(
    limit: Optional[int] = 20,
    predictor: PredictorService = Depends(get_predictor),
):
    """Return upcoming fixtures enriched with model predictions."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not available. Model not loaded.",
        )

    fixtures_path = Path("data/upcoming_fixtures.csv")
    if not fixtures_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Fixtures data not found. Run scrape_fixtures.ipynb to generate it.",
        )

    try:
        fixtures_df = pd.read_csv(fixtures_path).head(limit)

        results = []
        for _, fixture in fixtures_df.iterrows():
            home_team = fixture["home_team"]
            away_team = fixture["away_team"]
            prediction = predictor.predict(home_team, away_team)

            results.append(
                {
                    "match_date": fixture["match_date"],
                    "match_time": fixture.get("match_time", "TBD"),
                    "home_team": home_team,
                    "away_team": away_team,
                    "home_team_slug": to_slug(home_team),
                    "away_team_slug": to_slug(away_team),
                    "venue": fixture.get("venue", "Unknown"),
                    "prediction": {
                        "home_win_probability": prediction["home_win_probability"],
                        "draw_probability": prediction["draw_probability"],
                        "away_win_probability": prediction["away_win_probability"],
                        "predicted_outcome": prediction["predicted_outcome"],
                        "confidence": prediction["confidence"],
                    },
                }
            )

        return {"count": len(results), "fixtures_with_predictions": results}
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(
            status_code=500,
            detail=f"Error generating predictions: {exc}",
        ) from exc


@router.post("/predict-fixture")
async def predict_specific_fixture(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_db),
    predictor: PredictorService = Depends(get_predictor),
):
    """Generate and store a prediction for a single fixture."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not available. Model not loaded.",
        )

    try:
        prediction = predictor.predict(request.home_team, request.away_team)

        from app.services.database_service import create_prediction

        db_prediction = await create_prediction(
            db=db,
            home_team=request.home_team,
            away_team=request.away_team,
            home_win_prob=prediction["home_win_probability"],
            draw_prob=prediction["draw_probability"],
            away_win_prob=prediction["away_win_probability"],
            model_version=prediction.get("model_version"),
            match_date=request.match_date,
        )

        await db.commit()

        return PredictionResponse(
            **prediction,
            prediction_id=db_prediction.id,
            created_at=db_prediction.created_at,
        )
    except Exception as exc:  # pragma: no cover - defensive guard
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc


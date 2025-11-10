"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import predictions, fixtures, analytics
from app.services.predictor import PredictorService
from app.database import init_db


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor service on startup
@app.on_event("startup")
async def startup_event():
    """Load model and data on startup"""
    # Initialize database
    try:
        await init_db()
        print("✓ Database initialized")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
    
    # Load ML model
    try:
        app.state.predictor = PredictorService()
        print("✓ Model and data loaded successfully")
    except FileNotFoundError as e:
        print(f"⚠️  Warning: {e}")
        print("⚠️  Running in development mode without model")
        print("⚠️  Train your model and place files in data/ directory")
        app.state.predictor = None
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        raise


# Include routers
app.include_router(predictions.router)
app.include_router(fixtures.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Premier League Match Predictor API",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": hasattr(app.state, "predictor") and app.state.predictor is not None
    }


# Make predictor globally accessible for dependency injection
predictor = None


@app.on_event("startup")
async def set_global_predictor():
    """Make predictor available globally"""
    global predictor
    predictor = app.state.predictor


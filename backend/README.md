# Premier League Match Predictor - Backend

FastAPI backend for predicting Premier League match outcomes using machine learning.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place your trained model and data files in the `data/` directory:
   - `model.joblib` - Trained model
   - `feature_meta.json` - Feature metadata
   - `features_reference.csv` - Reference data for predictions

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/teams` - Get list of available teams
- `POST /api/predict` - Predict match outcome

## Deployment on Render

1. Push this backend directory to a GitHub repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables if needed
6. Deploy

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── predictions.py
│   ├── models/
│   │   └── prediction.py
│   ├── services/
│   │   └── predictor.py
│   ├── ml/
│   ├── config.py
│   └── main.py
├── data/
│   ├── model.joblib
│   ├── feature_meta.json
│   └── features_reference.csv
├── notebooks/
├── requirements.txt
└── README.md
```

## Updating the Model

To update the model with new data:

1. Run your training notebooks locally
2. Replace the files in `data/` directory
3. Commit and push to GitHub
4. Render will automatically redeploy

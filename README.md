# Premier League Match Predictor

A full-stack web application that predicts Premier League match outcomes using machine learning.

## Project Structure

```
Premier League/
├── backend/          # FastAPI backend (deployed on Render)
│   ├── app/          # Application code
│   ├── data/         # Model and reference data
│   ├── notebooks/    # Training notebooks
│   └── requirements.txt
│
└── frontend/         # Next.js frontend (deployed on Vercel)
    ├── src/          # Source code
    ├── public/       # Static assets
    └── package.json
```

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend (Render)
1. Push backend to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Push frontend to GitHub
2. Import project on Vercel
3. Set framework to Next.js
4. Add environment variable: `NEXT_PUBLIC_API_URL` with your Render URL
5. Deploy

## Features

- **Machine Learning Predictions**: Uses trained ML model for match outcome predictions
- **RESTful API**: FastAPI backend with automatic documentation
- **Modern UI**: Next.js with TypeScript and responsive design
- **Visual Results**: Probability bars showing win/draw/loss chances
- **Easy Updates**: Manual model retraining and redeployment process

## Tech Stack

- **Backend**: FastAPI, Python, scikit-learn, pandas
- **Frontend**: Next.js 14, React, TypeScript
- **Deployment**: Render (backend), Vercel (frontend)

## Model Training

The model is trained locally using the notebooks in `backend/notebooks/`. After training:

1. Export model to `backend/data/model.joblib`
2. Export metadata to `backend/data/feature_meta.json`
3. Export reference data to `backend/data/features_reference.csv`
4. Commit and push changes
5. Automatic redeployment on Render

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/teams` - List available teams
- `POST /api/predict` - Predict match outcome

## License

MIT

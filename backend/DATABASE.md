# Database Layer Documentation

## Overview

The Premier League Match Predictor now includes a PostgreSQL/SQLite database layer for storing predictions, tracking model performance, and analyzing historical data.

## Features

- ✅ **Prediction Storage**: All predictions are automatically saved with timestamps
- ✅ **Prediction History**: Query past predictions with filtering options
- ✅ **Model Performance Tracking**: Track accuracy over time
- ✅ **Model Versioning**: Support for multiple model versions
- ✅ **Team Statistics**: Historical team performance data
- ✅ **Async Operations**: Fast, non-blocking database operations

## Database Schema

### Tables

#### `predictions`
Stores all match predictions made by the system.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| home_team | String | Home team name |
| away_team | String | Away team name |
| home_win_probability | Float | Predicted home win probability |
| draw_probability | Float | Predicted draw probability |
| away_win_probability | Float | Predicted away win probability |
| predicted_outcome | String | 'home_win', 'draw', or 'away_win' |
| confidence | Float | Highest probability (max of the three) |
| actual_outcome | String | Actual match result (nullable) |
| is_correct | Boolean | Whether prediction was correct (nullable) |
| model_version | String | Model version used |
| created_at | DateTime | When prediction was made |
| match_date | DateTime | Scheduled match date (nullable) |

#### `model_versions`
Track different model versions and their performance.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| version | String | Unique version identifier |
| model_type | String | Type of model (e.g., 'RandomForestClassifier') |
| accuracy | Float | Model accuracy on test set |
| precision | Float | Model precision |
| train_samples | Integer | Number of training samples |
| features | Text | JSON string of feature list |
| is_active | Boolean | Whether this version is currently active |
| trained_date | DateTime | When model was trained |
| notes | Text | Additional notes |

#### `prediction_stats`
Aggregate statistics for model performance tracking.

#### `team_performance`
Historical team performance metrics.

## API Endpoints

### Make a Prediction (with database storage)
```bash
POST /api/predict
```

**Request:**
```json
{
  "home_team": "Arsenal",
  "away_team": "Chelsea"
}
```

**Response:**
```json
{
  "home_team": "Arsenal",
  "away_team": "Chelsea",
  "home_win_probability": 0.69,
  "draw_probability": 0.19,
  "away_win_probability": 0.12
}
```
*Prediction is automatically saved to database*

### Get Prediction History
```bash
GET /api/predictions/history?limit=50&skip=0&home_team=Arsenal
```

**Query Parameters:**
- `limit` (default: 50, max: 200): Number of results
- `skip` (default: 0): Offset for pagination
- `home_team` (optional): Filter by home team
- `away_team` (optional): Filter by away team

**Response:**
```json
[
  {
    "id": 1,
    "home_team": "Arsenal",
    "away_team": "Chelsea",
    "home_win_probability": 0.69,
    "draw_probability": 0.19,
    "away_win_probability": 0.12,
    "predicted_outcome": "home_win",
    "confidence": 0.69,
    "actual_outcome": null,
    "is_correct": null,
    "created_at": "2024-11-06T10:00:00",
    "model_version": "v1.0"
  }
]
```

### Get Model Statistics
```bash
GET /api/predictions/stats?model_version=v1.0
```

**Response:**
```json
{
  "total_predictions": 100,
  "correct_predictions": 62,
  "accuracy_percentage": 62.0,
  "model_version": "v1.0"
}
```

### Get Specific Prediction
```bash
GET /api/predictions/{prediction_id}
```

## Local Development Setup

### Using SQLite (Default)

The app uses SQLite by default for local development - no additional setup needed!

```bash
# Database URL is automatically set to:
# sqlite+aiosqlite:///./premier_league.db
```

### Using PostgreSQL (Recommended for Production)

1. **Install PostgreSQL** (if not already installed):
```bash
brew install postgresql@15
brew services start postgresql@15
```

2. **Create Database**:
```bash
createdb premier_league
```

3. **Update `.env` file**:
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/premier_league
```

4. **Run Migrations**:
```bash
cd backend
alembic upgrade head
```

## Database Migrations

### Create a New Migration
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback
```bash
alembic downgrade -1  # Go back one migration
```

### View Migration History
```bash
alembic history
alembic current
```

## Production Deployment (Render)

### Set Up PostgreSQL on Render

1. **Create PostgreSQL Database**:
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Choose name and region
   - Copy the "Internal Database URL"

2. **Add Environment Variable**:
   - Go to your web service settings
   - Add environment variable:
     ```
     DATABASE_URL=<internal-database-url>
     ```
   - Replace `postgresql://` with `postgresql+asyncpg://`

3. **Run Migrations on Deploy**:
   
   Add to your render build command:
   ```bash
   pip install -r requirements.txt && alembic upgrade head
   ```

## Usage Examples

### Python Client
```python
import requests

# Make prediction
response = requests.post(
    "http://localhost:8000/api/predict",
    json={"home_team": "Arsenal", "away_team": "Chelsea"}
)
prediction = response.json()

# Get history
history = requests.get(
    "http://localhost:8000/api/predictions/history",
    params={"limit": 10, "home_team": "Arsenal"}
).json()

# Get stats
stats = requests.get("http://localhost:8000/api/predictions/stats").json()
print(f"Model Accuracy: {stats['accuracy_percentage']}%")
```

### JavaScript/Frontend
```javascript
// Make prediction
const prediction = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    home_team: 'Arsenal',
    away_team: 'Chelsea'
  })
}).then(r => r.json());

// Get history
const history = await fetch(
  'http://localhost:8000/api/predictions/history?limit=10'
).then(r => r.json());
```

## Future Enhancements

- [ ] Add endpoint to update predictions with actual match results
- [ ] Implement prediction accuracy dashboard
- [ ] Add team-specific prediction statistics
- [ ] Create scheduled jobs to update outcomes automatically
- [ ] Add GraphQL API for complex queries
- [ ] Implement caching layer (Redis) for frequently accessed data

## Troubleshooting

### Database Connection Issues

**SQLite locked error:**
```bash
# Close all connections and restart the server
pkill -f uvicorn
rm premier_league.db
alembic upgrade head
```

**PostgreSQL connection refused:**
```bash
# Check if PostgreSQL is running
brew services list
brew services start postgresql@15

# Test connection
psql -d premier_league
```

### Migration Issues

**Migrations out of sync:**
```bash
# Check current state
alembic current

# Reset to specific revision
alembic downgrade <revision_id>
alembic upgrade head
```

## Database Maintenance

### Backup (SQLite)
```bash
cp premier_league.db premier_league_backup_$(date +%Y%m%d).db
```

### Backup (PostgreSQL)
```bash
pg_dump premier_league > backup_$(date +%Y%m%d).sql
```

### View Database Content
```bash
# SQLite
sqlite3 premier_league.db "SELECT * FROM predictions LIMIT 5;"

# PostgreSQL
psql -d premier_league -c "SELECT * FROM predictions LIMIT 5;"
```

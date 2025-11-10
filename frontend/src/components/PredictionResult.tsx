interface PredictionResultProps {
  prediction: {
    home_team: string
    away_team: string
    home_win_probability: number
    draw_probability: number
    away_win_probability: number
  }
}

export default function PredictionResult({ prediction }: PredictionResultProps) {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="card result-container">
      <h2>Prediction Result</h2>
      <div className="match-title">
        {prediction.home_team} vs {prediction.away_team}
      </div>

      <div className="probability-item">
        <div className="probability-label">
          <span>{prediction.home_team} Win</span>
          <span>{formatPercentage(prediction.home_win_probability)}</span>
        </div>
        <div className="probability-bar">
          <div
            className="probability-fill home-win"
            style={{ width: formatPercentage(prediction.home_win_probability) }}
          >
            {formatPercentage(prediction.home_win_probability)}
          </div>
        </div>
      </div>

      <div className="probability-item">
        <div className="probability-label">
          <span>Draw</span>
          <span>{formatPercentage(prediction.draw_probability)}</span>
        </div>
        <div className="probability-bar">
          <div
            className="probability-fill draw"
            style={{ width: formatPercentage(prediction.draw_probability) }}
          >
            {formatPercentage(prediction.draw_probability)}
          </div>
        </div>
      </div>

      <div className="probability-item">
        <div className="probability-label">
          <span>{prediction.away_team} Win</span>
          <span>{formatPercentage(prediction.away_win_probability)}</span>
        </div>
        <div className="probability-bar">
          <div
            className="probability-fill away-win"
            style={{ width: formatPercentage(prediction.away_win_probability) }}
          >
            {formatPercentage(prediction.away_win_probability)}
          </div>
        </div>
      </div>
    </div>
  )
}

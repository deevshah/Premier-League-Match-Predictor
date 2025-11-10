'use client'

import { useState, useEffect } from 'react'
import PredictionForm from '@/components/PredictionForm'
import PredictionResult from '@/components/PredictionResult'

export default function PredictionsPage() {
  const [teams, setTeams] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<any>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/predict/teams`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }
      
      const data = await response.json()
      setTeams(data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const handlePredict = async (homeTeam: string, awayTeam: string) => {
    setError(null)
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          home_team: homeTeam,
          away_team: awayTeam,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Prediction failed')
      }

      const data = await response.json()
      setPrediction(data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Match Prediction</h2>
        {error && <div className="error">{error}</div>}
        
        {loading && !teams.length ? (
          <div className="loading">Loading teams...</div>
        ) : (
          <PredictionForm
            teams={teams}
            onPredict={handlePredict}
            loading={loading}
          />
        )}
      </div>

      {prediction && <PredictionResult prediction={prediction} />}
    </div>
  )
}

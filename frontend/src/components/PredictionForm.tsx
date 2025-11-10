'use client'

import { useState } from 'react'

interface PredictionFormProps {
  teams: string[]
  onPredict: (homeTeam: string, awayTeam: string) => void
  loading: boolean
}

export default function PredictionForm({ teams, onPredict, loading }: PredictionFormProps) {
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!homeTeam || !awayTeam) {
      alert('Please select both teams')
      return
    }
    
    if (homeTeam === awayTeam) {
      alert('Please select different teams')
      return
    }
    
    onPredict(homeTeam, awayTeam)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="home-team">Home Team</label>
        <select
          id="home-team"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          disabled={loading}
        >
          <option value="">Select home team...</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="away-team">Away Team</label>
        <select
          id="away-team"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          disabled={loading}
        >
          <option value="">Select away team...</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !homeTeam || !awayTeam}
      >
        {loading ? 'Predicting...' : 'Predict Match Outcome'}
      </button>
    </form>
  )
}

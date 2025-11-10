"use client";

import { useEffect, useRef, useState } from 'react';

interface FixtureWithPrediction {
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  venue: string;
  prediction: {
    home_win_probability: number;
    draw_probability: number;
    away_win_probability: number;
    predicted_outcome: string;
    confidence: number;
  };
}

interface GroupedFixtures {
  [date: string]: FixtureWithPrediction[];
}

export default function FixturesPage() {
  const [allFixtures, setAllFixtures] = useState<FixtureWithPrediction[]>([]);
  const [groupedFixtures, setGroupedFixtures] = useState<GroupedFixtures>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dateScrollRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/fixtures/upcoming/with-predictions?limit=100`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch fixtures');
      }
      
      const data = await res.json();
      const fixtures = data.fixtures_with_predictions;
      setAllFixtures(fixtures);
      
      // Group fixtures by date
      const grouped: GroupedFixtures = {};
      fixtures.forEach((fixture: FixtureWithPrediction) => {
        const date = fixture.match_date;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(fixture);
      });
      
      setGroupedFixtures(grouped);
      
      // Get sorted list of dates
      const dates = Object.keys(grouped).sort();
      setAvailableDates(dates);
      
      // Set first date as selected
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load fixtures');
      setLoading(false);
      console.error(err);
    }
  };

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${weekday}, ${monthDay}`;
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { weekday, month, day };
  };

  const getOutcomeSymbol = (outcome: string) => {
    if (outcome === 'home_win') return '🏠';
    if (outcome === 'away_win') return '✈️';
    if (outcome === 'draw') return '🤝';
    return '?';
  };

  const getPredictionColor = (outcome: string) => {
    if (outcome === 'home_win') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (outcome === 'away_win') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (outcome === 'draw') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const scrollDates = (direction: 'left' | 'right') => {
    const container = dateScrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.6;
    const nextPosition = direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
    container.scrollTo({ left: nextPosition, behavior: 'smooth' });
  };

  if (loading) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white text-xl">Loading fixtures...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-400 text-xl mb-4">{error}</p>
            <p className="text-gray-400 text-sm mb-4">
              Make sure to run the <code className="bg-black/30 px-2 py-1 rounded">scrape_fixtures.ipynb</code> notebook first to fetch upcoming fixtures.
            </p>
            <button 
              onClick={fetchFixtures}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDateFixtures = selectedDate ? groupedFixtures[selectedDate] || [] : [];

  return (
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Premier League Schedule</h1>
          <p className="text-gray-400">AI predictions for upcoming matches</p>
        </div>

        {/* Date Selector */}
        <div className="mb-8">
          <div className="date-selector">
            <button
              type="button"
              className="date-selector__arrow"
              onClick={() => scrollDates('left')}
              aria-label="Previous dates"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19L8 12L15 5" />
              </svg>
            </button>

            <div className="date-selector__list" ref={dateScrollRef}>
              {availableDates.map((date) => {
                const { weekday, month, day } = formatDateShort(date);
                const isSelected = date === selectedDate;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`date-selector__item ${isSelected ? 'date-selector__item--active' : ''}`}
                  >
                    <span className="date-selector__weekday">{weekday}</span>
                    <span className="date-selector__date">{month} {day}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="date-selector__arrow"
              onClick={() => scrollDates('right')}
              aria-label="Next dates"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5L16 12L9 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {formatDateLong(selectedDate)}
            </h2>
          </div>
        )}

        {/* Fixtures Table */}
        {currentDateFixtures.length > 0 ? (
          <div className="fixtures-table__wrapper">
            <table className="fixtures-table">
              <thead>
                <tr>
                  <th className="text-left">MATCH</th>
                  <th className="text-center">TIME</th>
                  <th className="text-center">VENUE</th>
                  <th className="text-center">AI PREDICTION</th>
                </tr>
              </thead>
              <tbody>
                {currentDateFixtures.map((fixture, idx) => (
                  <tr 
                    key={idx}
                  >
                    {/* Match */}
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 text-right">
                          <div className="text-white font-medium">{fixture.home_team}</div>
                        </div>
                        <div className="text-gray-500 text-sm font-semibold px-2">vs</div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{fixture.away_team}</div>
                        </div>
                      </div>
                    </td>

                    {/* Time */}
                    <td>
                      <span className="text-gray-300">
                      {fixture.match_time || 'TBD'}
                      </span>
                    </td>

                    {/* Venue */}
                    <td>
                      <span className="text-sm text-gray-400 block text-center">{fixture.venue}</span>
                    </td>

                    {/* Prediction */}
                    <td>
                      <div className="flex flex-col items-center space-y-2">
                        {/* Main Prediction */}
                        <div className={`px-4 py-1.5 rounded-md font-semibold text-sm ${getPredictionColor(fixture.prediction.predicted_outcome)}`}>
                          {fixture.prediction.predicted_outcome === 'home_win' && 'Home'}
                          {fixture.prediction.predicted_outcome === 'away_win' && 'Away'}
                          {fixture.prediction.predicted_outcome === 'draw' && 'Draw'}
                        </div>

                        {/* Probabilities */}
                        <div className="flex flex-col items-center gap-1 text-sm text-gray-300">
                          <div>Home: {(fixture.prediction.home_win_probability * 100).toFixed(0)}%</div>
                          <div>Draw: {(fixture.prediction.draw_probability * 100).toFixed(0)}%</div>
                          <div>Away: {(fixture.prediction.away_win_probability * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-lg">
            <p className="text-gray-400 text-lg">No matches scheduled for this date</p>
          </div>
        )}

        {availableDates.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No upcoming fixtures found</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for fixture data</p>
          </div>
        )}
      </div>
    </div>
  );
}

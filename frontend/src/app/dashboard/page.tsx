"use client";

import { useEffect, useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import MetricCard from '@/components/MetricCard';

interface OverviewData {
  total_predictions: number;
  predictions_this_week: number;
  accuracy_percentage: number;
  total_predictions_with_outcomes: number;
  correct_predictions: number;
  active_model_version: string;
}

interface RecentPrediction {
  id: number;
  home_team: string;
  away_team: string;
  predicted_outcome: string;
  confidence: number;
  actual_outcome: string | null;
  is_correct: boolean | null;
  created_at: string;
}

interface PredictionDistribution {
  home_win: { count: number; percentage: number };
  draw: { count: number; percentage: number };
  away_win: { count: number; percentage: number };
  total: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>([]);
  const [distribution, setDistribution] = useState<PredictionDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview
      const overviewRes = await fetch(`${API_URL}/api/analytics/overview`);
      const overviewData = await overviewRes.json();
      setOverview(overviewData);
      
      // Fetch recent predictions
      const predictionsRes = await fetch(`${API_URL}/api/analytics/recent-predictions?limit=10`);
      const predictionsData = await predictionsRes.json();
      setRecentPredictions(predictionsData.predictions);
      
      // Fetch distribution
      const distributionRes = await fetch(`${API_URL}/api/analytics/prediction-distribution`);
      const distributionData = await distributionRes.json();
      setDistribution(distributionData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
      console.error(err);
    }
  };

  const formatOutcome = (outcome: string) => {
    if (outcome === 'home_win') return '🏠 Home Win';
    if (outcome === 'away_win') return '✈️ Away Win';
    if (outcome === 'draw') return '🤝 Draw';
    return outcome;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Monitor your Premier League predictions and model performance</p>
        </div>

        {/* Metrics Grid */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Predictions"
              value={overview.total_predictions}
              icon="🎯"
            />
            <MetricCard
              title="This Week"
              value={overview.predictions_this_week}
              icon="📅"
            />
            <MetricCard
              title="Model Accuracy"
              value={`${overview.accuracy_percentage}%`}
              trend={{
                value: `${overview.correct_predictions}/${overview.total_predictions_with_outcomes} correct`,
                isPositive: overview.accuracy_percentage >= 60
              }}
              icon="✅"
            />
            <MetricCard
              title="Model Version"
              value={overview.active_model_version}
              icon="🤖"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Prediction Distribution */}
          {distribution && (
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Prediction Distribution</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">🏠 Home Win</span>
                    <span className="text-white font-medium">{distribution.home_win.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${distribution.home_win.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{distribution.home_win.count} predictions</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">🤝 Draw</span>
                    <span className="text-white font-medium">{distribution.draw.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${distribution.draw.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{distribution.draw.count} predictions</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">✈️ Away Win</span>
                    <span className="text-white font-medium">{distribution.away_win.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${distribution.away_win.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{distribution.away_win.count} predictions</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Recent Predictions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-purple-500/30">
                    <th className="pb-2">Match</th>
                    <th className="pb-2">Prediction</th>
                    <th className="pb-2">Confidence</th>
                    <th className="pb-2">Result</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {recentPredictions.slice(0, 8).map((pred) => (
                    <tr key={pred.id} className="border-b border-purple-500/10">
                      <td className="py-3 text-sm">
                        {pred.home_team} vs {pred.away_team}
                      </td>
                      <td className="py-3 text-sm">{formatOutcome(pred.predicted_outcome)}</td>
                      <td className="py-3 text-sm">{(pred.confidence * 100).toFixed(1)}%</td>
                      <td className="py-3 text-sm">
                        {pred.actual_outcome ? (
                          <span className={pred.is_correct ? 'text-green-400' : 'text-red-400'}>
                            {pred.is_correct ? '✓ Correct' : '✗ Wrong'}
                          </span>
                        ) : (
                          <span className="text-gray-500">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

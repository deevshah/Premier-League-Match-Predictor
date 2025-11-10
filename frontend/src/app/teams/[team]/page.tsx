import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TEAM_BY_SLUG, TEAM_SYNONYMS, TeamInfo, normaliseTeamName } from '@/data/teams';

type Prediction = {
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  predicted_outcome: string;
  confidence: number;
};

type FixtureWithPrediction = {
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  home_team_slug: string;
  away_team_slug: string;
  venue: string;
  prediction: Prediction;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const outcomeLabel = (value: string) => {
  switch (value) {
    case 'home_win':
      return 'Home Win';
    case 'away_win':
      return 'Away Win';
    case 'draw':
      return 'Draw';
    default:
      return 'Unknown';
  }
};

const predictionPillClass = (predictedOutcome: string) => {
  switch (predictedOutcome) {
    case 'home_win':
      return 'bg-green-500/20 text-green-300 border-green-400/40';
    case 'away_win':
      return 'bg-red-500/20 text-red-300 border-red-400/40';
    case 'draw':
      return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40';
    default:
      return 'bg-slate-500/20 text-slate-200 border-slate-400/40';
  }
};

const formatDate = (value: string) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return formatter.format(new Date(value));
  } catch (error) {
    return value;
  }
};

async function fetchTeamFixtures(teamSlug: string): Promise<{
  fixtures: FixtureWithPrediction[];
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fixtures/teams/${teamSlug}/upcoming`, {
      cache: 'no-store',
    });

    if (response.status === 404) {
      const payload = (await response.json().catch(() => undefined)) as { detail?: string } | undefined;
      const detail = payload?.detail ?? '';

      if (detail.toLowerCase().includes('no upcoming fixtures')) {
        return { fixtures: [] };
      }

      return { fixtures: [], error: detail || 'Team fixtures not found.' };
    }

    if (!response.ok) {
      const message = await response.text();
      return { fixtures: [], error: message || 'Failed to fetch team fixtures.' };
    }

    const data = (await response.json()) as {
      fixtures_with_predictions?: FixtureWithPrediction[];
    };

    return { fixtures: data.fixtures_with_predictions ?? [] };
  } catch (error) {
    return {
      fixtures: [],
      error: error instanceof Error ? error.message : 'Failed to fetch team fixtures.',
    };
  }
}

const probabilityDisplay = (value: number) => `${(value * 100).toFixed(0)}%`;

const formatTime = (value: string) => (value ? value : 'TBD');

const resolveTeamInfo = (name: string, fallbackSlug?: string): TeamInfo | undefined => {
  const byName = TEAM_SYNONYMS.get(normaliseTeamName(name));
  if (byName) {
    return byName;
  }

  if (fallbackSlug) {
    const direct = TEAM_BY_SLUG.get(fallbackSlug);
    if (direct) {
      return direct;
    }

    const fromSlugLabel = TEAM_SYNONYMS.get(
      normaliseTeamName(fallbackSlug.replace(/-/g, ' '))
    );
    if (fromSlugLabel) {
      return fromSlugLabel;
    }
  }

  return undefined;
};

const TeamHeader = ({ team }: { team: TeamInfo }) => (
  <section className="mb-8">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4 text-white">
        <div className="bg-white/10 border border-white/20 rounded-full p-4 shadow-lg">
          <Image src={team.crestUrl} alt={`${team.name} crest`} width={96} height={96} />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-gray-300">Upcoming fixtures & AI match outlook</p>
        </div>
      </div>
      <Link
        href="/teams"
        className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
      >
        ← All clubs
      </Link>
    </div>
  </section>
);

const FixturesTable = ({ fixtures, team }: { fixtures: FixtureWithPrediction[]; team: TeamInfo }) => (
  <div className="fixtures-table__wrapper">
    <table className="fixtures-table">
      <thead>
        <tr>
          <th className="text-left">MATCH</th>
          <th className="text-center">DATE</th>
          <th className="text-center">TIME</th>
          <th className="text-center">VENUE</th>
          <th className="text-center">AI PREDICTION</th>
        </tr>
      </thead>
      <tbody>
        {fixtures.map((fixture) => {
          const homeInfo = resolveTeamInfo(fixture.home_team, fixture.home_team_slug);
          const awayInfo = resolveTeamInfo(fixture.away_team, fixture.away_team_slug);
          const homeIsActive = homeInfo?.slug === team.slug;
          const awayIsActive = awayInfo?.slug === team.slug;

          return (
            <tr key={`${fixture.match_date}-${fixture.home_team}-${fixture.away_team}`}>
              <td>
                <div className="flex flex-col gap-1 text-white md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 text-right">
                    {homeInfo ? (
                      <Link
                        href={`/teams/${homeInfo.slug}`}
                        className={`font-semibold transition hover:text-white/80 ${
                          homeIsActive ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {fixture.home_team}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white/80">{fixture.home_team}</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs uppercase tracking-wide md:px-3">vs</span>
                  <div className="flex-1 text-left">
                    {awayInfo ? (
                      <Link
                        href={`/teams/${awayInfo.slug}`}
                        className={`font-semibold transition hover:text-white/80 ${
                          awayIsActive ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {fixture.away_team}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white/80">{fixture.away_team}</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="text-center text-gray-200">{formatDate(fixture.match_date)}</td>
              <td className="text-center text-gray-200">{formatTime(fixture.match_time)}</td>
              <td className="text-center text-gray-300 text-sm">{fixture.venue || 'TBD'}</td>
              <td>
                <div className="flex flex-col items-center gap-2 text-sm text-gray-200">
                  <span
                    className={`rounded-full border px-4 py-1 font-semibold ${
                      predictionPillClass(fixture.prediction.predicted_outcome)
                    }`}
                  >
                    {outcomeLabel(fixture.prediction.predicted_outcome)}
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
                    <span>H: {probabilityDisplay(fixture.prediction.home_win_probability)}</span>
                    <span>D: {probabilityDisplay(fixture.prediction.draw_probability)}</span>
                    <span>A: {probabilityDisplay(fixture.prediction.away_win_probability)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Confidence {probabilityDisplay(fixture.prediction.confidence)}
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-white/10 bg-black/30 p-10 text-center text-white">
    <h2 className="text-xl font-semibold">No upcoming fixtures</h2>
    <p className="mt-2 text-sm text-gray-300">Check back soon once the league confirms the next set of matches.</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-red-500/50 bg-red-900/30 p-8 text-center text-red-200">
    <h2 className="text-xl font-semibold">Unable to load fixtures</h2>
    <p className="mt-2 text-sm text-red-200/80">{message}</p>
  </div>
);

export async function generateMetadata({ params }: { params: { team: string } }) {
  const team = TEAM_BY_SLUG.get(params.team);
  const title = team ? `${team.name} Fixtures & Predictions` : 'Team Fixtures';
  const description = team
    ? `Upcoming matches and AI predictions for ${team.name}.`
    : 'Premier League team fixtures and predictions.';

  return { title, description };
}

export default async function TeamFixturesPage({ params }: { params: { team: string } }) {
  const teamSlug = params.team;
  const teamInfo = TEAM_BY_SLUG.get(teamSlug);

  if (!teamInfo) {
    notFound();
  }

  const { fixtures, error } = await fetchTeamFixtures(teamSlug);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
      <div className="container mx-auto px-4 py-10">
        <TeamHeader team={teamInfo} />

        {error && <ErrorState message={error} />}

        {!error && fixtures.length === 0 && <EmptyState />}

        {!error && fixtures.length > 0 && <FixturesTable fixtures={fixtures} team={teamInfo} />}
      </div>
    </main>
  );
}
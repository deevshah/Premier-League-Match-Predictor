import Image from 'next/image';
import Link from 'next/link';

import { PREMIER_LEAGUE_TEAMS } from '@/data/teams';

export default function TeamsPage() {
  return (
    <main className="teams-page">
      <div className="teams-page__inner">
        <header className="teams-page__header">
          <h1>Premier League Clubs</h1>
          <p>Tap a crest to jump straight to that club&apos;s upcoming fixtures and AI outlook.</p>
        </header>

        <section className="teams-grid">
          {PREMIER_LEAGUE_TEAMS.map((team) => (
            <Link key={team.slug} href={`/teams/${team.slug}`} className="team-card">
              <div className="team-card__logo">
                <Image
                  src={team.crestUrl}
                  alt={`${team.name} crest`}
                  width={96}
                  height={96}
                  loading="lazy"
                />
              </div>
              <span className="team-card__name">{team.name}</span>
              <span className="team-card__cta">View fixtures</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
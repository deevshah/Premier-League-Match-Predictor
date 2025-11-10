import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="main-header">
      <div className="main-header__inner">
        <Link href="/" className="main-header__brand">
          <span className="main-header__logo">
            <Image
              src="/premier_league_lion-removebg-preview.png"
              alt="Premier League logo"
              width={36}
              height={36}
              priority
            />
          </span>
          <span className="main-header__title">Premier League Match Predictor</span>
        </Link>

        <nav className="main-header__nav">
          <Link href="/dashboard/fixtures" className="main-header__link">
            Upcoming Fixtures
          </Link>
          <Link href="/predictions" className="main-header__link">
            Make Prediction
          </Link>
          <Link href="/teams" className="main-header__link">
            Teams
          </Link>
        </nav>
      </div>
    </header>
  );
}

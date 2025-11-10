export default function Home() {
  return (
    <div className="home-hero">
      <div className="home-hero__content">
        <img
          src="/premier_league_lion-removebg-preview.png"
          alt="Premier League logo on gradient background"
          className="home-hero__logo"
          width={320}
          height={214}
        />
        <h1 className="home-hero__title">Welcome to Premier League Match Predictor</h1>
        <p className="home-hero__subtitle">
          Your hub for Premier League insights, AI-powered forecasts, and upcoming fixture predictions.
        </p>
        <a href="/dashboard/fixtures" className="home-hero__cta">Get Started</a>
      </div>
    </div>
  );
}
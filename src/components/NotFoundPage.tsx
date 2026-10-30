import { useEffect } from "react";
import tornlyticsLogo from "../assets/tornlytics-logo-transparent.png";
import { Icon } from "./Icon";

export function NotFoundPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "404 — Tornlytics";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="not-found-page">
      <section className="not-found-panel" aria-labelledby="not-found-title">
        <img className="not-found-logo" src={tornlyticsLogo} alt="Tornlytics" />
        <p className="not-found-kicker">TORN CITY · WRONG TURN</p>
        <div className="not-found-code" aria-hidden="true">404</div>
        <h1 id="not-found-title">This street goes nowhere.</h1>
        <p className="not-found-message">The page you’re looking for isn’t on the map. Head back to your cash flow dashboard.</p>
        <a className="not-found-link" href="/">
          <Icon name="arrow" size={16} />
          Back to cash flow
        </a>
      </section>
    </main>
  );
}

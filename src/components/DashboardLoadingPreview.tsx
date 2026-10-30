import { useEffect } from "react";
import tornlyticsLogo from "../assets/tornlytics-logo-transparent.png";

const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`skeleton-block ${className}`} aria-hidden="true" />;
}

export function DashboardLoadingPreview() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Loading preview — Tornlytics";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="loading-preview" aria-busy="true">
      <header className="loading-preview-header">
        <img src={tornlyticsLogo} alt="Tornlytics" />
        <div className="loading-status" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Reading the ledger…</span>
        </div>
      </header>

      <div className="loading-preview-content">
        <div className="loading-preview-heading">
          <div>
            <SkeletonBlock className="skeleton-kicker" />
            <SkeletonBlock className="skeleton-title" />
            <SkeletonBlock className="skeleton-subtitle" />
          </div>
          <SkeletonBlock className="skeleton-date-control" />
        </div>

        <section className="loading-metrics" aria-label="Loading dashboard totals">
          {skeletonRows.slice(0, 4).map((item) => (
            <div className="loading-card loading-metric" key={item}>
              <SkeletonBlock className="skeleton-label" />
              <SkeletonBlock className="skeleton-value" />
              <SkeletonBlock className="skeleton-foot" />
            </div>
          ))}
        </section>

        <section className="loading-card loading-chart" aria-label="Loading cash flow chart">
          <div className="loading-panel-heading">
            <div>
              <SkeletonBlock className="skeleton-panel-title" />
              <SkeletonBlock className="skeleton-panel-subtitle" />
            </div>
            <SkeletonBlock className="skeleton-legend" />
          </div>
          <div className="skeleton-chart-area" aria-hidden="true">
            <div className="skeleton-chart-lines"><i /><i /><i /><i /></div>
            <div className="skeleton-bars">
              {[34, 57, 42, 72, 49, 88, 63].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>

        <section className="loading-card loading-transactions" aria-label="Loading recent transactions">
          <div className="loading-panel-heading">
            <SkeletonBlock className="skeleton-panel-title" />
            <SkeletonBlock className="skeleton-search" />
          </div>
          <div className="loading-transaction-list" aria-hidden="true">
            {skeletonRows.map((item) => (
              <div className="skeleton-transaction-row" key={item}>
                <SkeletonBlock className="skeleton-transaction-icon" />
                <div className="skeleton-transaction-copy">
                  <SkeletonBlock className="skeleton-transaction-title" />
                  <SkeletonBlock className="skeleton-transaction-detail" />
                </div>
                <SkeletonBlock className="skeleton-transaction-amount" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <a className="loading-preview-back" href="/">Back to cash flow</a>
    </main>
  );
}

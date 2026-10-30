import { useEffect, useMemo, useState } from "react";
import tornlyticsLogo from "./assets/tornlytics-logo-transparent.png";
import { CashflowChart } from "./components/CashflowChart";
import { DashboardLoadingPreview } from "./components/DashboardLoadingPreview";
import { Icon } from "./components/Icon";
import { NotFoundPage } from "./components/NotFoundPage";
import { demoTransactions } from "./data/demo-transactions";
import {
  calculateTotals,
  categoryColors,
  categoryOrder,
  filterTransactionsByRange,
  summarizeByCategory,
  type CategoryName,
  type DateRange,
  type Transaction,
} from "./domain/finance";
import { dateInputValue, daysBetweenDates, displayDate, fullDate, money, relativeDate, shortDate } from "./lib/formatters";

type View = "overview" | "transactions" | "categories";
type Period = number;

function Dashboard() {
  const [period, setPeriod] = useState<Period>(30);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rangeError, setRangeError] = useState("");
  const [draftStart, setDraftStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return dateInputValue(date);
  });
  const [draftEnd, setDraftEnd] = useState(() => dateInputValue(new Date()));
  const [activeView, setActiveView] = useState<View>("overview");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | "All">("All");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showConnectInfo, setShowConnectInfo] = useState(false);

  useEffect(() => {
    if (!selectedTransaction) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedTransaction(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTransaction]);

  const today = dateInputValue(new Date());
  const dateFrom = new Date(`${today}T00:00:00`);
  dateFrom.setDate(dateFrom.getDate() - period + 1);
  const rangeStart = customRange?.start ?? dateInputValue(dateFrom);
  const rangeEnd = customRange?.end ?? today;
  const rangeLabel = `${displayDate(rangeStart)} – ${displayDate(rangeEnd)}`;

  const periodTransactions = useMemo(
    () => filterTransactionsByRange(demoTransactions, { start: rangeStart, end: rangeEnd }),
    [rangeStart, rangeEnd],
  );
  const totals = useMemo(() => calculateTotals(periodTransactions), [periodTransactions]);

  const categoryTotals = useMemo(() => {
    return summarizeByCategory(periodTransactions);
  }, [periodTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return periodTransactions.filter((transaction) => {
      const matchesCategory = selectedCategory === "All" || transaction.category === selectedCategory;
      const matchesQuery = !query || `${transaction.title} ${transaction.detail} ${transaction.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [periodTransactions, search, selectedCategory]);

  const summaryTransactions = activeView === "transactions" ? filteredTransactions : periodTransactions;
  const summaryTotals = useMemo(() => calculateTotals(summaryTransactions), [summaryTransactions]);
  const summaryCategoryCount = new Set(summaryTransactions.map((transaction) => transaction.category)).size;
  const summaryIncomeCount = summaryTransactions.filter((transaction) => transaction.amount > 0).length;
  const summaryExpenseCount = summaryTransactions.filter((transaction) => transaction.amount < 0).length;
  const visibleTransactions = activeView === "overview"
    ? filteredTransactions.slice(0, 6)
    : filteredTransactions;
  const maxCategory = Math.max(...categoryTotals.map((category) => Math.abs(category.net)), 1);

  function applyCustomRange() {
    if (!draftStart || !draftEnd || draftStart > draftEnd) {
      setRangeError("Choose a start date on or before the end date.");
      return;
    }
    if (draftEnd > dateInputValue(new Date())) {
      setRangeError("The end date cannot be in the future.");
      return;
    }
    const days = daysBetweenDates(draftEnd, draftStart) + 1;
    setPeriod(days);
    setCustomRange({ start: draftStart, end: draftEnd });
    setRangeError("");
    setShowDatePicker(false);
  }

  function chooseCategory(category: CategoryName) {
    setSelectedCategory(category);
    setActiveView("transactions");
  }

  function exportTransactions() {
    const header = ["Date", "Description", "Category", "Amount"];
    const rows = filteredTransactions.map((transaction) => [
      shortDate(transaction.occurredAt),
      `${transaction.title} — ${transaction.detail}`,
      transaction.category,
      transaction.amount.toString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    const fileRange = customRange ? `${customRange.start}-to-${customRange.end}` : `${period}d`;
    link.download = `tornlytics-transactions-${fileRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()} aria-label="Tornlytics home">
          <img className="brand-logo" src={tornlyticsLogo} alt="Tornlytics" />
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {([
            ["overview", "Overview", "overview"],
            ["transactions", "Transactions", "transactions"],
            ["categories", "Categories", "categories"],
          ] as const).map(([view, label, icon]) => (
            <button
              className={`nav-item ${activeView === view ? "active" : ""}`}
              key={view}
              aria-label={label}
              onClick={() => {
                setActiveView(view);
                setSelectedCategory("All");
              }}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {view === "transactions" && <span className="nav-count">{periodTransactions.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-icon"><Icon name="info" size={16} /></span>
          <div>
            <strong>Demo workspace</strong>
            <p>Sample activity only. No Torn account is connected.</p>
            <button onClick={() => setShowConnectInfo(true)}>About connecting <Icon name="arrow" size={13} /></button>
          </div>
        </div>
        <button className="profile-button" onClick={() => setShowConnectInfo(true)}>
          <span className="avatar">M</span>
          <span className="profile-copy"><strong>Player profile</strong><small>API not linked</small></span>
          <span className="profile-dots">···</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>TORN</span><span className="breadcrumb-slash">/</span><span>FINANCES</span></div>
          <div className="topbar-right">
            {/* Remove this sample-data indicator when the Torn API is connected. */}
            <span className="demo-pill"><span /> SAMPLE LOG</span>
            <button className="connect-button" onClick={() => setShowConnectInfo(true)}>
              <span className="connect-dot" /> API key · offline
            </button>
          </div>
        </header>

        <div className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> TORN CITY <span className="eyebrow-slash">/</span> PERSONAL LEDGER</div>
            <h1>{activeView === "overview" ? "Cash flow" : activeView === "transactions" ? "Transactions" : "Categories"}</h1>
            <p className="page-subtitle">A clear picture of where your Torn dollars go.</p>
          </div>
          <div className="period-control">
            <div className="period-tabs" role="group" aria-label="Date range">
              {([7, 30, 90] as const).map((days) => (
                <button
                  className={!customRange && period === days ? "selected" : ""}
                  key={days}
                  onClick={() => {
                    setPeriod(days);
                    setCustomRange(null);
                    setShowDatePicker(false);
                  }}
                >
                  {days}D
                </button>
              ))}
            </div>
            <div className="range-picker">
              <button
                className="range-label"
                aria-expanded={showDatePicker}
                onClick={() => setShowDatePicker((visible) => !visible)}
              >
                <span className="calendar-icon">▦</span>{rangeLabel}<span className="chevron">⌄</span>
              </button>
              {showDatePicker && (
                <div className="date-popover">
                  <div className="date-popover-heading">Choose a date range</div>
                  <label>Start date<input type="date" value={draftStart} max={dateInputValue(new Date())} onChange={(event) => setDraftStart(event.target.value)} /></label>
                  <label>End date<input type="date" value={draftEnd} max={dateInputValue(new Date())} onChange={(event) => setDraftEnd(event.target.value)} /></label>
                  {rangeError && <p className="range-error" role="alert">{rangeError}</p>}
                  <button className="apply-range-button" onClick={applyCustomRange}>Apply date range</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="metrics-grid">
          <article className="metric-card net-card">
            <div className="metric-top">
              <span className="metric-label">{activeView === "transactions" ? "NET CASH FLOW · SHOWN" : "NET CASH FLOW"}</span>
              <span className="metric-icon net-icon">↗</span>
            </div>
            <div className={`metric-value ${summaryTotals.net < 0 ? "negative" : ""}`}>{summaryTotals.net >= 0 ? "+" : "−"}{money(summaryTotals.net)}</div>
            <div className="metric-foot"><span className="change-positive">● Sample data</span><span>not account-connected</span></div>
            <div className="metric-sparkline" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          </article>
          <article className="metric-card">
            <div className="metric-top"><span className="metric-label">{activeView === "transactions" ? "INCOME · SHOWN" : "TOTAL INCOME"}</span><span className="metric-icon income-icon">↓</span></div>
            <div className="metric-value">{money(summaryTotals.income)}</div>
            <div className="metric-foot"><span>{summaryIncomeCount} income transaction{summaryIncomeCount === 1 ? "" : "s"}</span><span className="metric-side-label">MONEY IN</span></div>
          </article>
          <article className="metric-card">
            <div className="metric-top"><span className="metric-label">{activeView === "transactions" ? "EXPENSES · SHOWN" : "TOTAL EXPENSES"}</span><span className="metric-icon expense-icon">↑</span></div>
            <div className="metric-value">{money(summaryTotals.expenses)}</div>
            <div className="metric-foot"><span>{summaryExpenseCount} expense transaction{summaryExpenseCount === 1 ? "" : "s"}</span><span className="metric-side-label">MONEY OUT</span></div>
          </article>
          <article className="metric-card count-card">
            <div className="metric-top"><span className="metric-label">{activeView === "transactions" ? "TRANSACTIONS SHOWN" : "ACTIVITY LOGGED"}</span><span className="metric-icon count-icon"><Icon name="transactions" size={17} /></span></div>
            <div className="metric-value">{summaryTransactions.length}<span className="metric-unit"> entries</span></div>
            <div className="metric-foot"><span>Across {summaryCategoryCount} categories</span><span className="metric-side-label">{activeView === "transactions" ? "MATCHED FILTER" : "IN SELECTED RANGE"}</span></div>
          </article>
        </div>

        <div className={`insights-grid ${activeView === "transactions" ? "chart-only" : ""}`}>
          <section className="panel trend-panel">
            <div className="section-heading">
              <div>
                <h2>{activeView === "transactions" ? "Filtered cash flow trend" : "Cash flow trend"}</h2>
                <p>{activeView === "transactions" ? `${summaryTransactions.length} matching entries · ${rangeLabel}` : `Net movement · ${rangeLabel}`}</p>
              </div>
              <div className="legend"><span><i className="legend-income" /> Inflow</span><span><i className="legend-expense" /> Outflow</span></div>
            </div>
            <CashflowChart
              data={activeView === "transactions" ? filteredTransactions : periodTransactions}
              startDate={rangeStart}
              endDate={rangeEnd}
            />
            <div className="chart-footer"><span>SAMPLE DATA · {Math.min(7, period)} INTERVALS</span><span>Amounts in Torn dollars</span></div>
          </section>

          {activeView !== "transactions" && (
            <section className="panel category-panel" id="category-breakdown">
              <div className="section-heading">
                <div><h2>By category</h2><p>Where your money moves</p></div>
                <button className="text-button" onClick={() => setActiveView("categories")}>See all <Icon name="arrow" size={14} /></button>
              </div>
              <div className="category-list">
                {categoryTotals.filter((category) => category.entries.length > 0).slice(0, 5).map((category) => (
                  <button className="category-row" key={category.category} onClick={() => chooseCategory(category.category)}>
                    <span className="category-symbol" style={{ color: categoryColors[category.category] }}>◈</span>
                    <span className="category-main">
                      <span className="category-name">{category.category}</span>
                      <span className="category-bar"><i style={{ width: `${Math.max(Math.abs(category.net) / maxCategory * 100, 4)}%`, background: categoryColors[category.category] }} /></span>
                    </span>
                    <span className={`category-total ${category.net < 0 ? "negative" : ""}`}>{category.net >= 0 ? "+" : "−"}{money(category.net, true)}</span>
                  </button>
                ))}
              </div>
              <button className="category-footer" onClick={() => setActiveView("categories")}>View category breakdown <Icon name="arrow" size={14} /></button>
            </section>
          )}
        </div>

        {activeView === "categories" && (
          <section className="panel full-panel category-details">
            <div className="section-heading">
              <div><h2>Category breakdown</h2><p>Income, expenses, and net for each activity</p></div>
              <span className="table-period">{rangeLabel}</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>ACTIVITY</th><th>ENTRIES</th><th>INCOME</th><th>EXPENSES</th><th className="align-right">NET</th></tr></thead>
                <tbody>
                  {categoryTotals.map((category) => (
                    <tr key={category.category} onClick={() => chooseCategory(category.category)} className="clickable-row">
                      <td><span className="table-category"><i style={{ background: categoryColors[category.category] }} />{category.category}</span></td>
                      <td>{category.entries.length}</td>
                      <td className="positive-text">{money(category.income)}</td>
                      <td className="muted">{money(category.expenses)}</td>
                      <td className={`align-right ${category.net < 0 ? "negative" : "positive-text"}`}>{category.net >= 0 ? "+" : "−"}{money(category.net)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td>Grand total</td><td>{periodTransactions.length}</td><td className="positive-text">{money(totals.income)}</td><td>{money(totals.expenses)}</td><td className={`align-right ${totals.net < 0 ? "negative" : "positive-text"}`}>{totals.net >= 0 ? "+" : "−"}{money(totals.net)}</td></tr></tfoot>
              </table>
            </div>
          </section>
        )}

        {activeView !== "categories" && (
          <section className="panel transactions-panel" id="transactions">
            <div className="section-heading transaction-heading">
              <div>
                <h2>{activeView === "overview" ? "Recent transactions" : "All transactions"}</h2>
                <p>{activeView === "overview" ? "Your latest money movements" : `${filteredTransactions.length} entries in this period`}</p>
              </div>
              <div className="transaction-actions">
                <label className="search-field">
                  <Icon name="search" size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity..." aria-label="Search transactions" />
                  {search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search"><Icon name="close" size={13} /></button>}
                </label>
                <button className="export-button" onClick={exportTransactions}><Icon name="download" size={15} /><span>Export</span></button>
              </div>
            </div>
            {activeView === "transactions" && (
              <div className="filter-row">
                <span className="filter-label">FILTER</span>
                {(["All", ...categoryOrder] as const).map((category) => (
                  <button className={`filter-chip ${selectedCategory === category ? "active" : ""}`} key={category} onClick={() => setSelectedCategory(category)}>
                    {category}
                  </button>
                ))}
              </div>
            )}
            <div className="transaction-list">
              {visibleTransactions.length > 0 ? visibleTransactions.map((transaction) => (
                <article
                  className="transaction-row"
                  key={transaction.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${transaction.title}, ${transaction.amount > 0 ? "income" : "expense"} of ${money(transaction.amount)}`}
                  onClick={() => setSelectedTransaction(transaction)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedTransaction(transaction);
                    }
                  }}
                >
                  <span className="transaction-icon" style={{ color: categoryColors[transaction.category] }}>{transaction.icon}</span>
                  <div className="transaction-description">
                    <strong>{transaction.title}</strong>
                    <span>{transaction.detail}</span>
                  </div>
                  <span className="transaction-category">{transaction.category}</span>
                  <span className="transaction-date">{relativeDate(transaction.occurredAt)}</span>
                  <span className={`transaction-amount ${transaction.amount > 0 ? "positive-text" : "negative"}`}>{transaction.amount > 0 ? "+" : "−"}{money(transaction.amount)}</span>
                </article>
              )) : (
                <div className="empty-state"><span><Icon name="search" size={20} /></span><strong>No matching activity</strong><p>Try a different search or category.</p></div>
              )}
            </div>
            {activeView === "overview" && filteredTransactions.length > 6 && (
              <button className="view-all-button" onClick={() => setActiveView("transactions")}>View all {filteredTransactions.length} transactions <Icon name="arrow" size={15} /></button>
            )}
            <div className="panel-disclaimer"><span className="disclaimer-dot" /> Demonstration data only <span className="disclaimer-separator">·</span> Not connected to Torn</div>
          </section>
        )}

        <footer className="page-footer"><span>TORNLYTICS <i>·</i> FINANCIAL OVERVIEW</span><span>Built for the streets of Torn City <b>✦</b></span></footer>
      </main>

      {showConnectInfo && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowConnectInfo(false);
        }}>
          <section className="connect-modal" role="dialog" aria-modal="true" aria-labelledby="connect-title">
            <button className="modal-close" onClick={() => setShowConnectInfo(false)} aria-label="Close"><Icon name="close" /></button>
            <div className="modal-mark"><img className="modal-logo" src={tornlyticsLogo} alt="" /></div>
            <span className="modal-eyebrow">COMING NEXT</span>
            <h2 id="connect-title">Your Torn data, at a glance.</h2>
            <p>This build is using fictional sample activity while the dashboard takes shape. Torn API connection is not enabled yet, so no API key is requested or stored.</p>
            <div className="modal-detail"><Icon name="info" size={16} /><span>The official activity-log endpoint requires a Full Access key. Never share your key in chat.</span></div>
            <button className="modal-done" onClick={() => setShowConnectInfo(false)}>Got it</button>
          </section>
        </div>
      )}

      {selectedTransaction && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTransaction(null);
          }}
        >
          <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title">
            <button className="modal-close" onClick={() => setSelectedTransaction(null)} aria-label="Close transaction details">
              <Icon name="close" />
            </button>
            <div className="transaction-modal-kicker">LEDGER ENTRY <span>·</span> DEMO RECORD</div>
            <div className="transaction-modal-heading">
              <span className="transaction-modal-icon" style={{ color: categoryColors[selectedTransaction.category] }}>
                {selectedTransaction.icon}
              </span>
              <div>
                <h2 id="transaction-detail-title">{selectedTransaction.title}</h2>
                <p>{selectedTransaction.detail}</p>
              </div>
            </div>
            <div className={`transaction-impact ${selectedTransaction.amount < 0 ? "outflow" : "inflow"}`}>
              <span>{selectedTransaction.amount > 0 ? "CASH RECEIVED" : "CASH SPENT"}</span>
              <strong>{selectedTransaction.amount > 0 ? "+" : "−"}{money(selectedTransaction.amount)}</strong>
            </div>
            <dl className="transaction-detail-list">
              <div><dt>Category</dt><dd><i style={{ background: categoryColors[selectedTransaction.category] }} />{selectedTransaction.category}</dd></div>
              <div><dt>Recorded</dt><dd>{fullDate(selectedTransaction.occurredAt)}</dd></div>
              <div><dt>Entry type</dt><dd>{selectedTransaction.amount > 0 ? "Income" : "Expense"}</dd></div>
              <div><dt>Sample reference</dt><dd className="reference-value">DEMO-{String(selectedTransaction.id).padStart(4, "0")}</dd></div>
            </dl>
            <div className="transaction-modal-note">
              <Icon name="info" size={16} />
              <span>Example data for the dashboard preview. Real Torn log details will appear here after API integration.</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function App() {
  if (window.location.pathname === "/") return <Dashboard />;
  if (window.location.pathname === "/loading-preview") return <DashboardLoadingPreview />;
  return <NotFoundPage />;
}

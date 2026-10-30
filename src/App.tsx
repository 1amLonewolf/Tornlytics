import { useMemo, useState } from "react";

type CategoryName =
  | "Trading & Market"
  | "Travel / Flying"
  | "Crimes"
  | "Gambling"
  | "Property"
  | "Other";

type Transaction = {
  id: number;
  title: string;
  detail: string;
  category: CategoryName;
  amount: number;
  daysAgo: number;
  icon: string;
};

type View = "overview" | "transactions" | "categories";
type Period = number;
type DateRange = { start: string; end: string };

const categoryColors: Record<CategoryName, string> = {
  "Trading & Market": "#9cdc6b",
  "Travel / Flying": "#6eb6ef",
  Crimes: "#ecaa62",
  Gambling: "#c29bfa",
  Property: "#56cfb4",
  Other: "#9da8a0",
};

const transactions: Transaction[] = [
  { id: 1, title: "Bazaar sale", detail: "Xanax · 25 units", category: "Trading & Market", amount: 735000, daysAgo: 0, icon: "↗" },
  { id: 2, title: "Souvenir purchase", detail: "Cayman Islands · Plushie", category: "Travel / Flying", amount: -96000, daysAgo: 0, icon: "✈" },
  { id: 3, title: "Item market sale", detail: "Drug pack · 10 units", category: "Trading & Market", amount: 1240000, daysAgo: 1, icon: "↗" },
  { id: 4, title: "Mugging payout", detail: "Street crime · Success", category: "Crimes", amount: 42000, daysAgo: 1, icon: "♢" },
  { id: 5, title: "Blackjack", detail: "Casino · Table 04", category: "Gambling", amount: -185000, daysAgo: 1, icon: "♠" },
  { id: 6, title: "Overseas item sale", detail: "South Africa · Plushie", category: "Travel / Flying", amount: 865000, daysAgo: 2, icon: "✈" },
  { id: 7, title: "Property rent", detail: "Private island · Daily upkeep", category: "Property", amount: -340000, daysAgo: 2, icon: "⌂" },
  { id: 8, title: "Bazaar restock", detail: "Xanax · 8 units", category: "Trading & Market", amount: -624000, daysAgo: 3, icon: "↙" },
  { id: 9, title: "Search for cash", detail: "Street crime · Success", category: "Crimes", amount: 18500, daysAgo: 3, icon: "♢" },
  { id: 10, title: "Faction payout", detail: "War participation reward", category: "Other", amount: 280000, daysAgo: 4, icon: "✦" },
  { id: 11, title: "Bazaar sale", detail: "Energy drink · 12 units", category: "Trading & Market", amount: 416000, daysAgo: 4, icon: "↗" },
  { id: 12, title: "Flight ticket", detail: "Torn → Switzerland", category: "Travel / Flying", amount: -31000, daysAgo: 5, icon: "✈" },
  { id: 13, title: "Slots payout", detail: "Casino · Lucky streak", category: "Gambling", amount: 320000, daysAgo: 5, icon: "♠" },
  { id: 14, title: "Points market sale", detail: "Points · 100 units", category: "Trading & Market", amount: 495000, daysAgo: 6, icon: "↗" },
  { id: 15, title: "Property upkeep", detail: "Private island · Staff", category: "Property", amount: -72000, daysAgo: 6, icon: "⌂" },
  { id: 16, title: "Pickpocketing", detail: "Street crime · Success", category: "Crimes", amount: 12000, daysAgo: 8, icon: "♢" },
  { id: 17, title: "Plushie restock", detail: "Bazaar · 5 units", category: "Trading & Market", amount: -95000, daysAgo: 10, icon: "↙" },
  { id: 18, title: "Roulette", detail: "Casino · Red 18", category: "Gambling", amount: -125000, daysAgo: 12, icon: "♠" },
  { id: 19, title: "Bounty reward", detail: "Target apprehended", category: "Other", amount: 165000, daysAgo: 15, icon: "✦" },
  { id: 20, title: "Bazaar sale", detail: "Medical supplies · 20 units", category: "Trading & Market", amount: 950000, daysAgo: 21, icon: "↗" },
  { id: 21, title: "Hospital bill", detail: "Treatment · Torn City", category: "Other", amount: -64000, daysAgo: 25, icon: "＋" },
  { id: 22, title: "Overseas item sale", detail: "Mexico · Flower", category: "Travel / Flying", amount: 380000, daysAgo: 38, icon: "✈" },
  { id: 23, title: "Property upkeep", detail: "Private island · Staff", category: "Property", amount: -265000, daysAgo: 49, icon: "⌂" },
  { id: 24, title: "Company dividend", detail: "Daily profit share", category: "Other", amount: 540000, daysAgo: 62, icon: "✦" },
  { id: 25, title: "Market purchase", detail: "Weapon · Second-hand", category: "Trading & Market", amount: -420000, daysAgo: 77, icon: "↙" },
  { id: 26, title: "Crime fine", detail: "Jail release fee", category: "Crimes", amount: -18000, daysAgo: 84, icon: "♢" },
];

const categoryOrder: CategoryName[] = [
  "Trading & Market",
  "Travel / Flying",
  "Crimes",
  "Gambling",
  "Property",
  "Other",
];

function money(value: number, compact = false) {
  const absolute = Math.abs(value);
  if (compact && absolute >= 1_000_000) {
    return `$${(absolute / 1_000_000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}m`;
  }
  if (compact && absolute >= 10_000) {
    return `$${Math.round(absolute / 1_000)}k`;
  }
  return `$${Math.round(absolute).toLocaleString("en-US")}`;
}

function shortDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgoFromDate(value: string) {
  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - selected.getTime()) / 86_400_000);
}

function displayDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function relativeDate(daysAgo: number) {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "overview") {
    return <svg {...common}><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /></svg>;
  }
  if (name === "transactions") {
    return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="7" cy="6" r=".7" fill="currentColor" /><circle cx="7" cy="12" r=".7" fill="currentColor" /><circle cx="7" cy="18" r=".7" fill="currentColor" /></svg>;
  }
  if (name === "categories") {
    return <svg {...common}><path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" /><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></svg>;
  }
  if (name === "search") {
    return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.4 4.4" /></svg>;
  }
  if (name === "download") {
    return <svg {...common}><path d="M12 3v12m-5-5 5 5 5-5M4 20h16" /></svg>;
  }
  if (name === "arrow") {
    return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
  }
  if (name === "close") {
    return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>;
}

function CashflowChart({ data, period }: { data: Transaction[]; period: Period }) {
  const bucketCount = Math.min(7, period);
  const now = new Date();
  const bucketSize = period / bucketCount;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const endDay = Math.ceil((bucketCount - index) * bucketSize);
    const startDay = Math.ceil((bucketCount - index - 1) * bucketSize);
    const net = data.reduce((sum, transaction) => {
      return transaction.daysAgo >= startDay && transaction.daysAgo < endDay
        ? sum + transaction.amount
        : sum;
    }, 0);
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor((startDay + endDay - 1) / 2));
    return {
      net,
      label: period === 7
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

  const maxValue = Math.max(...buckets.map((bucket) => Math.abs(bucket.net)), 1);
  const baseline = 114;
  const barWidth = 34;
  const chartWidth = 680;
  const step = chartWidth / bucketCount;

  return (
    <div className="chart-wrap">
      <div className="chart-y-labels" aria-hidden="true">
        <span>{money(maxValue, true)}</span>
        <span>$0</span>
        <span>−{money(maxValue / 2, true)}</span>
      </div>
      <svg className="cashflow-chart" viewBox="0 0 720 218" role="img" aria-label="Net cash flow trend for the selected period">
        {[38, 76, baseline, 152, 189].map((y) => (
          <line key={y} x1="20" x2="710" y1={y} y2={y} className={y === baseline ? "chart-baseline" : "chart-gridline"} />
        ))}
        {buckets.map((bucket, index) => {
          const height = Math.abs(bucket.net) / maxValue * 75;
          const x = 25 + index * step + (step - barWidth) / 2;
          const y = bucket.net >= 0 ? baseline - height : baseline;
          return (
            <g key={`${bucket.label}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, 3)}
                rx="5"
                className={bucket.net >= 0 ? "chart-bar-positive" : "chart-bar-negative"}
              >
                <title>{bucket.label}: {bucket.net >= 0 ? "+" : "−"}{money(bucket.net)}</title>
              </rect>
              <text x={x + barWidth / 2} y="203" textAnchor="middle" className="chart-label">{bucket.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function App() {
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
  const [showConnectInfo, setShowConnectInfo] = useState(false);

  const periodTransactions = useMemo(
    () => transactions.filter((transaction) => {
      if (!customRange) return transaction.daysAgo < period;
      return transaction.daysAgo >= daysAgoFromDate(customRange.end)
        && transaction.daysAgo <= daysAgoFromDate(customRange.start);
    }),
    [period, customRange],
  );
  const totals = useMemo(() => {
    return periodTransactions.reduce(
      (result, transaction) => {
        if (transaction.amount > 0) result.income += transaction.amount;
        else result.expenses += Math.abs(transaction.amount);
        result.net += transaction.amount;
        return result;
      },
      { income: 0, expenses: 0, net: 0 },
    );
  }, [periodTransactions]);

  const categoryTotals = useMemo(() => {
    return categoryOrder.map((category) => {
      const entries = periodTransactions.filter((transaction) => transaction.category === category);
      const net = entries.reduce((sum, transaction) => sum + transaction.amount, 0);
      const income = entries.reduce((sum, transaction) => sum + Math.max(transaction.amount, 0), 0);
      const expenses = entries.reduce((sum, transaction) => sum + Math.max(-transaction.amount, 0), 0);
      return { category, entries, net, income, expenses };
    });
  }, [periodTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return periodTransactions.filter((transaction) => {
      const matchesCategory = selectedCategory === "All" || transaction.category === selectedCategory;
      const matchesQuery = !query || `${transaction.title} ${transaction.detail} ${transaction.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [periodTransactions, search, selectedCategory]);

  const visibleTransactions = activeView === "overview"
    ? filteredTransactions.slice(0, 6)
    : filteredTransactions;
  const maxCategory = Math.max(...categoryTotals.map((category) => Math.abs(category.net)), 1);
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - period + 1);
  const rangeStart = customRange?.start ?? dateInputValue(dateFrom);
  const rangeEnd = customRange?.end ?? dateInputValue(new Date());
  const rangeLabel = `${displayDate(rangeStart)} – ${displayDate(rangeEnd)}`;

  function applyCustomRange() {
    if (!draftStart || !draftEnd || draftStart > draftEnd) {
      setRangeError("Choose a start date on or before the end date.");
      return;
    }
    if (draftEnd > dateInputValue(new Date())) {
      setRangeError("The end date cannot be in the future.");
      return;
    }
    const days = daysAgoFromDate(draftStart) - daysAgoFromDate(draftEnd) + 1;
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
      shortDate(transaction.daysAgo),
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
          <span className="brand-mark"><span /></span>
          <span className="brand-name">torn<span>lytics</span></span>
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
              <span className="metric-label">NET CASH FLOW</span>
              <span className="metric-icon net-icon">↗</span>
            </div>
            <div className={`metric-value ${totals.net < 0 ? "negative" : ""}`}>{totals.net >= 0 ? "+" : "−"}{money(totals.net)}</div>
            <div className="metric-foot"><span className="change-positive">● Sample data</span><span>not account-connected</span></div>
            <div className="metric-sparkline" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          </article>
          <article className="metric-card">
            <div className="metric-top"><span className="metric-label">TOTAL INCOME</span><span className="metric-icon income-icon">↓</span></div>
            <div className="metric-value">{money(totals.income)}</div>
            <div className="metric-foot"><span>{periodTransactions.filter((transaction) => transaction.amount > 0).length} transactions</span><span className="metric-side-label">MONEY IN</span></div>
          </article>
          <article className="metric-card">
            <div className="metric-top"><span className="metric-label">TOTAL EXPENSES</span><span className="metric-icon expense-icon">↑</span></div>
            <div className="metric-value">{money(totals.expenses)}</div>
            <div className="metric-foot"><span>{periodTransactions.filter((transaction) => transaction.amount < 0).length} transactions</span><span className="metric-side-label">MONEY OUT</span></div>
          </article>
          <article className="metric-card count-card">
            <div className="metric-top"><span className="metric-label">ACTIVITY LOGGED</span><span className="metric-icon count-icon"><Icon name="transactions" size={17} /></span></div>
            <div className="metric-value">{periodTransactions.length}<span className="metric-unit"> entries</span></div>
            <div className="metric-foot"><span>Across {categoryTotals.filter((category) => category.entries.length > 0).length} categories</span><span className="metric-side-label">LAST {period} DAYS</span></div>
          </article>
        </div>

        {activeView !== "transactions" && (
          <div className="insights-grid">
            <section className="panel trend-panel">
              <div className="section-heading">
                <div>
                  <h2>Cash flow trend</h2>
                  <p>Net movement over the last {period} days</p>
                </div>
                <div className="legend"><span><i className="legend-income" /> Inflow</span><span><i className="legend-expense" /> Outflow</span></div>
              </div>
              <CashflowChart data={periodTransactions} period={period} />
              <div className="chart-footer"><span>NET MOVEMENT · {Math.min(7, period)} INTERVALS</span><span>Amounts in Torn dollars</span></div>
            </section>

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
          </div>
        )}

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
                <article className="transaction-row" key={transaction.id}>
                  <span className="transaction-icon" style={{ color: categoryColors[transaction.category] }}>{transaction.icon}</span>
                  <div className="transaction-description">
                    <strong>{transaction.title}</strong>
                    <span>{transaction.detail}</span>
                  </div>
                  <span className="transaction-category">{transaction.category}</span>
                  <span className="transaction-date">{relativeDate(transaction.daysAgo)}</span>
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
            <div className="modal-mark"><span className="brand-mark"><span /></span></div>
            <span className="modal-eyebrow">COMING NEXT</span>
            <h2 id="connect-title">Your Torn data, at a glance.</h2>
            <p>This build is using fictional sample activity while the dashboard takes shape. Torn API connection is not enabled yet, so no API key is requested or stored.</p>
            <div className="modal-detail"><Icon name="info" size={16} /><span>The official activity-log endpoint requires a Full Access key. Never share your key in chat.</span></div>
            <button className="modal-done" onClick={() => setShowConnectInfo(false)}>Got it</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

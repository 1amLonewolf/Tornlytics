# Torn Cash Flow Dashboard — Project Spec

## 1. Vision

Build a web application that gives **Torn** (the online crime RPG) players a complete,
customizable **profit & loss (P&L) / cash flow statement** for any date range they choose.

The app must answer one question precisely and completely:

> "For the period I selected, how much money did I actually gain or lose,
> broken down by activity, including trades, flying, market, crimes, gambling, and everything else?"

No existing tool does this. This is the gap we are filling.

## 2. Problem Statement

Existing Torn financial tools have at least one of these limitations:
- Fixed reporting windows (e.g., only 7/30 days) — no custom start/end date.
- Focus on one category (e.g., only trades, or only net worth snapshots).
- Require manual logging instead of automated parsing.
- Show net worth but not **actual cash flow** for a chosen period.

This project requires **automated, log-based, category-level cash flow** over an
**arbitrary user-selected date range**.

## 3. Target User

A Torn player who wants to understand their economy:
- Where is my money actually coming from?
- Am I net profitable from flying? From trading? From gambling?
- What did my cash flow look like during faction war week vs. a normal week?

## 4. Core Features (MVP)

1. **API key input** (Full Access key required — see §6).
2. **Custom date range selector** (start date + end date, any range within Torn's log retention).
3. **Automated data retrieval** via Torn's `user/log` endpoint, with pagination.
4. **Automatic categorization** of every money-affecting log entry into financial buckets.
5. **Cash flow statement output**:
   | Category | Total Gain | Total Loss | Net |
   |---|---|---|---|
   | Trading & Market | +X | -Y | **+Z** |
   | Travel / Flying | +X | -Y | **+Z** |
   | ... | ... | ... | ... |
   | **Grand Total** | **+A** | **-B** | **+C** |
6. **Transaction drill-down**: click any category to see the individual log entries
   that make it up (timestamp, description, amount, + or -).
7. **Charts**: a bar or waterfall chart of net by category (Chart.js or similar).

## 5. Non-Goals (out of scope for MVP)

- No net worth tracking (separate concern; may be a later phase).
- No faction or company dashboards.
- No real-time monitoring / alerts.
- No mobile app — responsive web only.

## 6. Torn API — Technical Requirements

### 6.1 Authentication
- Base URL: `https://api.torn.com/`
- API key passed as query param: `?key=YOUR_KEY`
- **A Full Access API key is REQUIRED.** A Limited key does not expose the activity log,
  which is the entire data source for this project.
- Rate limit: **100 requests per minute per key.** The app must implement request
  throttling and/or batching to stay under this.

### 6.2 The critical endpoint: `user/log`

## 7. App status and local development

The current app is a demo-first React, Vite, and TypeScript dashboard. It uses
fictional activity data to exercise the cash-flow overview, date presets,
category breakdown, transaction search, and CSV export. It does not call Torn's
API, request an API key, or represent sample figures as real player data.

The official Torn API v2 schema currently documents `GET /user/log` as stable
and requiring a Full Access key. It supports `from` and `to` time filters and
returns up to 100 log entries per request. A future API integration must map
real log entries to financial categories carefully; the demo categorization is
not a substitute for validating Torn's log types and their money amounts.

### Source layout

- `src/App.tsx` contains dashboard state and page composition.
- `src/components/` contains reusable visual components, including the cash-flow chart and icons.
- `src/data/demo-transactions.ts` owns the fictional sample records. They are normalized to the shared transaction model and carry timestamps rather than demo-only relative dates.
- `src/domain/finance.ts` defines the normalized finance types, date-range filtering, category definitions, and total calculations.
- `src/lib/formatters.ts` contains display formatting for money and dates.
- `src/assets/` contains the fonts, licenses, and app-ready logo used by the interface.

Keep API response types and mapping separate from the normalized `Transaction`
model when integration begins. Validate API payloads and timestamps before
mapping them, and only categorize log types whose money-flow meaning has been
verified. Keep aggregation and filtering in the domain layer so they work the
same for demo and API-backed transactions.

### API key and deployment boundary

The browser app currently has no API-key handling. Torn requires the key as a
request parameter, so a request made directly from the browser exposes that key
to the user and browser tooling. Before collecting keys, choose a deployment
and credential-storage approach; do not put a real key in source code, a
`VITE_*` environment variable, browser storage, or a committed config file.
Never ask users to paste keys into chat. Any future request flow must also
handle API errors and stay within Torn's documented rate limit.

To run the dashboard locally:

```sh
npm install
npm run dev
```

For a visual preview of the loading skeleton, open `/loading-preview` while
the development server is running. This preview route is for design review;
the loading state will be connected to real API requests during integration.

Run `npm run build` to type-check and create the production bundle.
If PowerShell blocks `npm.ps1` due to its execution policy, use `npm.cmd`
instead (for example, `npm.cmd run dev`).

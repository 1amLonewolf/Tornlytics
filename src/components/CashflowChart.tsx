import type { Transaction } from "../domain/finance";
import { daysBetweenDates, money } from "../lib/formatters";

export function CashflowChart({ data, startDate, endDate }: { data: Transaction[]; startDate: string; endDate: string }) {
  const rangeStart = new Date(`${startDate}T00:00:00`);
  const rangeDays = Math.max(1, daysBetweenDates(startDate, endDate) + 1);
  const bucketCount = Math.min(7, rangeDays);
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const firstDay = Math.floor(index * rangeDays / bucketCount);
    const lastDayExclusive = Math.floor((index + 1) * rangeDays / bucketCount);
    const bucketStart = new Date(rangeStart);
    bucketStart.setDate(bucketStart.getDate() + firstDay);
    const bucketEnd = new Date(rangeStart);
    bucketEnd.setDate(bucketEnd.getDate() + lastDayExclusive - 1);
    const net = data.reduce((sum, transaction) => {
      const occurredAt = new Date(transaction.occurredAt);
      occurredAt.setHours(0, 0, 0, 0);
      const dayIndex = Math.round((occurredAt.getTime() - rangeStart.getTime()) / 86_400_000);
      return dayIndex >= firstDay && dayIndex < lastDayExclusive
        ? sum + transaction.amount
        : sum;
    }, 0);

    return {
      net,
      label: rangeDays <= 7
        ? bucketStart.toLocaleDateString("en-US", { weekday: "short" })
        : bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      title: bucketStart.getTime() === bucketEnd.getTime()
        ? bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : `${bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${bucketEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
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
      <svg className="cashflow-chart" viewBox="0 0 720 218" role="img" aria-label={`Net cash flow trend from ${startDate} to ${endDate}`}>
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
                <title>{bucket.title}: {bucket.net >= 0 ? "+" : "−"}{money(bucket.net)}</title>
              </rect>
              <text x={x + barWidth / 2} y="203" textAnchor="middle" className="chart-label">{bucket.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function money(value: number, compact = false) {
  const absolute = Math.abs(value);
  if (compact && absolute >= 1_000_000) {
    return `$${(absolute / 1_000_000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}m`;
  }
  if (compact && absolute >= 10_000) {
    return `$${Math.round(absolute / 1_000)}k`;
  }
  return `$${Math.round(absolute).toLocaleString("en-US")}`;
}

export function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetweenDates(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

export function displayDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fullDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function relativeDate(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const daysAgo = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

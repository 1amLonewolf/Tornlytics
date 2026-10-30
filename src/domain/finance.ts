export type CategoryName =
  | "Trading & Market"
  | "Travel / Flying"
  | "Crimes"
  | "Gambling"
  | "Property"
  | "Other";

export type Transaction = {
  id: string;
  title: string;
  detail: string;
  category: CategoryName;
  amount: number;
  occurredAt: string;
  icon: string;
};

export type DateRange = { start: string; end: string };
export type FinanceTotals = { income: number; expenses: number; net: number };
export type CategoryTotals = FinanceTotals & {
  category: CategoryName;
  entries: Transaction[];
};

export function filterTransactionsByRange(transactions: Transaction[], range: DateRange): Transaction[] {
  const start = new Date(`${range.start}T00:00:00`).getTime();
  const end = new Date(`${range.end}T23:59:59.999`).getTime();
  return transactions.filter((transaction) => {
    const occurredAt = new Date(transaction.occurredAt).getTime();
    return occurredAt >= start && occurredAt <= end;
  });
}

export const categoryColors: Record<CategoryName, string> = {
  "Trading & Market": "#9cdc6b",
  "Travel / Flying": "#6eb6ef",
  Crimes: "#ecaa62",
  Gambling: "#c29bfa",
  Property: "#56cfb4",
  Other: "#9da8a0",
};

export const categoryOrder: CategoryName[] = [
  "Trading & Market",
  "Travel / Flying",
  "Crimes",
  "Gambling",
  "Property",
  "Other",
];

export function calculateTotals(transactions: Transaction[]): FinanceTotals {
  return transactions.reduce(
    (result, transaction) => {
      if (transaction.amount > 0) result.income += transaction.amount;
      else result.expenses += Math.abs(transaction.amount);
      result.net += transaction.amount;
      return result;
    },
    { income: 0, expenses: 0, net: 0 },
  );
}

export function summarizeByCategory(transactions: Transaction[]): CategoryTotals[] {
  return categoryOrder.map((category) => {
    const entries = transactions.filter((transaction) => transaction.category === category);
    return {
      category,
      entries,
      ...calculateTotals(entries),
    };
  });
}

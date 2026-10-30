import type { Transaction } from "../domain/finance";

type DemoTransaction = Omit<Transaction, "id" | "occurredAt"> & {
  id: number;
  daysAgo: number;
};

const demoRecords: DemoTransaction[] = [
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

function dateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export const demoTransactions: Transaction[] = demoRecords.map(({ id, daysAgo, ...transaction }) => ({
  ...transaction,
  id: `demo-${id}`,
  occurredAt: dateDaysAgo(daysAgo),
}));

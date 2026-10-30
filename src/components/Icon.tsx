type IconName = "overview" | "transactions" | "categories" | "search" | "download" | "arrow" | "close" | "info";

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
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

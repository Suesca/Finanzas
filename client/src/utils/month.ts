export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(monthKey: string): string {
  const formatter = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });
  return formatter.format(new Date(`${monthKey}-01T00:00:00`));
}

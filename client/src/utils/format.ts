const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number): string {
  return formatter.format(amount);
}

export function formatDayOfMonth(day: number): string {
  return `día ${day}`;
}

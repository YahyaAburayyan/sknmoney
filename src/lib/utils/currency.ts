/**
 * Parse a currency string like "12.50" or "12" into integer cents (1250 or 1200).
 * Returns NaN if the input is not a valid currency amount.
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return NaN;
  const num = parseFloat(cleaned);
  if (isNaN(num)) return NaN;
  return Math.round(num * 100);
}

/**
 * Format integer cents into a display string like "$12.50".
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format cents as a plain number string like "12.50".
 */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Split `totalCents` equally among `count` people.
 * Returns an array of per-person amounts. The first person absorbs the rounding remainder.
 */
export function splitEqually(totalCents: number, count: number): number[] {
  if (count === 0) return [];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? base + remainder : base
  );
}

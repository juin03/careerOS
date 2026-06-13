export function rm(amount: number): string {
  return `RM${amount.toLocaleString("en-MY")}`;
}

export function rmRange(min: number, max: number): string {
  return `${rm(min)}–${rm(max)}`;
}

export function rmDelta(amount: number): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
  return `${sign}${rm(Math.abs(amount))}`;
}

export function months(n: number): string {
  if (n < 12) return `${n} mo`;
  const years = (n / 12).toFixed(n % 12 === 0 ? 0 : 1);
  return `${years} yr`;
}

export function pct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

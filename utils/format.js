// Rand formatting without relying on Intl (works the same on every phone).
// 1000 -> "R1 000", 1234.5 -> "R1 234.50", -250 -> "-R250". Uses a non-breaking
// space so an amount never wraps across two lines.
export function formatRand(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'R0';
  const abs = Math.abs(n);
  const cents = Math.round(abs * 100);
  const hasCents = cents % 100 !== 0;
  const [whole, decimals] = (cents / 100).toFixed(hasCents ? 2 : 0).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  const sign = n < 0 && cents > 0 ? '-' : '';
  return `${sign}R${grouped}${decimals ? `.${decimals}` : ''}`;
}
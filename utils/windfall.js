// Spots a payment that is much bigger than usual and suggests a safe way to split it.
// Pure functions only (no React, no storage, no network): runs on the phone, uses no data.
import { getWindfallAdvice } from './insights.js';
import { formatRand } from './format.js';

// A payment counts as a windfall when it is at least this many times the usual payment.
export const WINDFALL_MULTIPLE = 1.5;
// Payments needed before "usual" means anything.
export const MIN_ENTRIES_FOR_TYPICAL = 3;
// Only the most recent payments set what is usual.
const RECENT_ENTRIES = 6;

const median = (sorted) => {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// The usual payment size: median of the last few income entries (this cycle and archived months).
// Returns null until there are MIN_ENTRIES_FOR_TYPICAL entries.
export function getTypicalIncome(reports, transactions) {
  const entries = [];
  const collect = (list) =>
    (list || []).forEach((t) => {
      if (!t || t.type !== 'income') return;
      const time = new Date(t.createdAt).getTime();
      const amount = Number(t.amount);
      if (Number.isNaN(time) || !(amount > 0)) return;
      entries.push({ time, amount });
    });
  collect(transactions);
  (reports || []).forEach((r) => collect(r && r.transactions));
  if (entries.length < MIN_ENTRIES_FOR_TYPICAL) return null;
  const recent = entries
    .sort((a, b) => a.time - b.time)
    .slice(-RECENT_ENTRIES)
    .map((e) => e.amount)
    .sort((a, b) => a - b);
  return median(recent);
}

// Call this BEFORE the new payment is saved, so it is not compared with itself.
export function isWindfall(amount, reports, transactions) {
  const typical = getTypicalIncome(reports, transactions);
  if (typical === null || !(Number(amount) > 0)) return false;
  return Number(amount) >= typical * WINDFALL_MULTIPLE;
}

// { coverFixed, toSavings, buffer }: bills still due first, then 20% of what is left to savings,
// and the rest as a buffer for slow weeks. Always adds up to the amount.
export function buildWindfallPlan(amount, rows) {
  const advice = getWindfallAdvice(Number(amount), rows);
  return {
    coverFixed: Math.round(advice.coverFixed),
    toSavings: advice.toSavings,
    buffer: Math.round(Number(amount)) - Math.round(advice.coverFixed) - advice.toSavings,
  };
}

// t: optional translate function (key, params) from useT(). Without it the text is English.
export function describeWindfallPlan(amount, plan, t) {
  const say = t || ((key, params) => ({
    'windfall.toBills': `${params && params.amount} to bills`,
    'windfall.toSavings': `${params && params.amount} to savings`,
    'windfall.buffer': `${params && params.amount} buffer`,
    'windfall.describe': `${params && params.amount} logged. Zak suggests ${params && params.parts}.`,
  }[key]));
  const parts = [];
  if (plan.coverFixed > 0) parts.push(say('windfall.toBills', { amount: formatRand(plan.coverFixed) }));
  parts.push(say('windfall.toSavings', { amount: formatRand(plan.toSavings) }));
  parts.push(say('windfall.buffer', { amount: formatRand(plan.buffer) }));
  return say('windfall.describe', { amount: formatRand(amount), parts: parts.join(', ') });
}

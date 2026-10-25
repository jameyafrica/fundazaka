// Finds the day of the week that most of a category's spending happens on.
// Pure functions over transactions the app already stores.
import { SAVINGS_KEY } from './budgetMath.js';
import { CATEGORY_META } from '../constants/categories.js';

// Paid once a month, so a weekday says nothing about them. (Same list as FIXED_KEYS in insights.js,
// repeated here so insights.js can import this file without a circular import.)
const ONE_OFF_KEYS = ['rent', 'debit'];

export const WEEKDAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
// Entries needed in a category before a pattern means anything.
export const MIN_ENTRIES_FOR_PATTERN = 5;
// Share of a category's spending one weekday must hold to count as a pattern (an even week is about 14%).
export const PATTERN_SHARE = 0.4;

// All patterns found, strongest first: [{ key, title, dayIndex, dayName, share, percent, count }].
// Rent, debit orders and savings are skipped: they are paid once, so a weekday says nothing.
export function getWeekdayPatterns(transactions, reports) {
  const all = [...(transactions || [])];
  (reports || []).forEach((r) => all.push(...((r && r.transactions) || [])));

  const byCategory = new Map();
  all.forEach((t) => {
    if (!t || t.type !== 'expense' || !t.categoryKey) return;
    if (t.categoryKey === SAVINGS_KEY || ONE_OFF_KEYS.includes(t.categoryKey)) return;
    const date = new Date(t.createdAt);
    const amount = Number(t.amount);
    if (Number.isNaN(date.getTime()) || !(amount > 0)) return;
    const entry = byCategory.get(t.categoryKey) || { days: [0, 0, 0, 0, 0, 0, 0], count: 0, total: 0 };
    entry.days[date.getDay()] += amount;
    entry.count += 1;
    entry.total += amount;
    byCategory.set(t.categoryKey, entry);
  });

  const patterns = [];
  byCategory.forEach((entry, key) => {
    if (entry.count < MIN_ENTRIES_FOR_PATTERN || entry.total <= 0) return;
    const top = entry.days.reduce((best, amount, index) => (amount > entry.days[best] ? index : best), 0);
    const share = entry.days[top] / entry.total;
    if (share < PATTERN_SHARE) return;
    patterns.push({
      key,
      title: CATEGORY_META[key] ? CATEGORY_META[key].title : key,
      dayIndex: top,
      dayName: WEEKDAY_NAMES[top],
      share,
      percent: Math.round(share * 100),
      count: entry.count,
    });
  });
  return patterns.sort((a, b) => b.share - a.share);
}

export function describePattern(p) {
  return `${p.percent}% of your ${p.title.toLowerCase()} spend happens on ${p.dayName}.`;
}

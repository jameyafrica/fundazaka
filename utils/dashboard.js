// Pure logic for the dashboard hero card. No React, easy to test.
import { PROGRESS_BANDS } from './budgetMath.js';
import { MIN_PAYDAYS_FOR_RHYTHM, forecastAll, formatShortDate, predictNextIncome } from './insights.js';

// Five segments, one per 20% band. A segment is filled once progress passes its start.
export function getSegments(ratio) {
  return PROGRESS_BANDS.map((band, i) => ({
    filled: ratio > (i * 20) / 100,
    tint: band.tint,
    opacity: band.opacity,
  }));
}

// row: one entry of categoryRows from useBudget(), or null for the "Total" view.
export function getHeroState(row, totals) {
  if (!row) {
    return {
      mode: 'total',
      primaryLabel: 'Zaks',
      primaryLabelKey: 'hero.zaks',
      primaryValue: totals.income,
      targetValue: totals.target,
      isOver: false,
      isCelebrating: false,
      showProgress: false,
      segments: [],
      motivationKind: 'default',
    };
  }

  const { visual } = row;
  const base = { mode: 'category', targetValue: row.targetAmount, isOver: false, isCelebrating: false };

  if (visual.variant === 'savings') {
    // Savings never goes "Over": passing the target is a win, the bar just falls away.
    if (row.spentAmount > row.targetAmount) {
      return {
        ...base,
        primaryLabel: 'Extra saved',
        primaryLabelKey: 'hero.extraSaved',
        primaryValue: row.spentAmount - row.targetAmount,
        isCelebrating: true,
        showProgress: false,
        segments: [],
        motivationKind: 'savingsOver',
      };
    }
    return {
      ...base,
      primaryLabel: 'Balance',
      primaryLabelKey: 'hero.balance',
      primaryValue: visual.remainingAmount,
      showProgress: true,
      segments: getSegments(visual.ratio),
      motivationKind: 'savings',
    };
  }

  if (visual.isOver) {
    return {
      ...base,
      isOver: true,
      primaryLabel: 'Over',
      primaryLabelKey: 'hero.over',
      primaryValue: visual.overAmount,
      showProgress: false,
      segments: [],
      motivationKind: 'over',
    };
  }

  return {
    ...base,
    primaryLabel: 'Balance',
    primaryLabelKey: 'hero.balance',
    primaryValue: visual.remainingAmount,
    showProgress: true,
    segments: getSegments(visual.ratio),
    motivationKind: visual.remainingAmount === 0 ? 'reached' : 'default',
  };
}

// The "Next payment" card on the dashboard, built from the same pay-rhythm forecast Zak uses.
// kind: 'learning' (not enough pay days yet) | 'upcoming' | 'today' | 'overdue'.
// Amounts are whole Rand; confidence is 'low' | 'medium' | 'high'.
export function getNextPaymentCard(monthlyReports, transactions, now = new Date()) {
  const next = predictNextIncome(monthlyReports, transactions, now);
  if (!next.ok) {
    return { kind: 'learning', count: MIN_PAYDAYS_FOR_RHYTHM, seen: next.paydays };
  }
  const shared = { low: next.amountLow, high: next.amountHigh, typical: next.typicalAmount, confidence: next.confidence };
  if (next.status === 'overdue') return { kind: 'overdue', ...shared };
  if (next.expectedInDays === 0) return { kind: 'today', ...shared };
  return { kind: 'upcoming', date: formatShortDate(next.expectedDate), days: next.expectedInDays, ...shared };
}

// One-line pace warning for the hero card, from the same forecast Zak uses.
// rows = categoryRows, progress = getCycleProgress(...), selectedKey = pill that is on (null = Total view).
// Returns null unless a category is on pace to pass its target (a category already over has its own state).
// { key, daysUntilOver (number or null), projectedOver (whole Rand) }
export function getHeroForecast(rows, progress, selectedKey = null) {
  const list = selectedKey ? (rows || []).filter((r) => r.key === selectedKey) : rows || [];
  const heading = forecastAll(list, progress).filter((f) => f.status === 'heading-over');
  if (heading.length === 0) return null;
  const worst = heading.sort((a, b) => b.projectedOver - a.projectedOver)[0];
  return { key: worst.key, daysUntilOver: worst.daysUntilOver, projectedOver: Math.round(worst.projectedOver) };
}

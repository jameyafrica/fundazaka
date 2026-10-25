// Pure logic for the dashboard hero card. No React, easy to test.
import { PROGRESS_BANDS } from './budgetMath.js';
import { MIN_PAYDAYS_FOR_RHYTHM, formatShortDate, predictNextIncome } from './insights.js';

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
      showProgress: false,
      segments: [],
      motivationKind: 'default',
    };
  }

  const { visual } = row;
  const base = { mode: 'category', targetValue: row.targetAmount, isOver: false };

  if (visual.variant === 'savings') {
    // Savings never goes "Over": passing the target is a win, the bar just falls away.
    if (row.spentAmount > row.targetAmount) {
      return {
        ...base,
        primaryLabel: 'Extra saved',
        primaryLabelKey: 'hero.extraSaved',
        primaryValue: row.spentAmount - row.targetAmount,
        showProgress: false,
        segments: [],
        motivationKind: 'savings',
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
// Pure logic for the dashboard hero card. No React, easy to test.
import { PROGRESS_BANDS } from './budgetMath.js';

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
        primaryValue: row.spentAmount - row.targetAmount,
        showProgress: false,
        segments: [],
        motivationKind: 'savings',
      };
    }
    return {
      ...base,
      primaryLabel: 'Balance',
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
      primaryValue: visual.overAmount,
      showProgress: false,
      segments: [],
      motivationKind: 'over',
    };
  }

  return {
    ...base,
    primaryLabel: 'Balance',
    primaryValue: visual.remainingAmount,
    showProgress: true,
    segments: getSegments(visual.ratio),
    motivationKind: visual.remainingAmount === 0 ? 'reached' : 'default',
  };
}

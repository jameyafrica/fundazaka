// Pure helpers for category progress, opacity tiers and the OVER state.
// Source of the bands: the FNB PDF opacity table (see decision list).

export const TINT_DARK = '#000000';
export const TINT_LIGHT = '#FFFFFF';

// Upper edge of each band is inclusive: exactly 100% still counts as 81-100%.
export const PROGRESS_BANDS = [
  { maxRatio: 0.2, tint: TINT_DARK, opacity: 0.41 },
  { maxRatio: 0.4, tint: TINT_LIGHT, opacity: 0.3 },
  { maxRatio: 0.6, tint: TINT_LIGHT, opacity: 0.45 },
  { maxRatio: 0.8, tint: TINT_LIGHT, opacity: 0.6 },
  { maxRatio: 1, tint: TINT_LIGHT, opacity: 0.8 },
];

export const OVER_OPACITY = 0.6;
export const SAVINGS_OPACITY = 0.8;
export const SAVINGS_KEY = 'savings';

function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// spent / target. A zero target is safe: 0 if nothing spent, Infinity otherwise.
export function getProgressRatio(spentAmount, targetAmount) {
  const spent = toAmount(spentAmount);
  const target = toAmount(targetAmount);
  if (target === 0) {
    return spent > 0 ? Infinity : 0;
  }
  return spent / target;
}

// Everything a screen needs to draw one category.
// variant: 'normal' | 'over' | 'savings'. For 'over', tint is null because the
// screen uses the orange warning colour from the theme.
export function getCategoryVisual(categoryKey, spentAmount, targetAmount) {
  const spent = toAmount(spentAmount);
  const target = toAmount(targetAmount);
  const ratio = getProgressRatio(spent, target);

  if (categoryKey === SAVINGS_KEY) {
    return {
      variant: 'savings',
      ratio,
      opacity: SAVINGS_OPACITY,
      tint: TINT_LIGHT,
      isOver: false,
      overAmount: 0,
      remainingAmount: Math.max(target - spent, 0),
    };
  }

  if (ratio > 1) {
    return {
      variant: 'over',
      ratio,
      opacity: OVER_OPACITY,
      tint: null,
      isOver: true,
      overAmount: spent - target,
      remainingAmount: 0,
    };
  }

  const band = PROGRESS_BANDS.find((b) => ratio <= b.maxRatio);
  return {
    variant: 'normal',
    ratio,
    opacity: band.opacity,
    tint: band.tint,
    isOver: false,
    overAmount: 0,
    remainingAmount: target - spent,
  };
}
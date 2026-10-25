// Suggests smaller monthly targets when they add up to more than a cautious month of income.
// Pure functions: no React, no storage.
import { FIXED_KEYS } from './insights.js';
import { sumMoney } from './money.js';

export const ROUND_STEP = 10; // suggested targets are whole multiples of R10, rounded DOWN
export const MIN_TARGET = 10;

const floorToStep = (n) => Math.max(Math.floor(n / ROUND_STEP) * ROUND_STEP, MIN_TARGET);

// categories = [{ key, targetAmount }], planningIncome = cautious month (see getIncomeStability).
// Rent and debit orders are fixed commitments, so they stay as they are when the flexible categories
// (transport, groceries, savings) can absorb the cut. Otherwise everything is scaled down evenly.
// Returns { changed, categories, total, planningIncome } and never returns a total above planningIncome.
export function suggestTargets(categories, planningIncome) {
  const list = (categories || []).map((c) => ({ key: c.key, targetAmount: Number(c.targetAmount) || 0 }));
  const total = sumMoney(list.map((c) => c.targetAmount));
  const income = Number(planningIncome) || 0;
  const unchanged = { changed: false, categories: list, total, planningIncome: income };
  if (income <= 0 || total <= income || list.length === 0) return unchanged;
  if (income < list.length * MIN_TARGET) return unchanged;

  const fixed = list.filter((c) => FIXED_KEYS.includes(c.key));
  const flexible = list.filter((c) => !FIXED_KEYS.includes(c.key));
  const fixedTotal = sumMoney(fixed.map((c) => c.targetAmount));
  const flexibleTotal = sumMoney(flexible.map((c) => c.targetAmount));
  const room = income - fixedTotal;

  let scaled;
  if (flexible.length > 0 && flexibleTotal > 0 && room >= flexible.length * MIN_TARGET) {
    const factor = room / flexibleTotal;
    scaled = list.map((c) => (FIXED_KEYS.includes(c.key) ? c : { ...c, targetAmount: floorToStep(c.targetAmount * factor) }));
  } else {
    const factor = income / total;
    scaled = list.map((c) => ({ ...c, targetAmount: floorToStep(c.targetAmount * factor) }));
  }

  const newTotal = sumMoney(scaled.map((c) => c.targetAmount));
  // Rounding down and the R10 floor can never push the total above the cautious income here,
  // but if fixed items alone are over it we return the original instead of a misleading plan.
  if (newTotal > income) return unchanged;
  return { changed: true, categories: scaled, total: newTotal, planningIncome: income };
}

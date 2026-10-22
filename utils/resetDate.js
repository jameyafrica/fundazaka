// Pure date helpers for the monthly reset rule. No React, no storage.
// Months are JavaScript-style (0 = January ... 11 = December).

export const RESET_DAY_MIN = 1;
export const RESET_DAY_MAX = 30;

export function isValidResetDay(day) {
  return Number.isInteger(day) && day >= RESET_DAY_MIN && day <= RESET_DAY_MAX;
}

// How many days a given month has (handles leap years).
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// The day the reset really happens in a given month.
// If the chosen day does not exist (e.g. 30 in February), use the last day.
export function getEffectiveResetDay(chosenDay, year, month) {
  return Math.min(chosenDay, getDaysInMonth(year, month));
}

// The most recent scheduled reset moment (local midnight) on or before `now`.
export function getLatestScheduledReset(chosenDay, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const thisMonth = new Date(year, month, getEffectiveResetDay(chosenDay, year, month));
  if (thisMonth <= now) {
    return thisMonth;
  }
  const prev = new Date(year, month - 1, 1); // January rolls back to December safely
  const prevYear = prev.getFullYear();
  const prevMonth = prev.getMonth();
  return new Date(prevYear, prevMonth, getEffectiveResetDay(chosenDay, prevYear, prevMonth));
}

// Is a reset due? `cycleStartedAt` is when the current budgeting cycle began
// (an ISO string or Date): the end of onboarding, or the last applied reset.
// A missed reset stays "due" until it is applied, because the latest scheduled
// date will still be later than cycleStartedAt.
export function isResetDue(chosenDay, cycleStartedAt, now = new Date()) {
  if (!isValidResetDay(chosenDay) || !cycleStartedAt) {
    return false;
  }
  const started = new Date(cycleStartedAt);
  if (Number.isNaN(started.getTime())) {
    return false;
  }
  return getLatestScheduledReset(chosenDay, now) > started;
}
// "Zak Insights": the offline brain behind the AI Bot.
// Pure functions only (no React, no storage, no network), so it uses no mobile data,
// works anywhere, and is easy to unit test.
//
// It is rule-based forecasting, not machine learning: it reads the user's own
// transactions and archived months and works out pace, patterns and what is safe to spend.
//
// ctx shape (all of it already lives in BudgetContext):
//   { displayName, categoryRows, totals, transactions, monthlyReports,
//     resetDay, cycleStartedAt, learning }

import { getEffectiveResetDay, getLatestScheduledReset } from './resetDate.js';
import { formatRand } from './format.js';
import { getCurrentStreak } from './learning.js';
import { SAVINGS_KEY } from './budgetMath.js';
import { CATEGORY_META } from '../constants/categories.js';

const DAY_MS = 86400000;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Fixed commitments are paid once, so they are never extrapolated day by day.
export const FIXED_KEYS = ['rent', 'debit'];
// Variable spending needs a few days of data before a pace means anything.
export const MIN_DAYS_FOR_PACE = 3;
// Share of a one-off windfall we suggest putting into savings.
export const WINDFALL_SAVE_SHARE = 0.2;

const CATEGORY_WORDS = {
  rent: ['rent', 'landlord', 'bond'],
  transport: ['transport', 'taxi', 'petrol', 'fuel', 'bolt', 'uber', 'bus', 'train'],
  debit: ['debit', 'contract', 'subscription', 'insurance'],
  groceries: ['groceries', 'grocery', 'food', 'shoprite', 'checkers', 'woolworths', 'spar'],
  savings: ['savings', 'saving', 'save'],
};

const titleOf = (key) => (CATEGORY_META[key] ? CATEGORY_META[key].title : key);
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);
const round = (n) => Math.round(n);

export function formatShortDate(date) {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

// Pulls a Rand amount out of free text: "R1 500", "r300", "1500,50", "300".
// Prefers a number written with an R; otherwise takes the first number with 2+ digits.
export function parseAmount(text) {
  const source = String(text || '');
  const withR = source.match(/\bR\s?(\d{1,3}(?:[ \u00A0]\d{3})+|\d+)(?:[.,](\d{1,2}))?/i);
  const plain = source.match(/(\d{1,3}(?:[ \u00A0]\d{3})+|\d{2,})(?:[.,](\d{1,2}))?/);
  const match = withR || plain;
  if (!match) return null;
  const whole = match[1].replace(/[ \u00A0]/g, '');
  const value = Number(`${whole}.${match[2] || '0'}`);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// Which category (if any) the user is talking about.
export function detectCategory(text) {
  const lower = String(text || '').toLowerCase();
  const keys = Object.keys(CATEGORY_WORDS);
  for (const key of keys) {
    if (CATEGORY_WORDS[key].some((word) => new RegExp(`\\b${word}\\b`).test(lower))) return key;
  }
  return null;
}

// The next scheduled reset after `now` (handles the February fallback via resetDate).
export function getNextReset(chosenDay, now = new Date()) {
  const latest = getLatestScheduledReset(chosenDay, now);
  const nextMonth = new Date(latest.getFullYear(), latest.getMonth() + 1, 1);
  const year = nextMonth.getFullYear();
  const month = nextMonth.getMonth();
  return new Date(year, month, getEffectiveResetDay(chosenDay, year, month));
}

// Where we are in the current budgeting cycle.
// elapsed counts today; daysLeft is days until the next reset (today included).
export function getCycleProgress(resetDay, cycleStartedAt, now = new Date()) {
  const validDay = Number.isInteger(resetDay) && resetDay >= 1 && resetDay <= 30;
  const day = validDay ? resetDay : 1;
  const nextReset = getNextReset(day, now);
  let start = cycleStartedAt ? new Date(cycleStartedAt) : null;
  if (!start || Number.isNaN(start.getTime()) || start > now) start = getLatestScheduledReset(day, now);
  const cycleLength = Math.max(dayDiff(start, nextReset), 1);
  const elapsed = Math.min(Math.max(dayDiff(start, now) + 1, 1), cycleLength);
  const daysLeft = Math.max(dayDiff(now, nextReset), 1);
  return { start, nextReset, cycleLength, elapsed, daysLeft };
}

// Pace forecast for one category row { key, targetAmount, spentAmount }.
// status: 'savings' | 'over' | 'heading-over' | 'on-track' | 'early'
export function forecastCategory(row, progress) {
  const spent = Number(row.spentAmount) || 0;
  const target = Number(row.targetAmount) || 0;
  const base = { key: row.key, spent, target, projected: spent, projectedOver: 0, daysUntilOver: null };

  if (row.key === SAVINGS_KEY) {
    return { ...base, status: 'savings' };
  }
  if (spent > target) {
    return { ...base, status: 'over', projectedOver: spent - target };
  }
  if (FIXED_KEYS.includes(row.key)) {
    // Not paid yet: assume it will be paid in full. Already paid: it is what it is.
    const projected = spent > 0 ? spent : target;
    return { ...base, projected, status: projected > target ? 'heading-over' : 'on-track' };
  }
  if (progress.elapsed < MIN_DAYS_FOR_PACE) {
    return { ...base, status: 'early' };
  }
  const dailyRate = spent / progress.elapsed;
  const projected = dailyRate * progress.cycleLength;
  if (projected > target && dailyRate > 0) {
    return {
      ...base,
      projected,
      projectedOver: projected - target,
      daysUntilOver: Math.max(Math.ceil((target - spent) / dailyRate), 0),
      status: 'heading-over',
    };
  }
  return { ...base, projected, status: 'on-track' };
}

export function forecastAll(rows, progress) {
  return (rows || []).map((row) => forecastCategory(row, progress));
}

// What is safe to spend: balance minus fixed bills still to be paid, spread over the days left.
export function getSafeToSpend(rows, totals, progress) {
  const committed = (rows || [])
    .filter((r) => FIXED_KEYS.includes(r.key))
    .reduce((sum, r) => sum + Math.max((Number(r.targetAmount) || 0) - (Number(r.spentAmount) || 0), 0), 0);
  const balance = Number(totals && totals.balance) || 0;
  const free = Math.max(balance - committed, 0);
  return {
    balance,
    committed,
    free,
    perDay: free > 0 ? free / progress.daysLeft : 0,
    daysLeft: progress.daysLeft,
  };
}

// Looks at past months and the gaps between payments.
export function getIncomePattern(reports, transactions, totals) {
  const monthly = (reports || []).map((r) => Number(r.totalIncome) || 0).filter((n) => n > 0);
  const incomes = [];
  const collect = (list) =>
    (list || []).forEach((t) => {
      if (t.type === 'income' && t.createdAt) incomes.push(new Date(t.createdAt));
    });
  collect(transactions);
  (reports || []).forEach((r) => collect(r.transactions));
  incomes.sort((a, b) => a - b);

  let typicalGapDays = null;
  if (incomes.length >= 2) {
    const gaps = [];
    for (let i = 1; i < incomes.length; i += 1) gaps.push(dayDiff(incomes[i - 1], incomes[i]));
    typicalGapDays = round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  }

  const target = Number(totals && totals.target) || 0;
  if (monthly.length === 0) {
    return { monthsCounted: 0, lowest: 0, highest: 0, average: 0, typicalGapDays, targetsAboveLowest: false, shortfall: 0 };
  }
  const lowest = Math.min(...monthly);
  const highest = Math.max(...monthly);
  const average = monthly.reduce((s, n) => s + n, 0) / monthly.length;
  return {
    monthsCounted: monthly.length,
    lowest,
    highest,
    average,
    typicalGapDays,
    targetsAboveLowest: target > lowest,
    shortfall: Math.max(target - lowest, 0),
  };
}

// ---------------------------------------------------------------------------
// Income rhythm and stability: the irregular-income brain.
// Still plain rules and statistics on the user's own history (no network, no ML),
// but it learns each person's pay pattern instead of assuming a salary date.
// ---------------------------------------------------------------------------

// Pay days needed before a rhythm means anything (3 pay days = 2 gaps).
export const MIN_PAYDAYS_FOR_RHYTHM = 3;
// Finished months needed before income stability means anything.
export const MIN_MONTHS_FOR_STABILITY = 2;
// Month-to-month swing (std deviation / average): at or below STEADY_CV is steady, at or below VARIABLE_CV is variable.
export const STEADY_CV = 0.15;
export const VARIABLE_CV = 0.35;
// Only the most recent pay days set the "typical payment" size.
const RECENT_PAYDAYS = 6;

const median = (sorted) => {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Linear-interpolated percentile of an ascending list (p from 0 to 1).
const percentile = (sorted, p) => {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (index - lo);
};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Every day money arrived, oldest first: [{ date, amount }]. Several payments on one day count as
// one pay day. Work income sets the rhythm; gifts and one-offs only count when there is too little work income.
export function getPaydays(reports, transactions) {
  const events = [];
  const collect = (list) =>
    (list || []).forEach((t) => {
      if (!t || t.type !== 'income') return;
      const date = new Date(t.createdAt);
      const amount = Number(t.amount);
      if (Number.isNaN(date.getTime()) || !(amount > 0)) return;
      events.push({ date, amount, source: t.source });
    });
  collect(transactions);
  (reports || []).forEach((r) => collect(r && r.transactions));

  const collapse = (list) => {
    const byDay = new Map();
    list.forEach((e) => {
      const key = startOfDay(e.date).getTime();
      const current = byDay.get(key);
      byDay.set(key, { date: new Date(key), amount: (current ? current.amount : 0) + e.amount });
    });
    return [...byDay.values()].sort((a, b) => a.date - b.date);
  };

  const work = collapse(events.filter((e) => e.source === 'work'));
  return work.length >= MIN_PAYDAYS_FOR_RHYTHM ? work : collapse(events);
}

// How much the user's monthly income swings, and what income to plan around.
// reports = finished months (newest first or any order). targetTotal = sum of all category targets.
// level: 'unknown' | 'steady' | 'variable' | 'volatile'.
// planningIncome is a cautious month: average minus one standard deviation (never below 0).
export function getIncomeStability(reports, targetTotal = 0) {
  const months = (reports || []).map((r) => Number(r && r.totalIncome) || 0).filter((n) => n > 0);
  const target = Number(targetTotal) || 0;
  if (months.length < MIN_MONTHS_FOR_STABILITY) {
    return { level: 'unknown', months: months.length, average: 0, stdDev: 0, variation: 0, planningIncome: 0, targetShortfall: 0, targetsFit: null };
  }
  const average = months.reduce((s, n) => s + n, 0) / months.length;
  // Sample standard deviation (n - 1): with only a few months it is the cautious choice.
  const variance = months.reduce((s, n) => s + (n - average) ** 2, 0) / (months.length - 1);
  const stdDev = Math.sqrt(variance);
  const variation = stdDev / average;
  const level = variation <= STEADY_CV ? 'steady' : variation <= VARIABLE_CV ? 'variable' : 'volatile';
  const planningIncome = Math.max(round(average - stdDev), 0);
  return {
    level,
    months: months.length,
    average: round(average),
    stdDev: round(stdDev),
    variation,
    planningIncome,
    targetShortfall: Math.max(target - planningIncome, 0),
    targetsFit: target <= planningIncome,
  };
}

// Learns the user's pay rhythm and predicts the next payment.
// ok: false until there are MIN_PAYDAYS_FOR_RHYTHM pay days.
// status: 'upcoming' (before the usual window) | 'due-soon' (inside it) | 'overdue' (past it).
// confidence: 'low' | 'medium' | 'high', from how regular the gaps are and how many pay days we have seen.
export function predictNextIncome(reports, transactions, now = new Date()) {
  const paydays = getPaydays(reports, transactions);
  if (paydays.length < MIN_PAYDAYS_FOR_RHYTHM) return { ok: false, paydays: paydays.length };

  const gaps = [];
  for (let i = 1; i < paydays.length; i += 1) gaps.push(dayDiff(paydays[i - 1].date, paydays[i].date));
  const typicalGapDays = Math.max(round(median([...gaps].sort((a, b) => a - b))), 1);
  const meanGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const gapStdDev = Math.sqrt(gaps.reduce((s, g) => s + (g - meanGap) ** 2, 0) / gaps.length);
  const spreadDays = Math.max(round(gapStdDev), 1);

  const last = paydays[paydays.length - 1];
  const daysSinceLast = Math.max(dayDiff(last.date, now), 0);
  const expectedInDays = Math.max(typicalGapDays - daysSinceLast, 0);
  const earliestInDays = Math.max(typicalGapDays - spreadDays - daysSinceLast, 0);
  const latestInDays = Math.max(typicalGapDays + spreadDays - daysSinceLast, 0);

  let status = 'upcoming';
  if (daysSinceLast > typicalGapDays + spreadDays) status = 'overdue';
  else if (daysSinceLast >= typicalGapDays - spreadDays) status = 'due-soon';

  const regularity = gapStdDev / meanGap;
  let confidence = 'low';
  if (regularity <= 0.25 && paydays.length >= 6) confidence = 'high';
  else if (regularity <= 0.6 && paydays.length >= 4) confidence = 'medium';

  const amounts = paydays.slice(-RECENT_PAYDAYS).map((p) => p.amount).sort((a, b) => a - b);
  const today = startOfDay(now);
  return {
    ok: true,
    paydays: paydays.length,
    typicalGapDays,
    spreadDays,
    lastDate: last.date,
    daysSinceLast,
    expectedInDays,
    earliestInDays,
    latestInDays,
    expectedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + expectedInDays),
    status,
    confidence,
    typicalAmount: round(median(amounts)),
    amountLow: round(percentile(amounts, 0.25)),
    amountHigh: round(percentile(amounts, 0.75)),
  };
}

// Everything the bot knows about the user's income timing and stability, in one object.
export function getIncomeOutlook(ctx, now = new Date()) {
  const totals = ctx.totals || {};
  return {
    stability: getIncomeStability(ctx.monthlyReports, totals.target),
    next: predictNextIncome(ctx.monthlyReports, ctx.transactions, now),
  };
}

// A cautious daily amount: free money spread until the LATEST likely payday, not the optimistic one.
// With no usable prediction (or a payment that is already overdue) it falls back to the reset date.
// basis: 'payday' | 'reset'.
export function getCautiousAllowance(safe, next) {
  const useRhythm = Boolean(next && next.ok && next.status !== 'overdue');
  const days = useRhythm ? Math.max(next.latestInDays, 1) : Math.max(safe.daysLeft, 1);
  return { days, perDay: safe.free > 0 ? safe.free / days : 0, basis: useRhythm ? 'payday' : 'reset' };
}

export function describeNextIncome(next) {
  if (!next || !next.ok) {
    const seen = next && next.paydays ? next.paydays : 0;
    return `I need to see at least ${MIN_PAYDAYS_FOR_RHYTHM} pay days before I can spot your rhythm. You have logged ${plural(seen, 'pay day')} so far. Log every payment, even small ones.`;
  }
  const rhythm = `Money usually lands every ${plural(next.typicalGapDays, 'day')}, give or take ${plural(next.spreadDays, 'day')}.`;
  const size = `Payments are usually ${formatRand(next.amountLow)} to ${formatRand(next.amountHigh)}, typically ${formatRand(next.typicalAmount)}.`;
  const sure = `I am ${next.confidence === 'high' ? 'fairly sure' : next.confidence === 'medium' ? 'moderately sure' : 'not very sure yet'} about this.`;
  if (next.status === 'overdue') {
    return `${rhythm} It has been ${plural(next.daysSinceLast, 'day')} since your last payment, so one is overdue by my count. Go easy on spending until it lands. ${size}`;
  }
  const when =
    next.expectedInDays === 0
      ? 'is due about now'
      : `is likely around ${formatShortDate(next.expectedDate)} (in about ${plural(next.expectedInDays, 'day')})`;
  return `${rhythm} Your next payment ${when}. ${size} ${sure}`;
}

export function describeStability(stability) {
  if (!stability || stability.level === 'unknown') {
    return `After ${MIN_MONTHS_FOR_STABILITY} finished months I can tell you how steady your income is.`;
  }
  const words = { steady: 'fairly steady', variable: 'variable', volatile: 'very irregular' };
  const swing = `Your income is ${words[stability.level]}: it swings about ${round(stability.variation * 100)}% from month to month.`;
  const plan = `A cautious month to plan around is ${formatRand(stability.planningIncome)}.`;
  const fit = stability.targetsFit
    ? 'Your targets fit inside that, which is a solid base.'
    : `Your targets are ${formatRand(round(stability.targetShortfall))} above that. Trim them or build a buffer in good months.`;
  return `${swing} ${plan} ${fit}`;
}

// One-off money (gift, bonus, a big payment): a simple, safe way to split it.
export function getWindfallAdvice(amount, rows) {
  const unpaidFixed = (rows || [])
    .filter((r) => FIXED_KEYS.includes(r.key))
    .reduce((sum, r) => sum + Math.max((Number(r.targetAmount) || 0) - (Number(r.spentAmount) || 0), 0), 0);
  const coverFixed = Math.min(amount, unpaidFixed);
  const afterFixed = amount - coverFixed;
  const toSavings = round(afterFixed * WINDFALL_SAVE_SHARE);
  return { coverFixed, toSavings, buffer: afterFixed - toSavings };
}

// Can the user afford `amount` right now? Optionally against one category.
export function checkAffordability(amount, ctx, now = new Date()) {
  const progress = getCycleProgress(ctx.resetDay, ctx.cycleStartedAt, now);
  const safe = getSafeToSpend(ctx.categoryRows, ctx.totals, progress);
  let verdict = 'no';
  if (amount <= safe.perDay) verdict = 'yes';
  else if (amount <= safe.free) verdict = 'stretch';
  return { verdict, amount, safe };
}

// Short headline insights shown when the bot opens.
export function getGreetingInsights(ctx, now = new Date()) {
  const rows = ctx.categoryRows || [];
  const progress = getCycleProgress(ctx.resetDay, ctx.cycleStartedAt, now);
  const lines = [];

  const forecasts = forecastAll(rows, progress);
  const over = forecasts.filter((f) => f.status === 'over');
  const heading = forecasts.filter((f) => f.status === 'heading-over');
  if (over.length > 0) {
    const worst = over.sort((a, b) => b.projectedOver - a.projectedOver)[0];
    lines.push(`${titleOf(worst.key)} is ${formatRand(worst.projectedOver)} over target.`);
  } else if (heading.length > 0) {
    const first = heading.sort((a, b) => b.projectedOver - a.projectedOver)[0];
    lines.push(`At this pace ${titleOf(first.key)} will pass its target by about ${formatRand(round(first.projectedOver))}.`);
  } else if (rows.length > 0) {
    lines.push('Every category is on track so far.');
  }

  const safe = getSafeToSpend(rows, ctx.totals, progress);
  if (rows.length > 0) {
    lines.push(
      safe.free > 0
        ? `You can safely spend about ${formatRand(round(safe.perDay))} a day for the next ${safe.daysLeft} days.`
        : 'Your money is already spoken for until the reset. Keep spending to the essentials.'
    );
  }

  const pattern = getIncomePattern(ctx.monthlyReports, ctx.transactions, ctx.totals);
  if (pattern.targetsAboveLowest) {
    lines.push(
      `Your targets add up to more than your lowest month (${formatRand(round(pattern.lowest))}). Trim ${formatRand(round(pattern.shortfall))} or build a buffer.`
    );
  }
  const next = predictNextIncome(ctx.monthlyReports, ctx.transactions, now);
  if (next.ok && next.confidence !== 'low') {
    if (next.status === 'overdue') {
      lines.push(`Your next payment is overdue by my count (usually every ${plural(next.typicalGapDays, 'day')}). Go easy on spending.`);
    } else {
      lines.push(
        next.expectedInDays === 0
          ? 'A payment is due about now, based on your usual rhythm.'
          : `Your next payment is likely around ${formatShortDate(next.expectedDate)}.`
      );
    }
  }
  return lines.slice(0, 3);
}

function describeCategoryLine(f) {
  const name = titleOf(f.key);
  if (f.status === 'over') return `${name}: ${formatRand(round(f.spent))} spent, ${formatRand(round(f.projectedOver))} over target.`;
  if (f.status === 'heading-over') {
    const when = f.daysUntilOver != null ? ` You hit the target in about ${f.daysUntilOver} day${f.daysUntilOver === 1 ? '' : 's'}.` : '';
    return `${name}: heading for ${formatRand(round(f.projected))} against a ${formatRand(round(f.target))} target.${when}`;
  }
  if (f.status === 'early') return `${name}: too early to tell, I need a few days of spending.`;
  if (f.status === 'savings') return `${name}: ${formatRand(round(f.spent))} saved of ${formatRand(round(f.target))}.`;
  return `${name}: on track (${formatRand(round(f.spent))} of ${formatRand(round(f.target))}).`;
}

const reply = (intent, text, action = null) => ({ intent, text, action });

// Turns a typed question into an answer built from the user's own numbers.
// Returns { intent, text, action: { label, route } | null }.
export function answerQuestion(question, ctx, now = new Date()) {
  const q = String(question || '').toLowerCase().trim();
  const rows = ctx.categoryRows || [];
  const totals = ctx.totals || { income: 0, expenses: 0, target: 0, balance: 0 };
  const progress = getCycleProgress(ctx.resetDay, ctx.cycleStartedAt, now);
  const amount = parseAmount(question);
  const category = detectCategory(q);
  const has = (re) => re.test(q);

  if (!q) return reply('empty', 'Ask me about your balance, what you can spend, or how to spot a scam.');

  // 1. Windfall: "I got R1500 from a gig"
  if ((has(/\b(got|received|earned|won|made)\b/) && amount) || has(/\b(windfall|bonus)\b/)) {
    if (!amount) return reply('windfall', 'Nice! Tell me the amount, for example "I got R1 500", and I will suggest how to split it.');
    const w = getWindfallAdvice(amount, rows);
    const parts = [];
    if (w.coverFixed > 0) parts.push(`${formatRand(round(w.coverFixed))} for rent and debit orders still due`);
    parts.push(`${formatRand(w.toSavings)} into savings`);
    parts.push(`${formatRand(round(w.buffer))} as your buffer for slow weeks`);
    return reply('windfall', `Great news! With ${formatRand(amount)} I would put aside: ${parts.join(', ')}. Log it with Add Income so your balance stays right.`, {
      label: 'Add income',
      route: '/add-transaction?type=income',
    });
  }

  // 2. Affordability: "Can I afford R300?"
  const asksAfford = has(/\b(afford|enough to|ok to spend|okay to spend)\b/) || has(/\bcan i (spend|buy|pay)\b/);
  if (asksAfford && amount) {
    if (category && category !== SAVINGS_KEY) {
      const row = rows.find((r) => r.key === category);
      if (row) {
        const left = (Number(row.targetAmount) || 0) - (Number(row.spentAmount) || 0);
        const after = left - amount;
        const name = titleOf(category);
        if (after >= 0) {
          return reply('afford', `${formatRand(amount)} fits in ${name}. You would still have ${formatRand(round(after))} left in that category.`);
        }
        return reply('afford', `That would put ${name} ${formatRand(round(-after))} over target. Think twice, or move the money from a category with room.`);
      }
    }
    const a = checkAffordability(amount, ctx, now);
    if (a.verdict === 'yes') {
      return reply('afford', `Yes. ${formatRand(amount)} fits inside today's safe amount of about ${formatRand(round(a.safe.perDay))}.`);
    }
    if (a.verdict === 'stretch') {
      return reply('afford', `You can, but it is a stretch. ${formatRand(amount)} is more than a normal day (${formatRand(round(a.safe.perDay))}) and leaves ${formatRand(round(a.safe.free - amount))} free until ${formatShortDate(progress.nextReset)}.`);
    }
    return reply('afford', `Not safely. After bills still due, you have ${formatRand(round(a.safe.free))} free until ${formatShortDate(progress.nextReset)}.`);
  }

  // 3. Daily allowance (also the answer to "can I afford this?" when no amount is given)
  if (asksAfford || has(/\b(today|per day|daily|allowance|safe to spend)\b/) || has(/how much can i spend/)) {
    const safe = getSafeToSpend(rows, totals, progress);
    if (safe.free <= 0) return reply('safe-to-spend', 'Your money is already spoken for until the reset. Stick to essentials.');
    return reply(
      'safe-to-spend',
      `About ${formatRand(round(safe.perDay))} a day is safe for the next ${safe.daysLeft} days. That is your balance of ${formatRand(round(safe.balance))}${safe.committed > 0 ? ` minus ${formatRand(round(safe.committed))} in bills still due` : ''}.`
    );
  }

  // 3b. Income rhythm: "When is my next payment?" / "Is my income stable?"
  const asksNextIncome =
    has(/\bnext (pay|payment|payday|income|gig|money)\b/) ||
    has(/\b(payday|get paid|getting paid|paid next)\b/) ||
    has(/when (will|do|does) .*(paid|payment|income|money) .*(come|land|arrive|in)\b/);
  const asksStability = has(/\b(steady|stable|stability|volatile|volatility|swing|swings|predictable|consistent)\b/);
  if (asksNextIncome || asksStability) {
    const outlook = getIncomeOutlook(ctx, now);
    if (asksNextIncome) {
      let text = describeNextIncome(outlook.next);
      if (outlook.next.ok) {
        const safe = getSafeToSpend(rows, totals, progress);
        if (safe.free > 0) {
          const allowance = getCautiousAllowance(safe, outlook.next);
          if (allowance.basis === 'payday') {
            text += ` Until then, keep it under about ${formatRand(round(allowance.perDay))} a day (planning for it to land as late as ${plural(allowance.days, 'day')} from now).`;
          }
        }
      }
      return reply('next-income', text, outlook.next.ok ? null : { label: 'Add income', route: '/add-transaction?type=income' });
    }
    return reply('income-stability', describeStability(outlook.stability), { label: 'See breakdown', route: '/breakdown' });
  }

  // 4. Forecast
  if (has(/\b(forecast|predict|projection|on track|run out|by the end)\b/) || has(/end of (the )?month/) || has(/will i (go|run|be)/)) {
    const forecasts = forecastAll(rows, progress);
    if (forecasts.length === 0) return reply('forecast', 'Set up your expenses first and I can forecast your month.');
    const lines = forecasts.map(describeCategoryLine).join('\n');
    return reply('forecast', `Here is where your month is heading (${progress.daysLeft} days to the reset):\n${lines}`);
  }

  // 5. Overspending / where is the money going
  if (has(/\b(over|overspend|overspent|overbudget)\b/) || has(/too much|biggest|where.*(money|going)|spending/)) {
    const forecasts = forecastAll(rows, progress);
    const over = forecasts.filter((f) => f.status === 'over');
    const variable = forecasts.filter((f) => f.key !== SAVINGS_KEY).sort((a, b) => b.spent - a.spent);
    if (over.length > 0) {
      const list = over.map((f) => `${titleOf(f.key)} (${formatRand(round(f.projectedOver))} over)`).join(', ');
      return reply('overspend', `Over target: ${list}. Pause spending there, or move money from a category with room.`);
    }
    if (variable.length > 0 && variable[0].spent > 0) {
      return reply('overspend', `Nothing is over target. Your biggest spend so far is ${titleOf(variable[0].key)} at ${formatRand(round(variable[0].spent))}.`);
    }
    return reply('overspend', 'No spending logged yet this cycle.');
  }

  // 6. Income pattern
  if (has(/\b(income|earn|earning|irregular|lowest|highest|pattern|average)\b/) || has(/how often/)) {
    const p = getIncomePattern(ctx.monthlyReports, ctx.transactions, totals);
    if (p.monthsCounted === 0) {
      return reply('income', `So far this cycle you have earned ${formatRand(round(totals.income))}. After your first full month I can show your highs, lows and patterns.`);
    }
    const gap = p.typicalGapDays != null ? ` Money usually lands every ${p.typicalGapDays} day${p.typicalGapDays === 1 ? '' : 's'}.` : '';
    const warn = p.targetsAboveLowest
      ? ` Your targets total ${formatRand(round(totals.target))}, which is ${formatRand(round(p.shortfall))} more than your lowest month. Plan around the lowest month to stay safe.`
      : ' Your targets fit inside your lowest month, which is a solid base.';
    return reply(
      'income',
      `Over ${p.monthsCounted} finished month${p.monthsCounted === 1 ? '' : 's'}: lowest ${formatRand(round(p.lowest))}, highest ${formatRand(round(p.highest))}, average ${formatRand(round(p.average))}.${gap}${warn}`,
      { label: 'See breakdown', route: '/breakdown' }
    );
  }

  // 7. Savings
  if (has(/\b(save|saved|saving|savings|emergency)\b/)) {
    const row = rows.find((r) => r.key === SAVINGS_KEY);
    const tip = 'Tip: save a small slice of every payment the day it lands, even 5 to 10%.';
    if (!row) return reply('savings', `You have not added Savings as a category yet. ${tip}`);
    const spent = Number(row.spentAmount) || 0;
    const share = totals.income > 0 ? ` That is ${round((spent / totals.income) * 100)}% of what you earned this cycle.` : '';
    return reply('savings', `You have saved ${formatRand(round(spent))} of your ${formatRand(round(row.targetAmount))} goal.${share} ${tip}`, {
      label: 'Add savings',
      route: `/add-transaction?type=expense&category=${SAVINGS_KEY}`,
    });
  }

  // 8. Scams
  if (has(/\b(scam|scams|fraud|phishing|phish|otp|pin|hacked|suspicious|impersonat\w*)\b/) || has(/sim swap|safe account/)) {
    return reply(
      'scam',
      'Three rules that stop most scams:\n1. Your bank will never ask for your PIN, password or OTP, and never asks you to move money to a "safe account".\n2. If a call or SMS makes you rush, hang up and phone the number on the back of your card.\n3. If your phone suddenly loses signal for no reason, call your network and your bank.',
      { label: 'Open scam course', route: '/learning/scam-awareness' }
    );
  }

  // 9. Reset date
  if (has(/\b(reset|new month|days left|days until)\b/) || has(/when does/)) {
    return reply('reset', `Your budget resets in ${progress.daysLeft} day${progress.daysLeft === 1 ? '' : 's'}, on ${formatShortDate(progress.nextReset)}.`);
  }

  // 10. Balance
  if (has(/\b(balance|zak|zaks|buckz)\b/) || has(/how much (do i have|money|is left)|\bleft\b/)) {
    const b = totals.balance;
    if (b < 0) return reply('balance', `You are ${formatRand(round(-b))} in the red this cycle (earned ${formatRand(round(totals.income))}, spent ${formatRand(round(totals.expenses))}).`);
    return reply('balance', `You have ${formatRand(round(b))} left this cycle (earned ${formatRand(round(totals.income))}, spent ${formatRand(round(totals.expenses))}).`);
  }

  // 11. Learning
  if (has(/\b(learn|learning|course|courses|lesson|quiz|streak|badge|badges)\b/)) {
    const streak = ctx.learning ? getCurrentStreak(ctx.learning, now) : 0;
    const badges = ctx.learning && Array.isArray(ctx.learning.badges) ? ctx.learning.badges.length : 0;
    return reply('learning', `Your learning streak is ${streak} day${streak === 1 ? '' : 's'} and you have ${badges} badge${badges === 1 ? '' : 's'}. A short lesson a day keeps the streak alive.`, {
      label: 'Open Learn',
      route: '/learning',
    });
  }

  // 12. Help / greeting
  if (has(/\b(help|hello|hi|hey|howzit|sawubona|molo|what can you)\b/)) {
    return reply('help', 'Howzit! I can tell you what is safe to spend today, forecast your month, predict when your next payment will land, check if you can afford something, read your income pattern, suggest how to split a windfall, and explain how to spot scams.');
  }

  return reply('fallback', 'I did not catch that. Try: "Can I afford R300?", "Will I go over budget?", "How is my income?" or "How do I spot a scam?"');
}
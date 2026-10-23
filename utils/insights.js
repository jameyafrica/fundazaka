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
    return reply('help', 'Howzit! I can tell you what is safe to spend today, forecast your month, check if you can afford something, read your income pattern, suggest how to split a windfall, and explain how to spot scams.');
  }

  return reply('fallback', 'I did not catch that. Try: "Can I afford R300?", "Will I go over budget?", "How is my income?" or "How do I spot a scam?"');
}

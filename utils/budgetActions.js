// Pure budget helpers: no React, no storage. Easy to unit test (Sprint 4).
// Data shapes used everywhere in the app:
//   category:    { key, targetAmount }                  (stored)
//   categoryRow: { key, targetAmount, spentAmount }     (derived by withSpent)
//   transaction: { id, type: 'income' | 'expense', source?, categoryKey?, amount, note, createdAt }
//   report:      one archived month (see buildMonthlyReport)

import { isValidResetDay } from './resetDate.js';
import { COURSES } from '../constants/courses.js';
import { localDateKey } from './learning.js';

export const CATEGORY_KEYS = ['rent', 'transport', 'debit', 'groceries', 'savings'];
export const INCOME_SOURCES = ['work', 'gift', 'other'];
export const MIN_CATEGORIES = 3;
export const MAX_CATEGORIES = 5;

function toMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Always returns the five categories in the designer's display order,
// no matter what order the user picked them in.
export function sortCategories(categories) {
  return [...categories].sort(
    (a, b) => CATEGORY_KEYS.indexOf(a.key) - CATEGORY_KEYS.indexOf(b.key)
  );
}

// Business rules for onboarding and for the monthly reset prompt.
// Returns { ok: true, categories } (cleaned) or { ok: false, error } (message for the user).
export function validateSetup(categories, resetDay) {
  if (!Array.isArray(categories) || categories.length < MIN_CATEGORIES) {
    return { ok: false, error: `Please select at least ${MIN_CATEGORIES} expenses to continue.` };
  }
  if (categories.length > MAX_CATEGORIES) {
    return { ok: false, error: `You can select a maximum of ${MAX_CATEGORIES} expenses.` };
  }
  const keys = categories.map((c) => c.key);
  if (new Set(keys).size !== keys.length || keys.some((k) => !CATEGORY_KEYS.includes(k))) {
    return { ok: false, error: 'One of the selected expenses is not valid.' };
  }
  const cleaned = categories.map((c) => ({ key: c.key, targetAmount: toMoney(c.targetAmount) }));
  if (cleaned.some((c) => c.targetAmount <= 0)) {
    return { ok: false, error: 'Please enter a target amount for every expense.' };
  }
  if (!isValidResetDay(resetDay)) {
    return { ok: false, error: 'Please choose a reset day between 1 and 30.' };
  }
  return { ok: true, categories: sortCategories(cleaned) };
}

// Adds spentAmount to each category (spent is derived from transactions, never stored,
// so it can never drift out of sync with the transaction list).
export function withSpent(categories, transactions) {
  return categories.map((c) => ({
    key: c.key,
    targetAmount: c.targetAmount,
    spentAmount: transactions
      .filter((t) => t.type === 'expense' && t.categoryKey === c.key)
      .reduce((sum, t) => sum + t.amount, 0),
  }));
}

export function sumIncomeBySource(transactions) {
  const result = { work: 0, gift: 0, other: 0 };
  transactions.forEach((t) => {
    if (t.type === 'income' && t.source in result) result[t.source] += t.amount;
  });
  return result;
}

// "Zaks" = total income, "Target" = total of all targets, Balance = income - expenses.
export function getTotals(categories, transactions) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const target = categories.reduce((s, c) => s + c.targetAmount, 0);
  return { income, expenses, target, balance: income - expenses };
}

// Snapshot of the finished month, stored in monthlyReports.
export function buildMonthlyReport(categories, transactions, cycleStartedAt, now = new Date()) {
  const totals = getTotals(categories, transactions);
  return {
    id: makeId(),
    periodStart: cycleStartedAt,
    periodEnd: now.toISOString(),
    totalIncome: totals.income,
    totalExpenses: totals.expenses,
    balance: totals.balance,
    incomeBySource: sumIncomeBySource(transactions),
    categories: withSpent(categories, transactions),
    transactions,
  };
}

// Applies the monthly reset: archive, clear spending, start a new cycle with new targets.
export function applyReset(state, newCategories, newResetDay, now = new Date()) {
  const report = buildMonthlyReport(state.categories, state.transactions, state.cycleStartedAt, now);
  return {
    monthlyReports: [report, ...state.monthlyReports],
    transactions: [],
    categories: newCategories,
    resetDay: newResetDay,
    cycleStartedAt: now.toISOString(),
    resetPending: false,
  };
}

// Realistic South African irregular income for the 1-tap Demo / Guest mode.
// Shows every dashboard state: normal bands, OVER (transport) and the savings exception.
// Builds one finished month for the demo. monthsBack: 1 = last month.
// specs: [type, categoryKeyOrSource, amount, note, dayOfMonth]
function pastMonth(now, monthsBack, specs) {
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
  const transactions = specs.map(([type, key, amount, note, day]) => {
    const createdAt = new Date(start.getFullYear(), start.getMonth(), day, 12).toISOString();
    return type === 'income'
      ? { id: makeId(), type, source: key, amount, note, createdAt }
      : { id: makeId(), type, categoryKey: key, amount, note, createdAt };
  });
  const categories = sortCategories([
    { key: 'rent', targetAmount: 3500 },
    { key: 'transport', targetAmount: 1200 },
    { key: 'debit', targetAmount: 950 },
    { key: 'groceries', targetAmount: 1800 },
    { key: 'savings', targetAmount: 500 },
  ]);
  return buildMonthlyReport(categories, transactions, start.toISOString(), end);
}

export function buildDemoState(now = new Date()) {
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysAgo = (n) => new Date(Math.max(cycleStart.getTime(), now.getTime() - n * 86400000)).toISOString();
  const inc = (source, amount, note, n) => ({
    id: makeId(), type: 'income', source, amount, note, createdAt: daysAgo(n),
  });
  const exp = (categoryKey, amount, note, n) => ({
    id: makeId(), type: 'expense', categoryKey, amount, note, createdAt: daysAgo(n),
  });

  return {
    isGuest: true,
    user: { id: 'guest' },
    displayName: 'Thandi',
    onboardingCompleted: true,
    tourCompleted: true,
    resetPending: false,
    resetDay: 1,
    cycleStartedAt: cycleStart.toISOString(),
    categories: sortCategories([
      { key: 'rent', targetAmount: 3500 },
      { key: 'transport', targetAmount: 1200 },
      { key: 'debit', targetAmount: 950 },
      { key: 'groceries', targetAmount: 1800 },
      { key: 'savings', targetAmount: 500 },
    ]),
    transactions: [
      inc('work', 1850, 'Bolt trips', 20),
      inc('work', 2300, 'Bolt trips', 13),
      inc('work', 900, 'Maths tutoring', 11),
      inc('work', 2600, 'Weekend delivery gig', 7),
      inc('work', 1200, 'Bolt trips', 3),
      inc('gift', 500, 'From Gogo', 9),
      inc('other', 350, 'Sold old phone cover', 5),
      exp('rent', 3500, 'October rent', 19),
      exp('debit', 950, 'Phone contract', 18),
      exp('transport', 700, 'Taxi fare', 12),
      exp('transport', 650, 'Petrol', 4),
      exp('groceries', 520, 'Shoprite', 10),
      exp('groceries', 380, 'Pick n Pay', 2),
      exp('savings', 650, 'Emergency fund', 6),
    ],
    // Two finished months so the Breakdown "Previous Months" toggle has real data to show.
    monthlyReports: [
      pastMonth(now, 1, [
        ['income', 'work', 2100, 'Bolt trips', 4],
        ['income', 'work', 1800, 'Weekend delivery gig', 11],
        ['income', 'work', 1500, 'Maths tutoring', 17],
        ['income', 'work', 1900, 'Bolt trips', 24],
        ['income', 'gift', 400, 'From Gogo', 8],
        ['expense', 'rent', 3500, 'September rent', 1],
        ['expense', 'debit', 950, 'Phone contract', 2],
        ['expense', 'transport', 900, 'Taxi fare', 9],
        ['expense', 'transport', 250, 'Petrol', 20],
        ['expense', 'groceries', 780, 'Shoprite', 6],
        ['expense', 'groceries', 640, 'Pick n Pay', 19],
        ['expense', 'savings', 400, 'Emergency fund', 12],
      ]),
      pastMonth(now, 2, [
        ['income', 'work', 2500, 'Bolt trips', 5],
        ['income', 'work', 1200, 'Weekend delivery gig', 13],
        ['income', 'work', 1700, 'Bolt trips', 22],
        ['income', 'other', 600, 'Sold old speaker', 15],
        ['expense', 'rent', 3500, 'August rent', 1],
        ['expense', 'debit', 950, 'Phone contract', 2],
        ['expense', 'transport', 1100, 'Taxi fare', 10],
        ['expense', 'groceries', 1250, 'Shoprite', 8],
        ['expense', 'savings', 300, 'Emergency fund', 14],
      ]),
    ],
    // A little learning progress so the hub is not empty in the demo.
    learning: {
      streak: 3,
      bestStreak: 3,
      lastActiveDate: localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12)),
      completedLessons: { [COURSES[0].id]: COURSES[0].lessons.slice(0, 2).map((l) => l.id) },
      quizScores: {},
      badges: ['first-lesson', 'streak-3'],
    },
  };
}
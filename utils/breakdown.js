// Pure helpers for the Breakdown report. Works for the current month and for
// archived monthlyReports, because both are just { categories, transactions }.
import { getTotals, sumIncomeBySource, withSpent } from './budgetActions.js';
import { SAVINGS_KEY } from './budgetMath.js';

export const TABS = ['all', 'income', 'expenses'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function summarise(categories, transactions) {
  const totals = getTotals(categories, transactions);
  const rows = withSpent(categories, transactions).map((row) => ({
    ...row,
    isOver: row.key !== SAVINGS_KEY && row.spentAmount > row.targetAmount,
    overAmount: Math.max(row.spentAmount - row.targetAmount, 0),
    ratio: row.targetAmount > 0 ? Math.min(row.spentAmount / row.targetAmount, 1) : 0,
  }));
  return {
    totalIncome: totals.income,
    totalExpenses: totals.expenses,
    balance: totals.balance,
    incomeBySource: sumIncomeBySource(transactions),
    categoryRows: rows,
  };
}

// tab: 'all' | 'income' | 'expenses'. Newest first.
export function filterTransactions(transactions, tab) {
  const wanted = tab === 'income' ? 'income' : tab === 'expenses' ? 'expense' : null;
  return transactions
    .filter((t) => !wanted || t.type === wanted)
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

// Share of the total as a 0..1 fraction. Safe when the total is 0.
export function share(part, total) {
  return total > 0 ? Math.min(part / total, 1) : 0;
}

export function formatShortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// "15 Sep – 14 Oct 2026". Falls back gracefully if a date is missing.
export function formatPeriod(startIso, endIso) {
  const start = formatShortDate(startIso);
  const end = formatShortDate(endIso);
  const year = new Date(endIso).getFullYear();
  if (!start && !end) return 'Earlier month';
  if (!start) return `${end} ${year}`;
  if (!end) return start;
  return `${start} \u2013 ${end} ${year}`;
}

import { buildDemoState } from '../utils/budgetActions.js';
import { filterTransactions, formatPeriod, share, summarise } from '../utils/breakdown.js';

const demo = buildDemoState(new Date(2026, 9, 22, 12));

describe('breakdown summary', () => {
  const summary = summarise(demo.categories, demo.transactions);
  const byKey = Object.fromEntries(summary.categoryRows.map((r) => [r.key, r]));

  test('totals match the demo data', () => {
    expect(summary.totalIncome).toBe(9700);
    expect(summary.totalExpenses).toBe(7350);
    expect(summary.balance).toBe(2350);
    expect(summary.incomeBySource).toEqual({ work: 8850, gift: 500, other: 350 });
  });

  test('flags over-budget categories and reports the overspend', () => {
    expect(byKey.transport.isOver).toBe(true);
    expect(byKey.transport.overAmount).toBe(150);
    expect(byKey.rent.isOver).toBe(false);
  });

  test('savings is never flagged as over', () => {
    expect(byKey.savings.isOver).toBe(false);
  });

  test('an empty month does not crash', () => {
    const empty = summarise(demo.categories, []);
    expect(empty.totalIncome).toBe(0);
    expect(empty.categoryRows[0].ratio).toBe(0);
  });

  test('archived months use the same summary', () => {
    const report = demo.monthlyReports[0];
    const archived = summarise(report.categories, report.transactions);
    expect(archived.totalIncome).toBe(report.totalIncome);
    expect(archived.totalExpenses).toBe(report.totalExpenses);
  });
});

describe('breakdown filters', () => {
  test('All, Income and Expenses split the transactions', () => {
    expect(filterTransactions(demo.transactions, 'all')).toHaveLength(14);
    expect(filterTransactions(demo.transactions, 'income')).toHaveLength(7);
    expect(filterTransactions(demo.transactions, 'expenses')).toHaveLength(7);
  });

  test('newest comes first', () => {
    const list = filterTransactions(demo.transactions, 'all');
    expect(list[0].createdAt >= list[list.length - 1].createdAt).toBe(true);
  });

  test('does not change the original array', () => {
    const copy = [...demo.transactions];
    filterTransactions(demo.transactions, 'all');
    expect(demo.transactions).toEqual(copy);
  });
});

describe('breakdown helpers', () => {
  test('share is safe for a zero total', () => {
    expect(share(50, 0)).toBe(0);
    expect(share(50, 200)).toBe(0.25);
  });

  test('formatPeriod writes a readable range', () => {
    expect(formatPeriod('2026-09-15T08:00:00.000Z', '2026-10-15T08:00:00.000Z')).toBe('15 Sep \u2013 15 Oct 2026');
  });
});

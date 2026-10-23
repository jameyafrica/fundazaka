import { applyReset, buildDemoState, getTotals } from '../utils/budgetActions.js';

describe('monthly reset and archiving', () => {
  const now = new Date(2026, 9, 22, 12);
  const demo = buildDemoState(now);

  test('demo data totals are right', () => {
    const totals = getTotals(demo.categories, demo.transactions);
    expect(totals.income).toBe(9700);
    expect(totals.expenses).toBe(7350);
    expect(totals.balance).toBe(2350);
  });

  test('reset archives the month and clears current spending', () => {
    const next = applyReset(demo, demo.categories, 15, new Date(2026, 10, 15, 9));
    expect(next.transactions).toHaveLength(0);
    expect(next.monthlyReports).toHaveLength(demo.monthlyReports.length + 1);
    expect(next.monthlyReports[0].balance).toBe(2350);
    expect(next.monthlyReports[0].incomeBySource.work).toBe(8850);
    expect(next.monthlyReports[0].transactions).toHaveLength(14);
  });

  test('reset applies the reviewed targets and day, and clears the pending flag', () => {
    const newTargets = demo.categories.map((c) => ({ ...c, targetAmount: c.targetAmount + 100 }));
    const next = applyReset(demo, newTargets, 20, new Date(2026, 10, 15, 9));
    expect(next.resetDay).toBe(20);
    expect(next.categories[0].targetAmount).toBe(demo.categories[0].targetAmount + 100);
    expect(next.resetPending).toBe(false);
  });

  test('the demo ships two archived months for the Previous Months view', () => {
    expect(demo.monthlyReports).toHaveLength(2);
    expect(demo.monthlyReports[0].periodStart > demo.monthlyReports[1].periodStart).toBe(true);
  });
});

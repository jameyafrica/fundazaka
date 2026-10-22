import assert from 'node:assert/strict';
import { validateSetup, withSpent, getTotals, applyReset, buildDemoState, sortCategories } from '../utils/budgetActions.js';
import { getCategoryVisual } from '../utils/budgetMath.js';
import { isResetDue } from '../utils/resetDate.js';

const cat = (key, t = 1000) => ({ key, targetAmount: t });

// onboarding limits
assert.equal(validateSetup([cat('rent'), cat('debit')], 1).ok, false);
assert.match(validateSetup([cat('rent'), cat('debit')], 1).error, /at least 3/);
assert.equal(validateSetup([cat('rent'), cat('debit'), cat('savings')], 1).ok, true);
assert.equal(validateSetup(['rent','transport','debit','groceries','savings'].map((k) => cat(k)), 30).ok, true);
assert.equal(validateSetup([cat('rent'), cat('debit'), cat('savings'), cat('rent')], 1).ok, false);
assert.equal(validateSetup([cat('rent'), cat('debit'), cat('savings', 0)], 1).ok, false);
assert.equal(validateSetup([cat('rent'), cat('debit'), cat('savings')], 31).ok, false);
assert.deepEqual(validateSetup([cat('savings'), cat('rent'), cat('debit')], 5).categories.map((c) => c.key), ['rent', 'debit', 'savings']);

// demo data covers every state
const now = new Date(2026, 9, 22, 12);
const demo = buildDemoState(now);
const rows = withSpent(demo.categories, demo.transactions);
const vis = Object.fromEntries(rows.map((r) => [r.key, getCategoryVisual(r.key, r.spentAmount, r.targetAmount)]));
assert.equal(vis.transport.variant, 'over');
assert.equal(vis.transport.overAmount, 150);
assert.equal(vis.savings.variant, 'savings');
assert.equal(vis.rent.opacity, 0.8);
assert.equal(vis.groceries.opacity, 0.45);
const totals = getTotals(demo.categories, demo.transactions);
assert.equal(totals.income, 9700);
assert.equal(totals.expenses, 7350);
assert.equal(totals.balance, 2350);
assert.equal(isResetDue(demo.resetDay, demo.cycleStartedAt, now), false);

// demo on the 1st: no transaction dated before the cycle start
const first = buildDemoState(new Date(2026, 10, 1, 8));
assert.ok(first.transactions.every((t) => new Date(t.createdAt) >= new Date(first.cycleStartedAt)));

// reset archives and clears
const next = applyReset(demo, demo.categories, 15, new Date(2026, 10, 15, 9));
assert.equal(next.transactions.length, 0);
assert.equal(next.monthlyReports.length, demo.monthlyReports.length + 1); // demo ships 2 past months
assert.equal(next.monthlyReports[0].balance, 2350);
assert.equal(next.monthlyReports[0].incomeBySource.work, 8850);
assert.equal(next.monthlyReports[0].transactions.length, 14);
assert.equal(next.resetDay, 15);
assert.equal(isResetDue(15, next.cycleStartedAt, new Date(2026, 10, 20)), false);
assert.equal(isResetDue(15, next.cycleStartedAt, new Date(2026, 11, 15, 8)), true);
console.log('All action checks passed.');

// routing
import { getNextRoute } from '../utils/routing.js';
const done = { user: { id: 'u' }, onboardingCompleted: true, tourCompleted: true, resetPending: false };
assert.equal(getNextRoute({ ...done, user: null }), '/(auth)/login');
assert.equal(getNextRoute({ ...done, onboardingCompleted: false }), '/(auth)/onboarding-expenses');
assert.equal(getNextRoute({ ...done, tourCompleted: false }), '/(auth)/onboarding-tour');
assert.equal(getNextRoute({ ...done, resetPending: true }), '/(auth)/onboarding-expenses?mode=reset');
assert.equal(getNextRoute(done), '/(tabs)/home');
console.log('All routing checks passed.');

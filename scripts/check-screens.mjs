import assert from 'node:assert/strict';
import {
  initialCalc, inputDigit, inputDot, setOperator, equals, toggleSign, percent, backspace,
  formatDisplay, getExpression,
} from '../utils/calculator.js';
import { summarise, filterTransactions, share, formatPeriod } from '../utils/breakdown.js';
import { buildDemoState } from '../utils/budgetActions.js';

const press = (state, keys) =>
  keys.split(' ').reduce((s, k) => {
    if (/^\d$/.test(k)) return inputDigit(s, k);
    if (k === '.') return inputDot(s);
    if (k === '=') return equals(s);
    if (k === 'neg') return toggleSign(s);
    if (k === '%') return percent(s);
    if (k === 'bk') return backspace(s);
    return setOperator(s, k);
  }, state);

// basics
assert.equal(press(initialCalc, '1 5 0 0 + 2 5 0 =').display, '1750');
assert.equal(press(initialCalc, '1 2 * 3 =').display, '36');
assert.equal(press(initialCalc, '9 / 2 =').display, '4.5');
// floating point noise
assert.equal(press(initialCalc, '0 . 1 + 0 . 2 =').display, '0.3');
// chaining evaluates left to right as a phone calculator does
assert.equal(press(initialCalc, '2 + 3 * 4 =').display, '20');
// changing operator does not calculate
assert.equal(press(initialCalc, '5 + * 3 =').display, '15');
// divide by zero shows Error and recovers on next digit
const err = press(initialCalc, '5 / 0 =');
assert.equal(err.display, 'Error');
assert.equal(inputDigit(err, '7').display, '7');
// decimals, leading zeros, sign, percent, backspace
assert.equal(press(initialCalc, '0 0 7').display, '7');
assert.equal(press(initialCalc, '. 5').display, '0.5');
assert.equal(press(initialCalc, '1 . 2 . 3').display, '1.23');
assert.equal(press(initialCalc, '5 neg').display, '-5');
assert.equal(press(initialCalc, '5 neg neg').display, '5');
assert.equal(press(initialCalc, '2 5 0 %').display, '2.5');
assert.equal(press(initialCalc, '1 2 3 bk').display, '12');
assert.equal(press(initialCalc, '1 bk').display, '0');
// digit limit and display formatting
assert.equal(press(initialCalc, '1 2 3 4 5 6 7 8 9 0 1 2 3 4').display, '123456789012');
assert.equal(formatDisplay('1234567.5'), '1\u00A0234\u00A0567.5');
assert.equal(formatDisplay('-1500'), '-1\u00A0500');
assert.equal(formatDisplay('12.'), '12.');
assert.equal(getExpression(press(initialCalc, '1 5 0 0 *')), '1\u00A0500 \u00D7');
// result that is too big is an Error, not garbage
assert.equal(press(initialCalc, '9 9 9 9 9 9 9 9 9 9 9 9 * 9 9 =').display, 'Error');

// breakdown on the demo data
const demo = buildDemoState(new Date(2026, 9, 22, 12));
const s = summarise(demo.categories, demo.transactions);
assert.equal(s.totalIncome, 9700);
assert.equal(s.totalExpenses, 7350);
assert.equal(s.balance, 2350);
assert.deepEqual(s.incomeBySource, { work: 8850, gift: 500, other: 350 });
const byKey = Object.fromEntries(s.categoryRows.map((r) => [r.key, r]));
assert.equal(byKey.transport.isOver, true);
assert.equal(byKey.transport.overAmount, 150);
assert.equal(byKey.savings.isOver, false); // savings exception
assert.equal(byKey.rent.isOver, false);
assert.equal(filterTransactions(demo.transactions, 'income').length, 7);
assert.equal(filterTransactions(demo.transactions, 'expenses').length, 7);
assert.equal(filterTransactions(demo.transactions, 'all').length, 14);
const sorted = filterTransactions(demo.transactions, 'all');
assert.ok(sorted[0].createdAt >= sorted[sorted.length - 1].createdAt);
assert.equal(share(50, 0), 0);
assert.equal(share(50, 200), 0.25);
assert.equal(formatPeriod('2026-09-15T08:00:00.000Z', '2026-10-15T08:00:00.000Z'), '15 Sep \u2013 15 Oct 2026');
// an empty month does not crash
const empty = summarise(demo.categories, []);
assert.equal(empty.totalIncome, 0);
assert.equal(empty.categoryRows[0].ratio, 0);

console.log('All calculator and breakdown checks passed.');

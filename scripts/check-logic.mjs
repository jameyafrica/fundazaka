// Quick manual check of the pure logic. Run: node scripts/check-logic.mjs
// Jest tests replace this in Sprint 4.
import assert from 'node:assert/strict';
import {
  getEffectiveResetDay,
  getLatestScheduledReset,
  isResetDue,
  isValidResetDay,
} from '../utils/resetDate.js';
import { getCategoryVisual, getProgressRatio } from '../utils/budgetMath.js';

const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

// Reset day rules
assert.equal(isValidResetDay(31), false);
assert.equal(isValidResetDay(0), false);
assert.equal(isValidResetDay(30), true);
assert.equal(getEffectiveResetDay(30, 2026, 1), 28); // Feb 2026
assert.equal(getEffectiveResetDay(29, 2026, 1), 28);
assert.equal(getEffectiveResetDay(30, 2028, 1), 29); // Feb 2028 is a leap year
assert.equal(getEffectiveResetDay(29, 2028, 1), 29);
assert.equal(getEffectiveResetDay(28, 2026, 1), 28);
assert.equal(getEffectiveResetDay(1, 2026, 1), 1);
assert.equal(getEffectiveResetDay(30, 2026, 3), 30); // April has 30 days

// Latest scheduled reset
assert.deepEqual(ymd(getLatestScheduledReset(30, new Date(2026, 2, 1, 9))), [2026, 2, 28]);
assert.deepEqual(ymd(getLatestScheduledReset(15, new Date(2027, 0, 10, 9))), [2026, 12, 15]);
assert.deepEqual(ymd(getLatestScheduledReset(15, new Date(2026, 10, 15, 0, 0))), [2026, 11, 15]);

// Due / missed / not due
const started = new Date(2026, 9, 22, 14, 0); // 22 Oct 2026
assert.equal(isResetDue(15, started, new Date(2026, 10, 14, 23, 59)), false);
assert.equal(isResetDue(15, started, new Date(2026, 10, 15, 8, 0)), true);
assert.equal(isResetDue(15, started, new Date(2026, 10, 20, 8, 0)), true); // missed
assert.equal(isResetDue(15, new Date(2026, 10, 20, 8, 0), new Date(2026, 10, 21)), false); // applied
assert.equal(isResetDue(15, new Date(2026, 9, 15, 10, 0), new Date(2026, 9, 15, 18, 0)), false); // set up on reset day
assert.equal(isResetDue(15, null, new Date()), false);

// Progress and opacity
assert.equal(getProgressRatio(0, 0), 0);
assert.equal(getProgressRatio(50, 0), Infinity);
const v = (key, s, t) => getCategoryVisual(key, s, t);
assert.equal(v('rent', 0, 1000).opacity, 0.41);
assert.equal(v('rent', 0, 1000).tint, '#000000');
assert.equal(v('rent', 200, 1000).opacity, 0.41);
assert.equal(v('rent', 201, 1000).opacity, 0.3);
assert.equal(v('rent', 500, 1000).opacity, 0.45);
assert.equal(v('rent', 700, 1000).opacity, 0.6);
assert.equal(v('rent', 1000, 1000).opacity, 0.8);
assert.equal(v('rent', 1000, 1000).isOver, false);
assert.equal(v('rent', 1000.01, 1000).isOver, true);
assert.equal(v('rent', 1250, 1000).overAmount, 250);
assert.equal(v('rent', 1250, 1000).opacity, 0.6);
assert.equal(v('rent', 50, 0).isOver, true);
assert.equal(v('savings', 5000, 1000).isOver, false);
assert.equal(v('savings', 5000, 1000).opacity, 0.8);
assert.equal(v('savings', 0, 1000).opacity, 0.8);

console.log('All logic checks passed.');
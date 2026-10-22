import {
  getEffectiveResetDay,
  getLatestScheduledReset,
  isResetDue,
  isValidResetDay,
} from '../utils/resetDate.js';

const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

describe('reset day validation', () => {
  test('accepts 1 to 30 only', () => {
    expect(isValidResetDay(1)).toBe(true);
    expect(isValidResetDay(30)).toBe(true);
    expect(isValidResetDay(0)).toBe(false);
    expect(isValidResetDay(31)).toBe(false);
    expect(isValidResetDay(1.5)).toBe(false);
  });
});

describe('February fallback rule', () => {
  test('29 and 30 become 28 in a normal February', () => {
    expect(getEffectiveResetDay(30, 2026, 1)).toBe(28);
    expect(getEffectiveResetDay(29, 2026, 1)).toBe(28);
  });

  test('29 and 30 become 29 in a leap year February', () => {
    expect(getEffectiveResetDay(30, 2028, 1)).toBe(29);
    expect(getEffectiveResetDay(29, 2028, 1)).toBe(29);
  });

  test('earlier days are untouched in February', () => {
    expect(getEffectiveResetDay(28, 2026, 1)).toBe(28);
    expect(getEffectiveResetDay(1, 2026, 1)).toBe(1);
  });

  test('30 stays 30 in a 30-day month', () => {
    expect(getEffectiveResetDay(30, 2026, 3)).toBe(30);
  });
});

describe('latest scheduled reset', () => {
  test('on 1 March, a day-30 reset last happened on 28 February', () => {
    expect(ymd(getLatestScheduledReset(30, new Date(2026, 2, 1, 9)))).toEqual([2026, 2, 28]);
  });

  test('rolls back across the new year', () => {
    expect(ymd(getLatestScheduledReset(15, new Date(2027, 0, 10, 9)))).toEqual([2026, 12, 15]);
  });

  test('exactly on the reset day counts as that day', () => {
    expect(ymd(getLatestScheduledReset(15, new Date(2026, 10, 15, 0, 0)))).toEqual([2026, 11, 15]);
  });
});

describe('pending reset', () => {
  const started = new Date(2026, 9, 22, 14, 0);

  test('not due the day before', () => {
    expect(isResetDue(15, started, new Date(2026, 10, 14, 23, 59))).toBe(false);
  });

  test('due on the reset day', () => {
    expect(isResetDue(15, started, new Date(2026, 10, 15, 8, 0))).toBe(true);
  });

  test('a missed reset stays due until applied', () => {
    expect(isResetDue(15, started, new Date(2026, 10, 20, 8, 0))).toBe(true);
  });

  test('not due again once the cycle was restarted after the reset day', () => {
    expect(isResetDue(15, new Date(2026, 10, 20, 8, 0), new Date(2026, 10, 21))).toBe(false);
  });

  test('not due when set up on the reset day itself', () => {
    expect(isResetDue(15, new Date(2026, 9, 15, 10, 0), new Date(2026, 9, 15, 18, 0))).toBe(false);
  });

  test('is never due without a cycle start', () => {
    expect(isResetDue(15, null, new Date())).toBe(false);
  });
});

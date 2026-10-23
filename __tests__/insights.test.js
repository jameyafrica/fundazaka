import { buildDemoState, getTotals, withSpent } from '../utils/budgetActions.js';
import {
  answerQuestion,
  checkAffordability,
  detectCategory,
  forecastCategory,
  getCycleProgress,
  getGreetingInsights,
  getIncomePattern,
  getNextReset,
  getSafeToSpend,
  getWindfallAdvice,
  parseAmount,
} from '../utils/insights.js';

const now = new Date(2026, 9, 22, 12); // Thu 22 Oct 2026, demo cycle started 1 Oct
const demo = buildDemoState(now);

const makeCtx = (overrides = {}) => {
  const base = { ...demo, ...overrides };
  return {
    ...base,
    categoryRows: withSpent(base.categories, base.transactions),
    totals: getTotals(base.categories, base.transactions),
  };
};
const ctx = makeCtx();
const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

describe('parseAmount', () => {
  test('reads Rand amounts in the ways people type them', () => {
    expect(parseAmount('Can I afford R300?')).toBe(300);
    expect(parseAmount('I got r1 500 today')).toBe(1500);
    expect(parseAmount('1500,50')).toBe(1500.5);
    expect(parseAmount('spend 250 on petrol')).toBe(250);
  });

  test('returns null when there is no amount', () => {
    expect(parseAmount('how am I doing')).toBeNull();
    expect(parseAmount('')).toBeNull();
  });
});

describe('detectCategory', () => {
  test('finds the category from everyday words', () => {
    expect(detectCategory('a taxi to town')).toBe('transport');
    expect(detectCategory('shoprite trip')).toBe('groceries');
    expect(detectCategory('hello')).toBeNull();
  });
});

describe('next reset date and cycle progress', () => {
  test('next reset is the following month on the chosen day', () => {
    expect(ymd(getNextReset(1, now))).toEqual([2026, 11, 1]);
    expect(ymd(getNextReset(25, now))).toEqual([2026, 10, 25]);
  });

  test('day 29 or 30 falls back to the last day of February', () => {
    expect(ymd(getNextReset(30, new Date(2027, 0, 31)))).toEqual([2027, 2, 28]);
    expect(ymd(getNextReset(29, new Date(2028, 0, 31)))).toEqual([2028, 2, 29]);
  });

  test('counts elapsed days and days left in the demo cycle', () => {
    const p = getCycleProgress(1, demo.cycleStartedAt, now);
    expect(p.elapsed).toBe(22);
    expect(p.daysLeft).toBe(10);
    expect(p.cycleLength).toBe(31);
  });

  test('copes with a missing or invalid cycle start', () => {
    const p = getCycleProgress(1, null, now);
    expect(p.elapsed).toBe(22);
    expect(getCycleProgress(null, 'nonsense', now).daysLeft).toBeGreaterThan(0);
  });
});

describe('pace forecast', () => {
  const progress = getCycleProgress(1, demo.cycleStartedAt, now);
  const row = (key, spentAmount, targetAmount) => ({ key, spentAmount, targetAmount });

  test('a category already past target is over', () => {
    const f = forecastCategory(row('transport', 1350, 1200), progress);
    expect(f.status).toBe('over');
    expect(f.projectedOver).toBe(150);
  });

  test('variable spending is extrapolated and flagged before it goes over', () => {
    const f = forecastCategory(row('groceries', 1500, 1800), progress);
    expect(f.status).toBe('heading-over');
    expect(f.projected).toBeCloseTo((1500 / 22) * 31, 5);
    expect(f.daysUntilOver).toBe(5);
  });

  test('a slow pace stays on track', () => {
    expect(forecastCategory(row('groceries', 900, 1800), progress).status).toBe('on-track');
  });

  test('fixed bills are never extrapolated day by day', () => {
    expect(forecastCategory(row('rent', 3500, 3500), progress).status).toBe('on-track');
    const unpaid = forecastCategory(row('rent', 0, 3500), progress);
    expect(unpaid.projected).toBe(3500);
    expect(unpaid.status).toBe('on-track');
  });

  test('too early in the cycle to judge variable spending', () => {
    const early = getCycleProgress(1, new Date(2026, 9, 1).toISOString(), new Date(2026, 9, 2, 12));
    expect(forecastCategory(row('transport', 500, 1200), early).status).toBe('early');
  });

  test('savings never counts as over, even far past target', () => {
    const f = forecastCategory(row('savings', 5000, 500), progress);
    expect(f.status).toBe('savings');
    expect(f.projectedOver).toBe(0);
  });
});

describe('safe to spend', () => {
  const progress = getCycleProgress(1, demo.cycleStartedAt, now);

  test('demo data: balance spread over the days left', () => {
    const safe = getSafeToSpend(ctx.categoryRows, ctx.totals, progress);
    expect(safe.balance).toBe(2350);
    expect(safe.committed).toBe(0);
    expect(safe.perDay).toBeCloseTo(235, 5);
  });

  test('unpaid rent and debit orders are set aside first', () => {
    const rows = [
      { key: 'rent', targetAmount: 3500, spentAmount: 0 },
      { key: 'debit', targetAmount: 950, spentAmount: 0 },
      { key: 'groceries', targetAmount: 1800, spentAmount: 0 },
    ];
    const safe = getSafeToSpend(rows, { balance: 5000 }, progress);
    expect(safe.committed).toBe(4450);
    expect(safe.free).toBe(550);
    expect(safe.perDay).toBeCloseTo(55, 5);
  });

  test('never negative when the money is already spoken for', () => {
    const rows = [{ key: 'rent', targetAmount: 3500, spentAmount: 0 }];
    const safe = getSafeToSpend(rows, { balance: 1000 }, progress);
    expect(safe.free).toBe(0);
    expect(safe.perDay).toBe(0);
  });

  test('affordability verdicts: yes, stretch, no', () => {
    expect(checkAffordability(200, ctx, now).verdict).toBe('yes');
    expect(checkAffordability(300, ctx, now).verdict).toBe('stretch');
    expect(checkAffordability(5000, ctx, now).verdict).toBe('no');
  });
});

describe('income pattern', () => {
  test('reads highs, lows and average from finished months', () => {
    const p = getIncomePattern(demo.monthlyReports, demo.transactions, ctx.totals);
    expect(p.monthsCounted).toBe(2);
    expect(p.lowest).toBe(6000);
    expect(p.highest).toBe(7700);
    expect(p.average).toBe(6850);
    expect(p.typicalGapDays).toBeGreaterThan(0);
  });

  test('warns when targets are higher than the lowest month', () => {
    const p = getIncomePattern(demo.monthlyReports, demo.transactions, ctx.totals);
    expect(p.targetsAboveLowest).toBe(true);
    expect(p.shortfall).toBe(1950);
  });

  test('no history yet is handled', () => {
    const p = getIncomePattern([], [], { target: 1000 });
    expect(p.monthsCounted).toBe(0);
    expect(p.targetsAboveLowest).toBe(false);
  });
});

describe('windfall advice', () => {
  test('covers unpaid bills first, then 20% to savings, rest as buffer', () => {
    const rows = [{ key: 'rent', targetAmount: 3500, spentAmount: 3000 }];
    const w = getWindfallAdvice(1500, rows);
    expect(w.coverFixed).toBe(500);
    expect(w.toSavings).toBe(200);
    expect(w.buffer).toBe(800);
  });
});

describe('greeting insights', () => {
  test('flags the over-budget category and gives a daily amount', () => {
    const lines = getGreetingInsights(ctx, now);
    expect(lines[0]).toMatch(/Transport is R150 over target/);
    expect(lines.some((l) => /safely spend about R235 a day/.test(l))).toBe(true);
    expect(lines.length).toBeLessThanOrEqual(3);
  });

  test('an empty new user does not crash', () => {
    const empty = { categoryRows: [], totals: { income: 0, expenses: 0, target: 0, balance: 0 }, transactions: [], monthlyReports: [] };
    expect(getGreetingInsights(empty, now)).toEqual([]);
  });
});

describe('answerQuestion intents', () => {
  const intentOf = (q) => answerQuestion(q, ctx, now).intent;

  test('routes common questions to the right answer', () => {
    expect(intentOf('Can I afford R300 today?')).toBe('afford');
    expect(intentOf('How much can I spend today?')).toBe('safe-to-spend');
    expect(intentOf('Will I go over budget?')).toBe('forecast');
    expect(intentOf('Where is my money going?')).toBe('overspend');
    expect(intentOf('How is my income?')).toBe('income');
    expect(intentOf('How much have I saved?')).toBe('savings');
    expect(intentOf('How do I spot a scam?')).toBe('scam');
    expect(intentOf('When does my budget reset?')).toBe('reset');
    expect(intentOf('What is my balance?')).toBe('balance');
    expect(intentOf('I got R1500 from a gig')).toBe('windfall');
    expect(intentOf('How is my streak?')).toBe('learning');
    expect(intentOf('hello')).toBe('help');
    expect(intentOf('asdfgh')).toBe('fallback');
  });

  test('uses the real numbers', () => {
    expect(answerQuestion('What is my balance?', ctx, now).text).toMatch(/R2\u00A0350 left/);
    expect(answerQuestion('When does my budget reset?', ctx, now).text).toMatch(/10 days, on Sun 1 Nov/);
  });

  test('category affordability warns when a category would go over', () => {
    const ok = answerQuestion('Can I afford R400 on groceries?', ctx, now);
    expect(ok.text).toMatch(/fits in Groceries/);
    const bad = answerQuestion('Can I afford R500 on transport?', ctx, now);
    expect(bad.text).toMatch(/over target/);
  });

  test('without an amount, an affordability question gets the daily allowance', () => {
    expect(answerQuestion('Can I afford this?', ctx, now).intent).toBe('safe-to-spend');
  });

  test('scam answer links to the scam course', () => {
    expect(answerQuestion('is this sms a scam', ctx, now).action.route).toBe('/learning/scam-awareness');
  });

  test('savings answer never says over target', () => {
    const text = answerQuestion('how much have I saved', ctx, now).text;
    expect(text).toMatch(/saved R650 of your R500 goal/);
    expect(text).not.toMatch(/over/i);
  });

  test('a user with no data still gets a sensible answer', () => {
    const empty = { categoryRows: [], totals: { income: 0, expenses: 0, target: 0, balance: 0 }, transactions: [], monthlyReports: [] };
    expect(answerQuestion('Will I go over budget?', empty, now).intent).toBe('forecast');
    expect(answerQuestion('what is my balance', empty, now).text).toMatch(/R0 left/);
    expect(answerQuestion('', empty, now).intent).toBe('empty');
  });
});

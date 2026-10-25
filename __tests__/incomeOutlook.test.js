import { buildDemoState } from '../utils/budgetActions.js';
import {
  answerQuestion,
  describeNextIncome,
  describeStability,
  getCautiousAllowance,
  getGreetingInsights,
  getIncomeOutlook,
  getIncomeStability,
  getPaydays,
  predictNextIncome,
} from '../utils/insights.js';

const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];
const day = (month, date) => new Date(2026, month - 1, date, 12).toISOString();
const income = (month, date, amount, source = 'work') => ({
  id: `i-${month}-${date}-${amount}`,
  type: 'income',
  source,
  amount,
  note: '',
  createdAt: day(month, date),
});
const expense = (month, date, amount) => ({
  id: `e-${month}-${date}`,
  type: 'expense',
  categoryKey: 'rent',
  amount,
  note: '',
  createdAt: day(month, date),
});

// Paid every 7 days: 1, 8, 15 and 22 October.
const weekly = [income(10, 1, 1000), income(10, 8, 1200), income(10, 15, 800), income(10, 22, 1000)];
const at = (month, date) => new Date(2026, month - 1, date, 12);

describe('getPaydays', () => {
  test('lists income days oldest first and ignores expenses', () => {
    const paydays = getPaydays([], [weekly[2], expense(10, 3, 500), weekly[0]]);
    expect(paydays.map((p) => p.amount)).toEqual([1000, 800]);
    expect(ymd(paydays[0].date)).toEqual([2026, 10, 1]);
  });

  test('several payments on one day count as one pay day', () => {
    const paydays = getPaydays([], [income(10, 5, 300), income(10, 5, 200), income(10, 9, 400), income(10, 14, 100)]);
    expect(paydays).toHaveLength(3);
    expect(paydays[0].amount).toBe(500);
  });

  test('work income sets the rhythm; gifts are ignored once there are enough work pay days', () => {
    const txs = [...weekly.slice(0, 3), income(10, 4, 400, 'gift'), income(10, 11, 250, 'other')];
    expect(getPaydays([], txs)).toHaveLength(3);
  });

  test('falls back to all income when there is too little work income', () => {
    const txs = [income(10, 1, 900), income(10, 6, 400, 'gift'), income(10, 12, 250, 'other')];
    expect(getPaydays([], txs)).toHaveLength(3);
  });

  test('reads finished months too, and skips bad dates and bad amounts', () => {
    const reports = [{ transactions: [income(9, 3, 700), income(9, 17, 900)] }, null, {}];
    const bad = [{ type: 'income', source: 'work', amount: 500, createdAt: 'not a date' }, income(10, 2, -50), income(10, 2, 0)];
    expect(getPaydays(reports, [...bad, income(10, 1, 600)])).toHaveLength(3);
    expect(getPaydays(undefined, undefined)).toEqual([]);
  });
});

describe('predictNextIncome', () => {
  test('not enough pay days yet', () => {
    const next = predictNextIncome([], [weekly[0], weekly[1]], at(10, 25));
    expect(next.ok).toBe(false);
    expect(next.paydays).toBe(2);
    expect(predictNextIncome(undefined, undefined, at(10, 25)).ok).toBe(false);
  });

  test('learns a steady weekly rhythm and predicts the next date', () => {
    const next = predictNextIncome([], weekly, at(10, 25));
    expect(next.ok).toBe(true);
    expect(next.typicalGapDays).toBe(7);
    expect(next.spreadDays).toBe(1); // perfectly regular still gets a 1 day window
    expect(next.daysSinceLast).toBe(3);
    expect(next.expectedInDays).toBe(4);
    expect(next.earliestInDays).toBe(3);
    expect(next.latestInDays).toBe(5);
    expect(ymd(next.expectedDate)).toEqual([2026, 10, 29]);
    expect(next.status).toBe('upcoming');
  });

  test('typical payment size is the middle of recent payments', () => {
    const next = predictNextIncome([], weekly, at(10, 25));
    expect(next.typicalAmount).toBe(1000);
    expect(next.amountLow).toBe(950);
    expect(next.amountHigh).toBe(1050);
  });

  test('status moves from upcoming to due-soon to overdue as days pass', () => {
    expect(predictNextIncome([], weekly, at(10, 25)).status).toBe('upcoming');
    const soon = predictNextIncome([], weekly, at(10, 28));
    expect(soon.status).toBe('due-soon');
    expect(soon.expectedInDays).toBe(1);
    const late = predictNextIncome([], weekly, at(11, 2));
    expect(late.status).toBe('overdue');
    expect(late.expectedInDays).toBe(0);
    expect(late.latestInDays).toBe(0);
  });

  test('payment due today is due-soon with 0 days to wait', () => {
    const today = predictNextIncome([], weekly, at(10, 29));
    expect(today.expectedInDays).toBe(0);
    expect(today.status).toBe('due-soon');
  });

  test('uneven gaps widen the window and lower confidence', () => {
    const uneven = [income(10, 1, 500), income(10, 3, 500), income(10, 17, 500), income(10, 19, 500)]; // gaps 2, 14, 2
    const next = predictNextIncome([], uneven, at(10, 20));
    expect(next.typicalGapDays).toBe(2); // median, so one long gap does not drag it up
    expect(next.spreadDays).toBeGreaterThan(3);
    expect(next.confidence).toBe('low');
  });

  test('confidence grows with regular gaps and more pay days', () => {
    expect(predictNextIncome([], weekly.slice(0, 3), at(10, 25)).confidence).toBe('low'); // 3 pay days
    expect(predictNextIncome([], weekly, at(10, 25)).confidence).toBe('medium'); // 4 pay days
    const six = [...weekly, income(9, 24, 900), income(9, 17, 900)];
    expect(predictNextIncome([], six, at(10, 25)).confidence).toBe('high');
  });

  test('uses pay days from archived months', () => {
    const reports = [{ totalIncome: 2000, transactions: [income(9, 10, 900), income(9, 24, 1100)] }];
    const next = predictNextIncome(reports, [income(10, 8, 1000)], at(10, 10));
    expect(next.ok).toBe(true);
    expect(next.typicalGapDays).toBe(14);
  });
});

describe('getIncomeStability', () => {
  test('unknown until two finished months', () => {
    expect(getIncomeStability([], 3000).level).toBe('unknown');
    expect(getIncomeStability([{ totalIncome: 5000 }], 3000).level).toBe('unknown');
    expect(getIncomeStability(undefined, 3000).targetsFit).toBeNull();
  });

  test('a steady income plans around nearly the average', () => {
    const s = getIncomeStability([{ totalIncome: 5000 }, { totalIncome: 5100 }, { totalIncome: 4900 }], 4000);
    expect(s.level).toBe('steady');
    expect(s.average).toBe(5000);
    expect(s.stdDev).toBe(100);
    expect(s.planningIncome).toBe(4900);
    expect(s.targetsFit).toBe(true);
    expect(s.targetShortfall).toBe(0);
  });

  test('the demo months are variable and the targets do not fit a cautious month', () => {
    const s = getIncomeStability([{ totalIncome: 7700 }, { totalIncome: 6000 }], 7950);
    expect(s.level).toBe('variable');
    expect(s.average).toBe(6850);
    expect(s.planningIncome).toBe(5648);
    expect(s.targetsFit).toBe(false);
    expect(s.targetShortfall).toBe(2302);
  });

  test('a very irregular income never plans around a negative amount', () => {
    const s = getIncomeStability([{ totalIncome: 500 }, { totalIncome: 4500 }], 1000);
    expect(s.level).toBe('volatile');
    expect(s.planningIncome).toBe(0);
    expect(s.targetShortfall).toBe(1000);
  });

  test('empty or zero months are ignored', () => {
    expect(getIncomeStability([{ totalIncome: 0 }, { totalIncome: 4000 }, null, {}], 100).level).toBe('unknown');
  });
});

describe('getCautiousAllowance', () => {
  const safe = { free: 1200, daysLeft: 10 };

  test('spreads free money until the latest likely payday', () => {
    const a = getCautiousAllowance(safe, { ok: true, status: 'upcoming', latestInDays: 4 });
    expect(a).toEqual({ days: 4, perDay: 300, basis: 'payday' });
  });

  test('a payment due today still plans for at least one day', () => {
    const a = getCautiousAllowance(safe, { ok: true, status: 'due-soon', latestInDays: 0 });
    expect(a.days).toBe(1);
    expect(a.perDay).toBe(1200);
  });

  test('falls back to the reset date when there is no rhythm or the payment is overdue', () => {
    expect(getCautiousAllowance(safe, { ok: false })).toEqual({ days: 10, perDay: 120, basis: 'reset' });
    expect(getCautiousAllowance(safe, { ok: true, status: 'overdue', latestInDays: 0 }).basis).toBe('reset');
    expect(getCautiousAllowance(safe, undefined).days).toBe(10);
  });

  test('no free money means nothing to spend', () => {
    expect(getCautiousAllowance({ free: 0, daysLeft: 5 }, { ok: true, status: 'upcoming', latestInDays: 3 }).perDay).toBe(0);
  });
});

describe('describe helpers', () => {
  test('next income wording covers every state', () => {
    expect(describeNextIncome({ ok: false, paydays: 1 })).toMatch(/at least 3 pay days.*1 pay day so far/);
    expect(describeNextIncome({ ok: false })).toMatch(/0 pay days so far/);
    const upcoming = describeNextIncome(predictNextIncome([], weekly, at(10, 25)));
    expect(upcoming).toMatch(/every 7 days, give or take 1 day\./);
    expect(upcoming).toMatch(/likely around Thu 29 Oct \(in about 4 days\)/);
    expect(upcoming).toMatch(/R950 to R1\u00A0050, typically R1\u00A0000/);
    expect(upcoming).toMatch(/moderately sure/);
    expect(describeNextIncome(predictNextIncome([], weekly, at(10, 29)))).toMatch(/due about now/);
    expect(describeNextIncome(predictNextIncome([], weekly, at(11, 2)))).toMatch(/overdue.*Go easy on spending/);
  });

  test('stability wording covers every state', () => {
    expect(describeStability(getIncomeStability([], 0))).toMatch(/After 2 finished months/);
    const text = describeStability(getIncomeStability([{ totalIncome: 7700 }, { totalIncome: 6000 }], 7950));
    expect(text).toMatch(/variable.*18%/);
    expect(text).toMatch(/R5\u00A0648/);
    expect(text).toMatch(/R2\u00A0302 above that/);
    expect(describeStability(getIncomeStability([{ totalIncome: 5000 }, { totalIncome: 5100 }], 1000))).toMatch(/solid base/);
  });
});

describe('bot answers about income timing', () => {
  const rows = [{ key: 'rent', targetAmount: 3000, spentAmount: 2000 }]; // R1 000 of rent still to pay
  const makeCtx = (overrides = {}) => ({
    categoryRows: rows,
    totals: { income: 4000, expenses: 2000, target: 3000, balance: 3000 },
    transactions: weekly,
    monthlyReports: [],
    resetDay: 1,
    cycleStartedAt: new Date(2026, 9, 1).toISOString(),
    learning: null,
    ...overrides,
  });
  const now = at(10, 25);
  const intentOf = (q, ctx = makeCtx()) => answerQuestion(q, ctx, now).intent;

  test('routes payment-timing questions', () => {
    expect(intentOf('When is my next payment?')).toBe('next-income');
    expect(intentOf('when will I get paid')).toBe('next-income');
    expect(intentOf('Is payday close?')).toBe('next-income');
    expect(intentOf('when will my money come in')).toBe('next-income');
  });

  test('routes stability questions', () => {
    expect(intentOf('How steady is my income?')).toBe('income-stability');
    expect(intentOf('is my income stable')).toBe('income-stability');
  });

  test('existing intents are not stolen', () => {
    expect(intentOf('How is my income?')).toBe('income');
    expect(intentOf('When does my budget reset?')).toBe('reset');
    expect(intentOf('Will I go over budget?')).toBe('forecast');
    expect(intentOf('How much can I spend today?')).toBe('safe-to-spend');
    expect(intentOf('I got R1500 from a gig')).toBe('windfall');
  });

  test('next payment answer gives the date and a cautious daily amount', () => {
    const a = answerQuestion('When is my next payment?', makeCtx(), now);
    expect(a.text).toMatch(/Thu 29 Oct/);
    // R3 000 balance minus R1 000 rent still due = R2 000 free, over 5 days (latest likely payday) = R400
    expect(a.text).toMatch(/under about R400 a day/);
    expect(a.text).toMatch(/as late as 5 days/);
    expect(a.action).toBeNull();
  });

  test('an overdue payment does not promise a payday allowance', () => {
    const a = answerQuestion('When is my next payment?', makeCtx(), at(11, 2));
    expect(a.text).toMatch(/overdue/);
    expect(a.text).not.toMatch(/a day/);
  });

  test('with too little history the bot asks the user to keep logging and offers Add income', () => {
    const a = answerQuestion('When is my next payment?', makeCtx({ transactions: [weekly[0]] }), now);
    expect(a.intent).toBe('next-income');
    expect(a.text).toMatch(/at least 3 pay days/);
    expect(a.action.route).toBe('/add-transaction?type=income');
  });

  test('stability answer links to the breakdown', () => {
    const ctx = makeCtx({ monthlyReports: [{ totalIncome: 7700 }, { totalIncome: 6000 }], totals: { income: 0, expenses: 0, target: 7950, balance: 0 } });
    const a = answerQuestion('how steady is my income', ctx, now);
    expect(a.text).toMatch(/variable/);
    expect(a.text).toMatch(/R2\u00A0302 above/);
    expect(a.action.route).toBe('/breakdown');
  });

  test('a brand new user does not crash', () => {
    const empty = { categoryRows: [], totals: { income: 0, expenses: 0, target: 0, balance: 0 }, transactions: [], monthlyReports: [] };
    expect(answerQuestion('When is my next payment?', empty, now).text).toMatch(/at least 3 pay days/);
    expect(answerQuestion('is my income stable', empty, now).text).toMatch(/After 2 finished months/);
  });

  test('the help answer mentions payment prediction', () => {
    expect(answerQuestion('hello', makeCtx(), now).text).toMatch(/next payment/);
  });
});

describe('greeting insight about the next payment', () => {
  const base = {
    categoryRows: [{ key: 'rent', targetAmount: 3000, spentAmount: 3000 }],
    totals: { income: 4000, expenses: 3000, target: 3000, balance: 1000 },
    transactions: [...weekly, income(10, 24, 700), income(10, 26, 700)].slice(0, 4),
    monthlyReports: [],
    resetDay: 1,
    cycleStartedAt: new Date(2026, 9, 1).toISOString(),
  };

  test('shows the likely payment date when the rhythm is trusted', () => {
    const six = [...weekly, income(9, 24, 900), income(9, 17, 900)];
    const lines = getGreetingInsights({ ...base, transactions: six }, at(10, 25));
    expect(lines.some((l) => /next payment is likely around Thu 29 Oct/.test(l))).toBe(true);
    expect(lines.length).toBeLessThanOrEqual(3);
  });

  test('warns when a payment is overdue', () => {
    const six = [...weekly, income(9, 24, 900), income(9, 17, 900)];
    const lines = getGreetingInsights({ ...base, transactions: six }, at(11, 2));
    expect(lines.some((l) => /overdue by my count/.test(l))).toBe(true);
  });

  test('stays quiet when the prediction is a low-confidence guess', () => {
    const lines = getGreetingInsights({ ...base, transactions: weekly.slice(0, 3) }, at(10, 25));
    expect(lines.some((l) => /next payment/.test(l))).toBe(false);
  });
});

describe('with the demo data', () => {
  const now = new Date(2026, 9, 22, 12);
  const demo = buildDemoState(now);

  test('the demo user has enough history for a prediction and a stability reading', () => {
    const outlook = getIncomeOutlook({ ...demo, totals: { target: 7950 } }, now);
    expect(outlook.next.ok).toBe(true);
    expect(outlook.next.typicalGapDays).toBeGreaterThan(0);
    expect(outlook.next.typicalAmount).toBeGreaterThan(0);
    expect(outlook.stability.level).not.toBe('unknown');
    expect(outlook.stability.months).toBe(2);
  });
});
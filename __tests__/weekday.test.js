import { MIN_ENTRIES_FOR_PATTERN, describePattern, getWeekdayPatterns } from '../utils/weekday';
import { answerQuestion } from '../utils/insights';

// 2026-10-02 is a Friday.
const friday = (week) => new Date(2026, 9, 2 + week * 7, 12).toISOString();
const monday = (week) => new Date(2026, 9, 5 + week * 7, 12).toISOString();
const exp = (categoryKey, amount, createdAt) => ({ id: `${categoryKey}${amount}${createdAt}`, type: 'expense', categoryKey, amount, createdAt });

describe('weekday pattern', () => {
  test('finds the weekday most of the spending happens on', () => {
    const txs = [
      exp('transport', 200, friday(0)),
      exp('transport', 220, friday(1)),
      exp('transport', 180, friday(2)),
      exp('transport', 210, friday(3)),
      exp('transport', 50, monday(0)),
      exp('transport', 60, monday(1)),
    ];
    const [p] = getWeekdayPatterns(txs, []);
    expect(p.key).toBe('transport');
    expect(p.dayName).toBe('Fridays');
    expect(p.percent).toBe(Math.round((810 / 920) * 100));
    expect(describePattern(p)).toBe(`${p.percent}% of your transport spend happens on Fridays.`);
  });

  test('says nothing until there are enough entries', () => {
    const few = Array.from({ length: MIN_ENTRIES_FOR_PATTERN - 1 }, (_, i) => exp('transport', 100, friday(i)));
    expect(getWeekdayPatterns(few, [])).toEqual([]);
  });

  test('says nothing when spending is spread across the week', () => {
    const spread = [0, 1, 2, 3, 4, 5, 6].map((d) => exp('groceries', 100, new Date(2026, 9, 4 + d, 12).toISOString()));
    expect(getWeekdayPatterns(spread, [])).toEqual([]);
  });

  test('skips rent, debit orders and savings', () => {
    const txs = ['rent', 'debit', 'savings'].flatMap((k) => Array.from({ length: 6 }, (_, i) => exp(k, 100, friday(i))));
    expect(getWeekdayPatterns(txs, [])).toEqual([]);
  });

  test('uses archived months too and ignores broken entries', () => {
    const reports = [{ transactions: Array.from({ length: 5 }, (_, i) => exp('groceries', 300, friday(i))) }];
    const noisy = [null, { type: 'expense', categoryKey: 'groceries', amount: 100, createdAt: 'nope' }];
    const [p] = getWeekdayPatterns(noisy, reports);
    expect(p.key).toBe('groceries');
    expect(p.percent).toBe(100);
  });

  test('Zak answers a weekday question from the same data', () => {
    const ctx = {
      categoryRows: [],
      totals: { income: 0, expenses: 0, target: 0, balance: 0 },
      transactions: Array.from({ length: 5 }, (_, i) => exp('transport', 200, friday(i))),
      monthlyReports: [],
      resetDay: 1,
      cycleStartedAt: new Date(2026, 9, 1).toISOString(),
    };
    const answer = answerQuestion('Which day do I spend most on transport?', ctx, new Date(2026, 9, 25));
    expect(answer.intent).toBe('weekday');
    expect(answer.text).toMatch(/Fridays/);
    const none = answerQuestion('Which day do I spend most?', { ...ctx, transactions: [] }, new Date(2026, 9, 25));
    expect(none.intent).toBe('weekday');
    expect(none.text).toMatch(/do not see a clear day/);
  });
});

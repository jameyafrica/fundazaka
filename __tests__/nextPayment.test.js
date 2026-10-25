import { buildDemoState } from '../utils/budgetActions.js';
import { getNextPaymentCard } from '../utils/dashboard.js';

const day = (month, date) => new Date(2026, month - 1, date, 12).toISOString();
const income = (month, date, amount, source = 'work') => ({
  id: `i-${month}-${date}`,
  type: 'income',
  source,
  amount,
  note: '',
  createdAt: day(month, date),
});
const at = (month, date) => new Date(2026, month - 1, date, 12);

// Paid every 7 days: 1, 8, 15 and 22 October.
const weekly = [income(10, 1, 1000), income(10, 8, 1200), income(10, 15, 800), income(10, 22, 1000)];

describe('dashboard next payment card', () => {
  test('a new user is told how many pay days Zak still needs', () => {
    expect(getNextPaymentCard([], [], at(10, 25))).toEqual({ kind: 'learning', count: 3, seen: 0 });
    expect(getNextPaymentCard(undefined, [weekly[0], weekly[1]], at(10, 25))).toEqual({ kind: 'learning', count: 3, seen: 2 });
  });

  test('shows the likely date, amounts and confidence before the window', () => {
    expect(getNextPaymentCard([], weekly, at(10, 25))).toEqual({
      kind: 'upcoming',
      date: 'Thu 29 Oct',
      days: 4,
      low: 950,
      high: 1050,
      typical: 1000,
      confidence: 'medium',
    });
  });

  test('says due about now on the expected day', () => {
    const card = getNextPaymentCard([], weekly, at(10, 29));
    expect(card.kind).toBe('today');
    expect(card.date).toBeUndefined();
  });

  test('a payment later than the usual window is overdue', () => {
    const card = getNextPaymentCard([], weekly, at(11, 2));
    expect(card.kind).toBe('overdue');
    expect(card.typical).toBe(1000);
  });

  test('the days count down as the date gets closer', () => {
    const card = getNextPaymentCard([], weekly, at(10, 26));
    expect(card.kind).toBe('upcoming');
    expect(card.date).toBe('Thu 29 Oct');
    expect(card.days).toBe(3);
  });

  test('the demo user sees a real forecast on the dashboard', () => {
    const now = new Date(2026, 9, 22, 12);
    const demo = buildDemoState(now);
    const card = getNextPaymentCard(demo.monthlyReports, demo.transactions, now);
    expect(card.kind).toBe('upcoming');
    expect(card.date).toMatch(/^\w{3} \d{1,2} \w{3}$/);
    expect(card.low).toBeGreaterThan(0);
    expect(card.high).toBeGreaterThan(card.low);
  });
});
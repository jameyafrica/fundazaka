import { ROUND_STEP, suggestTargets } from '../utils/targetSuggestion';

const cats = [
  { key: 'rent', targetAmount: 3500 },
  { key: 'transport', targetAmount: 1200 },
  { key: 'debit', targetAmount: 950 },
  { key: 'groceries', targetAmount: 1800 },
  { key: 'savings', targetAmount: 500 },
];
const total = (list) => list.reduce((s, c) => s + c.targetAmount, 0);
const by = (list) => Object.fromEntries(list.map((c) => [c.key, c.targetAmount]));

describe('suggested targets', () => {
  test('does nothing when targets already fit', () => {
    const result = suggestTargets(cats, 9000);
    expect(result.changed).toBe(false);
    expect(result.categories).toEqual(cats);
  });

  test('does nothing without a usable income', () => {
    expect(suggestTargets(cats, 0).changed).toBe(false);
    expect(suggestTargets(cats, NaN).changed).toBe(false);
    expect(suggestTargets([], 5000).changed).toBe(false);
  });

  test('keeps rent and debit orders and trims the flexible categories to fit', () => {
    const result = suggestTargets(cats, 6500);
    const out = by(result.categories);
    expect(result.changed).toBe(true);
    expect(out.rent).toBe(3500);
    expect(out.debit).toBe(950);
    expect(out.transport).toBeLessThan(1200);
    expect(out.groceries).toBeLessThan(1800);
    expect(out.savings).toBeLessThan(500);
    expect(result.total).toBe(total(result.categories));
    expect(result.total).toBeLessThanOrEqual(6500);
  });

  test('trims flexible categories in proportion to each other', () => {
    const out = by(suggestTargets(cats, 6500).categories);
    // groceries started 1.5x transport, so it stays about 1.5x after the cut
    expect(out.groceries / out.transport).toBeGreaterThan(1.3);
    expect(out.groceries / out.transport).toBeLessThan(1.7);
  });

  test('suggested amounts are whole multiples of R10', () => {
    suggestTargets(cats, 6543).categories.forEach((c) => expect(c.targetAmount % ROUND_STEP).toBe(0));
  });

  test('when fixed bills alone exceed the income everything is scaled evenly', () => {
    const result = suggestTargets(cats, 4000);
    expect(result.changed).toBe(true);
    expect(by(result.categories).rent).toBeLessThan(3500);
    expect(result.total).toBeLessThanOrEqual(4000);
  });

  test('never returns a total above the cautious income, across many incomes', () => {
    for (let income = 200; income < 8000; income += 137) {
      const result = suggestTargets(cats, income);
      if (result.changed) expect(result.total).toBeLessThanOrEqual(income);
    }
  });

  test('an income too small for any sensible target returns the originals', () => {
    const result = suggestTargets(cats, 20);
    expect(result.changed).toBe(false);
    expect(result.categories).toEqual(cats);
  });

  test('does not change the list it was given', () => {
    const copy = JSON.parse(JSON.stringify(cats));
    suggestTargets(cats, 6500);
    expect(cats).toEqual(copy);
  });
});

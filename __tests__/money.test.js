import {
  MAX_AMOUNT, addMoney, cleanStoredAmount, cleanText, coerceAmount, compareMoney,
  parseMoney, subtractMoney, sumMoney,
} from '../utils/money.js';
import { getCategoryVisual } from '../utils/budgetMath.js';
import { getTotals, validateSetup, withSpent } from '../utils/budgetActions.js';

describe('parseMoney accepts normal amounts', () => {
  test('plain, spaced, comma and R-prefixed amounts', () => {
    expect(parseMoney('1500').amount).toBe(1500);
    expect(parseMoney('1 500').amount).toBe(1500);
    expect(parseMoney('1\u00A0500').amount).toBe(1500);
    expect(parseMoney('1500,50').amount).toBe(1500.5);
    expect(parseMoney('R1500.5').amount).toBe(1500.5);
    expect(parseMoney('0.05').amount).toBe(0.05);
    expect(parseMoney('.5').amount).toBe(0.5);
    expect(parseMoney('1500.').amount).toBe(1500);
  });

  test('returns whole cents', () => {
    expect(parseMoney('19.99').cents).toBe(1999);
    expect(parseMoney('0.1').cents).toBe(10);
  });
});

describe('parseMoney rejects what the audit found', () => {
  const bad = ['1e308', '12e3', '0x10', 'Infinity', '-5', '+5', '1,5,5', '1.234', 'abc', '', '   ', 'R', '1e2', '٣٤', '5 R'];
  bad.forEach((input) => {
    test(`rejects "${input}"`, () => {
      expect(parseMoney(input).ok).toBe(false);
    });
  });

  test('rejects zero', () => {
    expect(parseMoney('0').ok).toBe(false);
    expect(parseMoney('0.00').ok).toBe(false);
  });

  test('caps the amount and says so', () => {
    expect(parseMoney('9999999.99').ok).toBe(true);
    const tooBig = parseMoney('10000000');
    expect(tooBig.ok).toBe(false);
    expect(tooBig.error).toMatch(/too big/);
    expect(parseMoney('99999999999999999999').ok).toBe(false);
    expect(MAX_AMOUNT).toBe(9999999.99);
  });

  test('null and undefined do not crash', () => {
    expect(parseMoney(null).ok).toBe(false);
    expect(parseMoney(undefined).ok).toBe(false);
  });
});

describe('numbers passed in by code are validated the same way', () => {
  test('rejects Infinity, NaN, negatives, huge and over-precise numbers', () => {
    [Infinity, -Infinity, NaN, -1, 0, 1e308, 1e21, 0.123, 12.345].forEach((n) => {
      expect(coerceAmount(n).ok).toBe(false);
    });
  });

  test('tolerates float noise from earlier arithmetic and cleans it to 2 decimals', () => {
    expect(coerceAmount(0.1 + 0.2).amount).toBe(0.3);
  });

  test('accepts clean 2-decimal numbers', () => {
    expect(coerceAmount(1500.5).amount).toBe(1500.5);
    expect(coerceAmount(0.3).amount).toBe(0.3);
  });

  test('cleanStoredAmount returns null for untrustworthy stored values', () => {
    expect(cleanStoredAmount(null)).toBeNull();
    expect(cleanStoredAmount('5')).toBeNull();
    expect(cleanStoredAmount(Infinity)).toBeNull();
    expect(cleanStoredAmount(250)).toBe(250);
  });
});

describe('integer cents arithmetic (audit finding 7)', () => {
  test('0.1 + 0.2 equals 0.3', () => {
    expect(addMoney(0.1, 0.2)).toBe(0.3);
    expect(compareMoney(addMoney(0.1, 0.2), 0.3)).toBe(0);
  });

  test('1000 x 10% is exactly 100', () => {
    expect(sumMoney([100, 100, 100, 100, 100, 100, 100, 100, 100, 100])).toBe(1000);
    expect(subtractMoney(0.3, 0.1)).toBe(0.2);
  });

  test('three R0.10 expenses against a R0.30 target are NOT over budget', () => {
    const categories = [{ key: 'rent', targetAmount: 0.3 }];
    const tx = [0.1, 0.1, 0.1].map((amount, i) => ({ id: String(i), type: 'expense', categoryKey: 'rent', amount, note: '', createdAt: '2026-10-01T10:00:00.000Z' }));
    const row = withSpent(categories, tx)[0];
    expect(row.spentAmount).toBe(0.3);
    const visual = getCategoryVisual('rent', row.spentAmount, row.targetAmount);
    expect(visual.isOver).toBe(false);
    expect(visual.variant).not.toBe('over');
  });

  test('even a float-noisy spent value does not flip a category to OVER at the boundary', () => {
    expect(getCategoryVisual('rent', 0.1 + 0.2, 0.3).isOver).toBe(false);
  });

  test('one real cent over is still OVER and reports the exact overspend', () => {
    const visual = getCategoryVisual('transport', 1200.01, 1200);
    expect(visual.isOver).toBe(true);
    expect(visual.overAmount).toBe(0.01);
  });

  test('totals add up in cents', () => {
    const tx = [0.1, 0.2].map((amount, i) => ({ id: String(i), type: 'income', source: 'work', amount, note: '', createdAt: '2026-10-01T10:00:00.000Z' }));
    const totals = getTotals([], tx);
    expect(totals.income).toBe(0.3);
    expect(totals.balance).toBe(0.3);
  });
});

describe('validateSetup now parses targets strictly', () => {
  const three = (target) => ['rent', 'debit', 'savings'].map((key) => ({ key, targetAmount: target }));

  test('accepts typed text targets', () => {
    const result = validateSetup(three('1 500,50'), 1);
    expect(result.ok).toBe(true);
    expect(result.categories[0].targetAmount).toBe(1500.5);
  });

  test('rejects exponent, hex and infinite targets', () => {
    ['1e308', '12e3', '0x10', 'Infinity', '9'.repeat(400)].forEach((t) => {
      expect(validateSetup(three(t), 1).ok).toBe(false);
    });
  });

  test('says when a target is too big', () => {
    expect(validateSetup(three('99999999'), 1).error).toMatch(/too big/);
  });
});

describe('cleanText', () => {
  test('trims, caps length and strips control characters', () => {
    expect(cleanText('  hello\u0000\nworld  ')).toBe('hello  world');
    expect(cleanText('x'.repeat(200))).toHaveLength(60);
    expect(cleanText(undefined)).toBe('');
    expect(cleanText({ a: 1 })).toBe('');
  });
});
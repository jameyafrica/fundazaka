import { WINDFALL_MULTIPLE, buildWindfallPlan, describeWindfallPlan, getTypicalIncome, isWindfall } from '../utils/windfall';

const inc = (amount, day) => ({ type: 'income', source: 'work', amount, createdAt: new Date(2026, 9, day, 12).toISOString() });
const history = [inc(1000, 1), inc(1200, 5), inc(900, 9), inc(1100, 13)];

describe('windfall detection', () => {
  test('needs at least three past payments before it judges anything', () => {
    expect(getTypicalIncome([], [inc(1000, 1), inc(1200, 5)])).toBeNull();
    expect(isWindfall(50000, [], [inc(1000, 1), inc(1200, 5)])).toBe(false);
  });

  test('the usual payment is the median of recent ones', () => {
    expect(getTypicalIncome([], history)).toBe(1050);
  });

  test('a payment well above usual is a windfall, a normal one is not', () => {
    expect(isWindfall(2500, [], history)).toBe(true);
    expect(isWindfall(1100, [], history)).toBe(false);
    expect(isWindfall(1050 * WINDFALL_MULTIPLE, [], history)).toBe(true);
    expect(isWindfall(1050 * WINDFALL_MULTIPLE - 1, [], history)).toBe(false);
  });

  test('archived months count towards what is usual', () => {
    const reports = [{ transactions: [inc(2000, 1), inc(2200, 2), inc(1800, 3)] }];
    expect(isWindfall(2500, reports, [])).toBe(false);
    expect(isWindfall(3500, reports, [])).toBe(true);
  });

  test('one big payment does not distort the usual size', () => {
    expect(getTypicalIncome([], [...history, inc(9000, 14)])).toBe(1100);
  });

  test('ignores expenses and broken entries', () => {
    const noisy = [...history, { type: 'expense', amount: 99999, createdAt: new Date().toISOString() }, null, { type: 'income', amount: -5 }];
    expect(getTypicalIncome([], noisy)).toBe(1050);
  });
});

describe('windfall plan', () => {
  const rows = [
    { key: 'rent', targetAmount: 3500, spentAmount: 0 },
    { key: 'savings', targetAmount: 500, spentAmount: 0 },
  ];

  test('covers bills still due first, then saves 20% of the rest', () => {
    const plan = buildWindfallPlan(5000, rows);
    expect(plan).toEqual({ coverFixed: 3500, toSavings: 300, buffer: 1200 });
  });

  test('the three parts always add up to the amount', () => {
    [2500, 777, 12345].forEach((amount) => {
      const plan = buildWindfallPlan(amount, rows);
      expect(plan.coverFixed + plan.toSavings + plan.buffer).toBe(Math.round(amount));
    });
  });

  test('with no bills due it is savings and buffer only', () => {
    const paid = [{ key: 'rent', targetAmount: 3500, spentAmount: 3500 }];
    expect(buildWindfallPlan(2500, paid)).toEqual({ coverFixed: 0, toSavings: 500, buffer: 2000 });
  });

  test('the message reads naturally', () => {
    expect(describeWindfallPlan(2500, { coverFixed: 500, toSavings: 400, buffer: 1600 })).toBe(
      'R2\u00A0500 logged. Zak suggests R500 to bills, R400 to savings, R1\u00A0600 buffer.'
    );
    expect(describeWindfallPlan(2500, { coverFixed: 0, toSavings: 500, buffer: 2000 })).not.toMatch(/to bills/);
  });
});

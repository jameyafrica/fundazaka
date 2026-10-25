import { buildDemoState } from '../utils/budgetActions';
import { MAX_PROOF_MONTHS, buildIncomeProof, formatProofText } from '../utils/incomeProof';

const demo = buildDemoState(new Date(2026, 9, 22, 12));
const report = (i, income, work = income) => ({
  id: `r${i}`,
  periodStart: new Date(2025, i, 1).toISOString(),
  periodEnd: new Date(2025, i + 1, 1).toISOString(),
  totalIncome: income,
  incomeBySource: { work, gift: income - work, other: 0 },
});

describe('proof of income', () => {
  test('no finished months means no summary', () => {
    expect(buildIncomeProof([]).ok).toBe(false);
    expect(buildIncomeProof(undefined).ok).toBe(false);
    expect(formatProofText(buildIncomeProof([]))).toBe('');
  });

  test('works out average, lowest and highest from the archived months', () => {
    const proof = buildIncomeProof(demo.monthlyReports, new Date(2026, 9, 22));
    const incomes = demo.monthlyReports.map((r) => r.totalIncome);
    expect(proof.ok).toBe(true);
    expect(proof.count).toBe(2);
    expect(proof.lowest).toBe(Math.min(...incomes));
    expect(proof.highest).toBe(Math.max(...incomes));
    expect(proof.average).toBe(Math.round((incomes[0] + incomes[1]) / 2));
  });

  test('lists months oldest first no matter the input order', () => {
    const proof = buildIncomeProof([report(3, 3000), report(1, 1000), report(2, 2000)]);
    expect(proof.months.map((m) => m.income)).toEqual([1000, 2000, 3000]);
  });

  test('a zero month counts as the lowest month', () => {
    const proof = buildIncomeProof([report(1, 0), report(2, 2000)]);
    expect(proof.lowest).toBe(0);
    expect(proof.average).toBe(1000);
  });

  test('keeps only the last 12 months', () => {
    const many = Array.from({ length: 20 }, (_, i) => report(i, 1000 + i));
    const proof = buildIncomeProof(many);
    expect(proof.count).toBe(MAX_PROOF_MONTHS);
    expect(proof.months[proof.months.length - 1].income).toBe(1019);
  });

  test('share from work is worked out from the income sources', () => {
    const proof = buildIncomeProof([report(1, 1000, 750), report(2, 1000, 750)]);
    expect(proof.workShare).toBeCloseTo(0.75);
  });

  test('skips reports with a broken date instead of crashing', () => {
    const proof = buildIncomeProof([{ id: 'x', periodEnd: 'nonsense', totalIncome: 5 }, report(1, 1000)]);
    expect(proof.count).toBe(1);
  });

  test('the shared text has the figures and says it is self-declared, not bank verified', () => {
    const proof = buildIncomeProof(demo.monthlyReports, new Date(2026, 9, 22));
    const text = formatProofText(proof, 'Thandi');
    expect(text).toMatch(/Income summary for Thandi/);
    expect(text).toMatch(/Average per month/);
    expect(text).toMatch(/Lowest month/);
    expect(text).toMatch(/Highest month/);
    expect(text).toMatch(/Self-declared/);
    expect(text).toMatch(/not been verified by a bank/);
  });
});

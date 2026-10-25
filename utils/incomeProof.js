// Proof-of-income summary built from the user's archived months.
// Irregular earners often cannot show a payslip; this gives them a clear, self-declared record
// they can share. It is NOT verified by a bank or by Fundazaka, and the text says so.
import { formatRand } from './format.js';
import { formatPeriod } from './breakdown.js';

export const MAX_PROOF_MONTHS = 12;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// reports = monthlyReports (any order). Returns oldest-to-newest months, limited to the last 12.
export function buildIncomeProof(reports, now = new Date()) {
  const usable = (reports || [])
    .filter((r) => r && Number.isFinite(new Date(r.periodEnd).getTime()))
    .sort((a, b) => new Date(a.periodEnd) - new Date(b.periodEnd))
    .slice(-MAX_PROOF_MONTHS);

  const months = usable.map((r) => ({
    id: r.id,
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    label: formatPeriod(r.periodStart, r.periodEnd),
    income: num(r.totalIncome),
    work: num(r.incomeBySource && r.incomeBySource.work),
  }));

  if (months.length === 0) {
    return { ok: false, count: 0, months: [], generatedAt: now.toISOString() };
  }

  const incomes = months.map((m) => m.income);
  const total = incomes.reduce((s, n) => s + n, 0);
  const workTotal = months.reduce((s, m) => s + m.work, 0);
  return {
    ok: true,
    count: months.length,
    months,
    total,
    average: Math.round(total / months.length),
    lowest: Math.min(...incomes),
    highest: Math.max(...incomes),
    workShare: total > 0 ? workTotal / total : 0,
    periodStart: months[0].periodStart,
    periodEnd: months[months.length - 1].periodEnd,
    generatedAt: now.toISOString(),
  };
}

// Plain text for the phone's Share sheet (WhatsApp, email, SMS...).
export function formatProofText(proof, name = '') {
  if (!proof || !proof.ok) return '';
  const who = name ? ` for ${name}` : '';
  const lines = [
    `Income summary${who}`,
    `Period: ${formatPeriod(proof.periodStart, proof.periodEnd)} (${proof.count} month${proof.count === 1 ? '' : 's'} recorded)`,
    `Average per month: ${formatRand(proof.average)}`,
    `Lowest month: ${formatRand(proof.lowest)}`,
    `Highest month: ${formatRand(proof.highest)}`,
    `Share from work: ${Math.round(proof.workShare * 100)}%`,
    '',
    'Month by month:',
    ...proof.months.map((m) => `- ${m.label}: ${formatRand(m.income)}`),
    '',
    `Generated ${new Date(proof.generatedAt).toDateString()} by Fundazaka.`,
    'Self-declared: this is the account holder\'s own record. It has not been verified by a bank.',
  ];
  return lines.join('\n');
}

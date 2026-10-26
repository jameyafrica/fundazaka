// Builds the printable proof-of-income page (HTML) that expo-print turns into a PDF.
// Pure functions only, so it is easy to test and works offline. The page is white with teal
// accents on purpose: lenders print it and read it, and dark backgrounds waste ink and blur.
import { formatRand } from './format.js';
import { formatPeriod } from './breakdown.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PROOF_DISCLAIMER =
  'Self-declared: this is the account holder\u2019s own record from Fundazaka. It has not been verified by a bank, and each lender decides whether to accept it.';

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLongDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// "Fundazaka-Proof-of-Income-Thandi-Nkosi.pdf". Only letters and numbers, so it is safe on any phone.
export function proofFileName(name = '') {
  const clean = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return clean ? `Fundazaka-Proof-of-Income-${clean}.pdf` : 'Fundazaka-Proof-of-Income.pdf';
}

// proof = result of buildIncomeProof (must have ok: true). Returns '' when there is nothing to print.
export function buildProofHtml(proof, name = '') {
  if (!proof || !proof.ok) return '';

  const widest = Math.max(...proof.months.map((m) => m.income), 1);
  const who = String(name || '').trim();
  const period = formatPeriod(proof.periodStart, proof.periodEnd);
  const monthText = `${proof.count} month${proof.count === 1 ? '' : 's'} recorded`;

  const rows = proof.months
    .map((m) => {
      const pct = Math.round((m.income / widest) * 100);
      return `<tr>
        <td class="m-label">${escapeHtml(m.label)}</td>
        <td class="m-bar"><div class="track"><div class="fill" style="width:${pct}%"></div></div></td>
        <td class="m-amount">${escapeHtml(formatRand(m.income))}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Proof of income</title>
<style>
  @page { margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 40px 44px; font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0B2A2C; font-size: 13px; line-height: 1.45; }
  .brand { font-size: 22px; letter-spacing: 0.5px; color: #041F21; }
  .brand .light { font-weight: 300; }
  .brand .bold { font-weight: 800; color: #00B4A2; }
  .rule { height: 3px; background: #00B4A2; border-radius: 2px; margin: 10px 0 22px; }
  h1 { margin: 0; font-size: 26px; color: #041F21; }
  .sub { margin: 4px 0 0; color: #4B6466; }
  .meta { margin-top: 14px; width: 100%; border-collapse: collapse; }
  .meta td { padding: 3px 0; vertical-align: top; }
  .meta .k { width: 130px; color: #4B6466; }
  .meta .v { font-weight: 700; }
  .hero { margin-top: 22px; padding: 18px 20px; border: 1.5px solid #00B4A2; border-radius: 14px; background: #E8F7F5; }
  .label { color: #4B6466; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
  .big { margin-top: 4px; font-size: 36px; font-weight: 800; color: #041F21; }
  .stats { margin-top: 12px; width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-left: -12px; }
  .stats td { width: 33.33%; padding: 12px 14px; border: 1px solid #BFE6E1; border-radius: 12px; vertical-align: top; }
  .stat-value { margin-top: 3px; font-size: 19px; font-weight: 800; color: #041F21; }
  h2 { margin: 26px 0 10px; font-size: 16px; color: #041F21; }
  table.months { width: 100%; border-collapse: collapse; }
  table.months tr { page-break-inside: avoid; }
  table.months td { padding: 8px 0; border-bottom: 1px solid #E1EEEC; vertical-align: middle; }
  .m-label { width: 38%; font-weight: 600; }
  .m-bar { width: 38%; padding: 0 12px; }
  .m-amount { width: 24%; text-align: right; font-weight: 700; }
  .track { height: 8px; border-radius: 4px; background: #DCE9E7; overflow: hidden; }
  .fill { height: 8px; border-radius: 4px; background: #00B4A2; }
  .work { margin-top: 12px; color: #4B6466; }
  .disclaimer { margin-top: 26px; padding: 12px 14px; border-left: 4px solid #F97316; background: #FFF4EA; color: #5A3410; border-radius: 4px; }
  .footer { margin-top: 20px; color: #6B8284; font-size: 11px; }
</style>
</head>
<body>
  <div class="brand"><span class="light">funda</span><span class="bold">zaka</span></div>
  <div class="rule"></div>

  <h1>Proof of income</h1>
  <p class="sub">Income record built from the months logged in Fundazaka.</p>

  <table class="meta">
    ${who ? `<tr><td class="k">Account holder</td><td class="v">${escapeHtml(who)}</td></tr>` : ''}
    <tr><td class="k">Period</td><td class="v">${escapeHtml(period)} (${escapeHtml(monthText)})</td></tr>
    <tr><td class="k">Generated</td><td class="v">${escapeHtml(formatLongDate(proof.generatedAt))}</td></tr>
  </table>

  <div class="hero">
    <div class="label">Average per month</div>
    <div class="big">${escapeHtml(formatRand(proof.average))}</div>
  </div>

  <table class="stats">
    <tr>
      <td><div class="label">Lowest month</div><div class="stat-value">${escapeHtml(formatRand(proof.lowest))}</div></td>
      <td><div class="label">Highest month</div><div class="stat-value">${escapeHtml(formatRand(proof.highest))}</div></td>
      <td><div class="label">Total recorded</div><div class="stat-value">${escapeHtml(formatRand(proof.total))}</div></td>
    </tr>
  </table>

  <h2>Month by month</h2>
  <table class="months">${rows}</table>
  <div class="work">${Math.round(proof.workShare * 100)}% of this income came from work.</div>

  <div class="disclaimer">${escapeHtml(PROOF_DISCLAIMER)}</div>
  <div class="footer">Generated by Fundazaka on ${escapeHtml(formatLongDate(proof.generatedAt))}.</div>
</body>
</html>`;
}

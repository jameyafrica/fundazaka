// Money rules in one place. Every amount that enters the app goes through here.
//
// Why: JavaScript's Number() and parseFloat() accept things a money field must never accept
// ("1e308", "12e3", "0x10", "Infinity"), and floating point maths gives 0.1 + 0.2 > 0.3.
// A stray value of Infinity is saved as null by JSON.stringify and corrupts the stored data.
//
// Rules: rand amounts have at most 2 decimals, are greater than 0, and are at most MAX_AMOUNT.
// All adding and comparing is done in whole cents (integers), then turned back into rand.

export const MAX_AMOUNT = 9999999.99; // R10 million is far beyond any real entry in this app
export const MAX_NOTE_LENGTH = 60;

const MAX_CENTS = Math.round(MAX_AMOUNT * 100);

export const AMOUNT_FORMAT_ERROR = 'Please enter an amount like 1500 or 1500.50.';
export const AMOUNT_TOO_BIG_ERROR = 'That amount is too big. The most you can enter is R9 999 999.99.';
export const AMOUNT_ZERO_ERROR = 'Please enter an amount greater than R0.';

export function toCents(rand) {
  return Math.round(Number(rand) * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

// Exact sum of a list of rand amounts, e.g. sumMoney([0.1, 0.1, 0.1]) === 0.3.
export function sumMoney(list) {
  return fromCents(list.reduce((total, value) => total + toCents(value), 0));
}

export function addMoney(a, b) {
  return fromCents(toCents(a) + toCents(b));
}

export function subtractMoney(a, b) {
  return fromCents(toCents(a) - toCents(b));
}

// -1, 0 or 1. Compares in cents so 0.30000000000000004 and 0.3 are equal.
export function compareMoney(a, b) {
  const diff = toCents(a) - toCents(b);
  return diff === 0 ? 0 : diff > 0 ? 1 : -1;
}

// Strictly parses text typed by a person. Accepts "1500", "1 500", "1500,50", "R1500.5".
// Returns { ok: true, amount, cents } or { ok: false, error }.
export function parseMoney(input) {
  const text = String(input === null || input === undefined ? '' : input)
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(/^R/i, '');
  const match = /^(\d{0,8})(?:[.,](\d{0,2}))?$/.exec(text);
  if (!match || (match[1] === '' && !match[2])) return { ok: false, error: AMOUNT_FORMAT_ERROR };

  const whole = match[1] === '' ? 0 : Number(match[1]);
  const fraction = match[2] ? Number(match[2].padEnd(2, '0')) : 0;
  const cents = whole * 100 + fraction;

  if (cents <= 0) return { ok: false, error: AMOUNT_ZERO_ERROR };
  if (cents > MAX_CENTS) return { ok: false, error: AMOUNT_TOO_BIG_ERROR };
  return { ok: true, amount: fromCents(cents), cents };
}

// Validates a number that code (not a person) passes in. Same limits as parseMoney.
export function parseMoneyNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, error: AMOUNT_FORMAT_ERROR };
  const cents = Math.round(value * 100);
  if (Math.abs(value * 100 - cents) > 1e-6) return { ok: false, error: AMOUNT_FORMAT_ERROR };
  if (cents <= 0) return { ok: false, error: AMOUNT_ZERO_ERROR };
  if (cents > MAX_CENTS) return { ok: false, error: AMOUNT_TOO_BIG_ERROR };
  return { ok: true, amount: fromCents(cents), cents };
}

// Strings from the keyboard, numbers from code.
export function coerceAmount(value) {
  return typeof value === 'number' ? parseMoneyNumber(value) : parseMoney(value);
}

// For data read back from storage: a clean 2-decimal amount, or null if it cannot be trusted.
export function cleanStoredAmount(value) {
  const result = parseMoneyNumber(value);
  return result.ok ? result.amount : null;
}

// Free text such as a note: a string, no control characters, trimmed and length-capped.
export function cleanText(value, max = MAX_NOTE_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

// Pure calculator logic. No React, so it can be tested with plain node.
// State: { display, acc, op, fresh, error }
//   display: what the user sees as a string ("1500.5")
//   acc:     the left-hand number while an operator is pending
//   op:      '+', '-', '*', '/' or null
//   fresh:   true when the next digit should start a new number
//   error:   true after a divide-by-zero or an overflow

export const MAX_DIGITS = 12;
export const OPERATORS = ['+', '-', '*', '/'];
export const OPERATOR_SYMBOLS = { '+': '+', '-': '\u2212', '*': '\u00D7', '/': '\u00F7' };

export const initialCalc = { display: '0', acc: null, op: null, fresh: true, error: false };

const errorState = { display: 'Error', acc: null, op: null, fresh: true, error: true };

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? null : a / b;
    default: return b;
  }
}

// Turns a number into a display string. Rounds away floating point noise
// (0.1 + 0.2 shows 0.3, not 0.30000000000000004). Returns null if it cannot be shown.
export function toDisplay(n) {
  if (n === null || !Number.isFinite(n)) return null;
  if (Math.abs(n) >= 1e12) return null;
  let s = String(Number(n.toPrecision(12)));
  if (s.includes('e')) s = String(Number(n.toFixed(8)));
  return s === '-0' ? '0' : s;
}

function start(state) {
  return state.error ? initialCalc : state;
}

export function inputDigit(prev, digit) {
  const state = start(prev);
  if (state.fresh) return { ...state, display: String(digit), fresh: false };
  if (state.display.replace(/[-.]/g, '').length >= MAX_DIGITS) return state;
  return { ...state, display: state.display === '0' ? String(digit) : state.display + digit };
}

export function inputDot(prev) {
  const state = start(prev);
  if (state.fresh) return { ...state, display: '0.', fresh: false };
  if (state.display.includes('.')) return state;
  return { ...state, display: state.display + '.' };
}

export function setOperator(prev, op) {
  const state = start(prev);
  if (!OPERATORS.includes(op)) return state;
  // User tapped one operator then changed their mind: swap it, do not calculate.
  if (state.op && state.fresh) return { ...state, op };
  if (state.op) {
    const result = toDisplay(compute(state.acc, Number(state.display), state.op));
    if (result === null) return errorState;
    return { display: result, acc: Number(result), op, fresh: true, error: false };
  }
  return { ...state, acc: Number(state.display), op, fresh: true };
}

export function equals(prev) {
  const state = start(prev);
  if (!state.op) return state;
  const result = toDisplay(compute(state.acc, Number(state.display), state.op));
  if (result === null) return errorState;
  return { display: result, acc: null, op: null, fresh: true, error: false };
}

export function toggleSign(prev) {
  const state = start(prev);
  if (state.display === '0' || state.display === '0.') return state;
  const display = state.display.startsWith('-') ? state.display.slice(1) : '-' + state.display;
  return { ...state, display, fresh: false };
}

export function percent(prev) {
  const state = start(prev);
  const result = toDisplay(Number(state.display) / 100);
  if (result === null) return errorState;
  return { ...state, display: result, fresh: false };
}

export function backspace(prev) {
  const state = start(prev);
  if (state.fresh) return state;
  const next = state.display.slice(0, -1);
  return { ...state, display: next === '' || next === '-' ? '0' : next };
}

export function clearAll() {
  return initialCalc;
}

// "1500.5" -> "1 500.5" with a non-breaking space, keeps a trailing "." while typing.
export function formatDisplay(display) {
  if (display === 'Error') return display;
  const negative = display.startsWith('-');
  const body = negative ? display.slice(1) : display;
  const [whole, decimals] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  const withDecimals = decimals === undefined ? grouped : `${grouped}.${decimals}`;
  return negative ? `-${withDecimals}` : withDecimals;
}

// Small line above the main display, e.g. "1 500 ×" while an operator is pending.
export function getExpression(state) {
  if (!state.op || state.acc === null) return '';
  return `${formatDisplay(String(state.acc))} ${OPERATOR_SYMBOLS[state.op]}`;
}

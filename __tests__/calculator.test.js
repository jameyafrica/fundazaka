import {
  initialCalc, inputDigit, inputDot, setOperator, equals, toggleSign, percent, backspace,
  formatDisplay, getExpression,
} from '../utils/calculator.js';

const press = (state, keys) =>
  keys.split(' ').reduce((s, k) => {
    if (/^\d$/.test(k)) return inputDigit(s, k);
    if (k === '.') return inputDot(s);
    if (k === '=') return equals(s);
    if (k === 'neg') return toggleSign(s);
    if (k === '%') return percent(s);
    if (k === 'bk') return backspace(s);
    return setOperator(s, k);
  }, state);

const run = (keys) => press(initialCalc, keys).display;

describe('calculator arithmetic', () => {
  test('adds, multiplies and divides', () => {
    expect(run('1 5 0 0 + 2 5 0 =')).toBe('1750');
    expect(run('1 2 * 3 =')).toBe('36');
    expect(run('9 / 2 =')).toBe('4.5');
  });

  test('hides floating point noise', () => {
    expect(run('0 . 1 + 0 . 2 =')).toBe('0.3');
  });

  test('chains operations left to right', () => {
    expect(run('2 + 3 * 4 =')).toBe('20');
  });

  test('changing the operator does not calculate', () => {
    expect(run('5 + * 3 =')).toBe('15');
  });
});

describe('calculator errors', () => {
  test('divide by zero shows Error and recovers on the next digit', () => {
    const error = press(initialCalc, '5 / 0 =');
    expect(error.display).toBe('Error');
    expect(inputDigit(error, '7').display).toBe('7');
  });

  test('a result that is too big is an Error', () => {
    expect(run('9 9 9 9 9 9 9 9 9 9 9 9 * 9 9 =')).toBe('Error');
  });
});

describe('calculator input', () => {
  test('ignores leading zeros and a second decimal point', () => {
    expect(run('0 0 7')).toBe('7');
    expect(run('1 . 2 . 3')).toBe('1.23');
    expect(run('. 5')).toBe('0.5');
  });

  test('sign, percent and backspace', () => {
    expect(run('5 neg')).toBe('-5');
    expect(run('5 neg neg')).toBe('5');
    expect(run('2 5 0 %')).toBe('2.5');
    expect(run('1 2 3 bk')).toBe('12');
    expect(run('1 bk')).toBe('0');
  });

  test('limits input to 12 digits', () => {
    expect(run('1 2 3 4 5 6 7 8 9 0 1 2 3 4')).toBe('123456789012');
  });
});

describe('calculator display', () => {
  test('groups thousands with a non-breaking space', () => {
    expect(formatDisplay('1234567.5')).toBe('1\u00A0234\u00A0567.5');
    expect(formatDisplay('-1500')).toBe('-1\u00A0500');
    expect(formatDisplay('12.')).toBe('12.');
  });

  test('shows the pending expression', () => {
    expect(getExpression(press(initialCalc, '1 5 0 0 *'))).toBe('1\u00A0500 \u00D7');
    expect(getExpression(initialCalc)).toBe('');
  });
});

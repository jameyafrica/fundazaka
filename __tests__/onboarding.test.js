import { validateSetup, MIN_CATEGORIES, MAX_CATEGORIES } from '../utils/budgetActions.js';

const cat = (key, targetAmount = 1000) => ({ key, targetAmount });
const ALL = ['rent', 'transport', 'debit', 'groceries', 'savings'];

describe('onboarding category limits', () => {
  test('limits are 3 and 5', () => {
    expect(MIN_CATEGORIES).toBe(3);
    expect(MAX_CATEGORIES).toBe(5);
  });

  test('blocks fewer than 3 with a clear message', () => {
    const result = validateSetup([cat('rent'), cat('debit')], 1);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/at least 3/);
  });

  test('blocks an empty selection', () => {
    expect(validateSetup([], 1).ok).toBe(false);
  });

  test('allows exactly 3', () => {
    expect(validateSetup([cat('rent'), cat('debit'), cat('savings')], 1).ok).toBe(true);
  });

  test('allows all 5', () => {
    expect(validateSetup(ALL.map((k) => cat(k)), 30).ok).toBe(true);
  });

  test('blocks more than 5', () => {
    const six = [...ALL.map((k) => cat(k)), cat('rent')];
    expect(validateSetup(six, 1).ok).toBe(false);
  });

  test('blocks duplicates and unknown categories', () => {
    expect(validateSetup([cat('rent'), cat('rent'), cat('savings')], 1).ok).toBe(false);
    expect(validateSetup([cat('rent'), cat('debit'), cat('holiday')], 1).ok).toBe(false);
  });
});

describe('onboarding targets and reset day', () => {
  test('every target must be above zero', () => {
    const result = validateSetup([cat('rent'), cat('debit'), cat('savings', 0)], 1);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/target amount/);
  });

  test('reset day must be 1 to 30', () => {
    const three = [cat('rent'), cat('debit'), cat('savings')];
    expect(validateSetup(three, 0).ok).toBe(false);
    expect(validateSetup(three, 31).ok).toBe(false);
    expect(validateSetup(three, 30).ok).toBe(true);
  });

  test('returns categories in the designer display order', () => {
    const result = validateSetup([cat('savings'), cat('rent'), cat('debit')], 5);
    expect(result.categories.map((c) => c.key)).toEqual(['rent', 'debit', 'savings']);
  });
});

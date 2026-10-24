import { buildDemoState, getTotals } from '../utils/budgetActions';
import { COURSES } from '../constants/courses';
import {
  MAX_REPORTS,
  MAX_STATE_CHARS,
  MAX_TRANSACTIONS,
  parseSavedState,
  sanitizeLearning,
  sanitizeState,
} from '../utils/sanitizeState';

const NOW = new Date('2026-10-24T10:00:00.000Z');
let counter = 0;
const options = { now: NOW, makeId: () => `fixed-id-${++counter}` };

function realAccount(overrides = {}) {
  return {
    user: { id: 'user-123', email: 'thandi@example.com' },
    ownerId: 'user-123',
    isGuest: false,
    displayName: 'Thandi',
    onboardingCompleted: true,
    tourCompleted: true,
    resetPending: false,
    resetDay: 25,
    cycleStartedAt: '2026-09-25T00:00:00.000Z',
    categories: [
      { key: 'rent', targetAmount: 3500 },
      { key: 'transport', targetAmount: 1200 },
      { key: 'savings', targetAmount: 500 },
    ],
    transactions: [
      { id: 'a1', type: 'income', source: 'work', amount: 1000, note: 'Bolt', createdAt: '2026-10-01T10:00:00.000Z' },
      { id: 'a2', type: 'expense', categoryKey: 'rent', amount: 500.5, note: '', createdAt: '2026-10-02T10:00:00.000Z' },
    ],
    monthlyReports: [],
    learning: {},
    ...overrides,
  };
}

describe('sanitizeState: whole state', () => {
  test('rejects anything that is not a plain object', () => {
    [null, undefined, 5, 'text', [], true].forEach((bad) => expect(sanitizeState(bad, options)).toBeNull());
  });

  test('a healthy demo state passes through unchanged', () => {
    const demo = buildDemoState(NOW);
    expect(sanitizeState(demo, options)).toEqual(demo);
  });

  test('a healthy real account passes through unchanged', () => {
    const clean = sanitizeState(realAccount(), options);
    expect(clean.user).toEqual({ id: 'user-123', email: 'thandi@example.com' });
    expect(clean.ownerId).toBe('user-123');
    expect(clean.isGuest).toBe(false);
    expect(clean.onboardingCompleted).toBe(true);
    expect(clean.transactions).toHaveLength(2);
    expect(clean.categories.map((c) => c.key)).toEqual(['rent', 'transport', 'savings']);
  });

  test('drops unknown keys and never trusts resetPending or hydrated', () => {
    const clean = sanitizeState(
      realAccount({ resetPending: true, hydrated: false, isAdmin: true, __proto__: { x: 1 }, extra: { deep: 1 } }),
      options
    );
    expect(clean.resetPending).toBe(false);
    expect(clean).not.toHaveProperty('hydrated');
    expect(clean).not.toHaveProperty('isAdmin');
    expect(clean).not.toHaveProperty('extra');
  });

  test('is safe against a JSON document with an own __proto__ key', () => {
    const text = '{"__proto__":{"isGuest":true},"ownerId":"user-123","user":{"id":"user-123"}}';
    const clean = parseSavedState(text, options);
    expect(clean.isGuest).toBe(false);
    expect({}.isGuest).toBeUndefined();
  });

  test('flags and text fields must have the right type', () => {
    const clean = sanitizeState(
      realAccount({ tourCompleted: 'yes', displayName: { evil: true }, onboardingCompleted: 1 }),
      options
    );
    expect(clean.tourCompleted).toBe(false);
    expect(clean.displayName).toBe('');
    expect(clean.onboardingCompleted).toBe(false);
  });

  test('display name has control characters removed and is length capped', () => {
    const clean = sanitizeState(realAccount({ displayName: `Th\u0000an\ndi${'x'.repeat(200)}` }), options);
    expect(clean.displayName.length).toBeLessThanOrEqual(60);
    expect(clean.displayName).not.toMatch(/[\u0000-\u001F]/);
  });
});

describe('sanitizeState: owner and guest rules', () => {
  test('guest data requires the guest owner', () => {
    expect(sanitizeState(realAccount({ isGuest: true, ownerId: 'user-123' }), options)).toBeNull();
    expect(sanitizeState(realAccount({ isGuest: true, ownerId: null }), options)).toBeNull();
  });

  test('a real account can never claim the guest owner', () => {
    expect(sanitizeState(realAccount({ ownerId: 'guest', user: { id: 'guest' } }), options)).toBeNull();
  });

  test('isGuest must be exactly true to count as a guest', () => {
    expect(sanitizeState(realAccount({ isGuest: 'true' }), options).isGuest).toBe(false);
  });

  test('guest state is rebuilt with the guest user only', () => {
    const clean = sanitizeState({ ...buildDemoState(NOW), user: { id: 'user-123', email: 'x@y.za' } }, options);
    expect(clean.user).toEqual({ id: 'guest' });
    expect(clean.ownerId).toBe('guest');
  });

  test('a signed-in user that does not match the owner is dropped', () => {
    const clean = sanitizeState(realAccount({ user: { id: 'someone-else', email: 'a@b.co' } }), options);
    expect(clean.user).toBeNull();
    expect(clean.ownerId).toBe('user-123');
  });

  test('a signed-out real account keeps its owner and data', () => {
    const clean = sanitizeState(realAccount({ user: null }), options);
    expect(clean.user).toBeNull();
    expect(clean.ownerId).toBe('user-123');
    expect(clean.transactions).toHaveLength(2);
  });

  test('older data without an owner is kept without an owner', () => {
    const clean = sanitizeState(realAccount({ ownerId: undefined }), options);
    expect(clean.ownerId).toBeNull();
    expect(clean.user).toEqual({ id: 'user-123', email: 'thandi@example.com' });
  });

  test('owner ids must look like ids', () => {
    expect(sanitizeState(realAccount({ ownerId: '../../etc', user: null }), options)).toBeNull();
    expect(sanitizeState(realAccount({ ownerId: 42, user: null }), options)).toBeNull();
    expect(sanitizeState(realAccount({ ownerId: 'a'.repeat(65), user: null }), options)).toBeNull();
  });
});

describe('sanitizeState: setup', () => {
  test('more than 5 categories are cut to 5, unknown and duplicate keys removed', () => {
    const categories = [
      { key: 'rent', targetAmount: 1 },
      { key: 'rent', targetAmount: 2 },
      { key: 'transport', targetAmount: 1 },
      { key: 'debit', targetAmount: 1 },
      { key: 'groceries', targetAmount: 1 },
      { key: 'savings', targetAmount: 1 },
      { key: 'crypto', targetAmount: 1 },
      { key: 'holiday', targetAmount: 1 },
    ];
    const clean = sanitizeState(realAccount({ categories }), options);
    expect(clean.categories.map((c) => c.key)).toEqual(['rent', 'transport', 'debit', 'groceries', 'savings']);
    expect(clean.categories[0].targetAmount).toBe(1);
  });

  test('categories with bad targets are removed', () => {
    const bad = [-5, 0, Infinity, NaN, '1500', null, 1e12, 10.555, {}, [], true];
    bad.forEach((value) => {
      const clean = sanitizeState(
        realAccount({ categories: [...realAccount().categories, { key: 'debit', targetAmount: value }] }),
        options
      );
      expect(clean.categories.map((c) => c.key)).not.toContain('debit');
    });
  });

  test('categories are returned in display order', () => {
    const clean = sanitizeState(
      realAccount({ categories: [{ key: 'savings', targetAmount: 5 }, { key: 'rent', targetAmount: 5 }, { key: 'debit', targetAmount: 5 }] }),
      options
    );
    expect(clean.categories.map((c) => c.key)).toEqual(['rent', 'debit', 'savings']);
  });

  test('onboarding is no longer complete when fewer than 3 valid categories remain', () => {
    const clean = sanitizeState(realAccount({ categories: [{ key: 'rent', targetAmount: 100 }] }), options);
    expect(clean.onboardingCompleted).toBe(false);
    expect(clean.transactions).toHaveLength(2); // money entries are not thrown away
  });

  test('onboarding is no longer complete without a valid reset day', () => {
    [0, 31, 1.5, '12', null, NaN].forEach((day) => {
      expect(sanitizeState(realAccount({ resetDay: day }), options).onboardingCompleted).toBe(false);
    });
    expect(sanitizeState(realAccount({ resetDay: 30 }), options).resetDay).toBe(30);
  });

  test('a missing cycle start is repaired for a completed setup, but a bad one is not invented before it', () => {
    expect(sanitizeState(realAccount({ cycleStartedAt: 'nonsense' }), options).cycleStartedAt).toBe(NOW.toISOString());
    expect(sanitizeState(realAccount({ onboardingCompleted: false, cycleStartedAt: null }), options).cycleStartedAt).toBeNull();
  });

  test('dates are normalised and out-of-range years rejected', () => {
    expect(sanitizeState(realAccount({ cycleStartedAt: '2026-09-25' }), options).cycleStartedAt).toBe('2026-09-25T00:00:00.000Z');
    expect(sanitizeState(realAccount({ onboardingCompleted: false, cycleStartedAt: '1850-01-01T00:00:00Z' }), options).cycleStartedAt).toBeNull();
    expect(sanitizeState(realAccount({ onboardingCompleted: false, cycleStartedAt: '9999-01-01T00:00:00Z' }), options).cycleStartedAt).toBeNull();
  });
});

describe('sanitizeState: transactions', () => {
  const base = { id: 'x1', type: 'income', source: 'work', amount: 100, note: 'ok', createdAt: '2026-10-01T10:00:00.000Z' };
  const run = (list) => sanitizeState(realAccount({ transactions: list }), options).transactions;

  test('valid transactions keep their fields and nothing else', () => {
    const [t] = run([{ ...base, hacked: 'yes' }]);
    expect(t).toEqual(base);
  });

  test('bad amounts are dropped', () => {
    const bad = [0, -1, Infinity, null, '100', 99999999, 1.234, undefined, {}];
    bad.forEach((amount) => expect(run([{ ...base, amount }])).toEqual([]));
  });

  test('bad types, sources and categories are dropped', () => {
    expect(run([{ ...base, type: 'refund' }])).toEqual([]);
    expect(run([{ ...base, source: 'lottery' }])).toEqual([]);
    expect(run([{ ...base, type: 'expense', categoryKey: 'crypto' }])).toEqual([]);
    expect(run([{ ...base, type: 'expense', categoryKey: undefined }])).toEqual([]);
  });

  test('bad dates are dropped', () => {
    ['', 'yesterday', null, 12345, '1999-01-01T00:00:00Z', '2200-01-01T00:00:00Z'].forEach((createdAt) => {
      expect(run([{ ...base, createdAt }])).toEqual([]);
    });
  });

  test('entries that are not objects are skipped', () => {
    expect(run([null, 5, 'x', [], base])).toHaveLength(1);
  });

  test('notes are cleaned and capped', () => {
    const [t] = run([{ ...base, note: `hi\u0000\n${'z'.repeat(500)}` }]);
    expect(t.note.length).toBeLessThanOrEqual(60);
    expect(t.note).not.toMatch(/[\u0000-\u001F]/);
    expect(run([{ ...base, note: { a: 1 } }])[0].note).toBe('');
  });

  test('invalid or duplicate ids are repaired with fresh ones', () => {
    const list = run([{ ...base, id: 'dup' }, { ...base, id: 'dup' }, { ...base, id: '<script>' }, { ...base, id: 7 }]);
    expect(list).toHaveLength(4);
    const ids = list.map((t) => t.id);
    expect(new Set(ids).size).toBe(4);
    ids.forEach((id) => expect(id).toMatch(/^[A-Za-z0-9_-]{1,64}$/));
  });

  test('a huge list is capped and the newest entries are kept', () => {
    const many = Array.from({ length: MAX_TRANSACTIONS + 50 }, (_, i) => ({ ...base, id: `t${i}` }));
    const list = run(many);
    expect(list).toHaveLength(MAX_TRANSACTIONS);
    expect(list[list.length - 1].id).toBe(`t${MAX_TRANSACTIONS + 49}`);
  });

  test('transactions that are not a list become empty', () => {
    expect(run('lots of money')).toEqual([]);
    expect(run({ length: 5 })).toEqual([]);
  });
});

describe('sanitizeState: monthly reports', () => {
  const tx = (id, type, extra, amount, createdAt = '2026-09-10T10:00:00.000Z') => ({ id, type, amount, note: '', createdAt, ...extra });
  const report = (overrides = {}) => ({
    id: 'r1',
    periodStart: '2026-09-01T00:00:00.000Z',
    periodEnd: '2026-10-01T00:00:00.000Z',
    totalIncome: 999999,
    totalExpenses: 1,
    balance: 5,
    incomeBySource: { work: 1, gift: 2, other: 3 },
    categories: [{ key: 'rent', targetAmount: 3500, spentAmount: 12345 }],
    transactions: [tx('p1', 'income', { source: 'work' }, 2000), tx('p2', 'expense', { categoryKey: 'rent' }, 750.25)],
    ...overrides,
  });
  const run = (list) => sanitizeState(realAccount({ monthlyReports: list }), options).monthlyReports;

  test('totals are recomputed from the transactions, not trusted', () => {
    const [r] = run([report()]);
    expect(r.totalIncome).toBe(2000);
    expect(r.totalExpenses).toBe(750.25);
    expect(r.balance).toBe(1249.75);
    expect(r.incomeBySource).toEqual({ work: 2000, gift: 0, other: 0 });
    expect(r.categories).toEqual([{ key: 'rent', targetAmount: 3500, spentAmount: 750.25 }]);
    expect(getTotals(r.categories, r.transactions).balance).toBe(r.balance);
  });

  test('a report keeps the shape the breakdown screen expects', () => {
    const [r] = run([report()]);
    expect(Object.keys(r).sort()).toEqual(
      ['balance', 'categories', 'id', 'incomeBySource', 'periodEnd', 'periodStart', 'totalExpenses', 'totalIncome', 'transactions'].sort()
    );
  });

  test('reports without a valid end date are dropped, a missing start becomes null', () => {
    expect(run([report({ periodEnd: 'bad' })])).toEqual([]);
    expect(run([report({ periodStart: 'bad' })])[0].periodStart).toBeNull();
  });

  test('bad transactions inside a report are removed before totals are computed', () => {
    const [r] = run([report({ transactions: [tx('p1', 'income', { source: 'work' }, 100), tx('p2', 'income', { source: 'work' }, Infinity)] })]);
    expect(r.totalIncome).toBe(100);
    expect(r.transactions).toHaveLength(1);
  });

  test('the number of reports is capped and the newest are kept', () => {
    const many = Array.from({ length: MAX_REPORTS + 10 }, (_, i) => report({ id: `r${i}` }));
    const list = run(many);
    expect(list).toHaveLength(MAX_REPORTS);
    expect(list[0].id).toBe('r0');
  });

  test('duplicate report ids are repaired and non-lists become empty', () => {
    const list = run([report({ id: 'same' }), report({ id: 'same' })]);
    expect(new Set(list.map((r) => r.id)).size).toBe(2);
    expect(run('nope')).toEqual([]);
    expect(run([null, 4, 'x'])).toEqual([]);
  });
});

describe('sanitizeLearning', () => {
  const course = COURSES[0];
  const lessonIds = course.lessons.map((l) => l.id);
  const scam = COURSES.find((c) => c.id === 'scam-awareness');

  test('empty or garbage input gives a clean empty state', () => {
    [undefined, null, 'x', 5, []].forEach((raw) => {
      expect(sanitizeLearning(raw)).toEqual({
        streak: 0, bestStreak: 0, lastActiveDate: null, completedLessons: {}, quizScores: {}, badges: [],
      });
    });
  });

  test('fake badges are removed and real ones are derived from progress', () => {
    const l = sanitizeLearning({ badges: ['graduate', 'quiz-ace', 'made-up'], completedLessons: { [course.id]: [lessonIds[0]] } });
    expect(l.badges).toEqual(['first-lesson']);
  });

  test('unknown courses and lessons are removed', () => {
    const l = sanitizeLearning({
      completedLessons: { [course.id]: [lessonIds[0], 'nope', 7], ghost: ['a'], __proto__: ['x'] },
    });
    expect(l.completedLessons).toEqual({ [course.id]: [lessonIds[0]] });
  });

  test('quiz scores are bounded and the percent is recomputed', () => {
    const l = sanitizeLearning({
      quizScores: { [scam.id]: { bestPercent: 100, bestCorrect: 99, total: 1, attempts: -3 }, ghost: { bestPercent: 100 } },
    });
    const total = scam.quiz.length;
    expect(l.quizScores[scam.id]).toEqual({ bestPercent: 100, bestCorrect: total, total, attempts: 1 });
    expect(l.quizScores).not.toHaveProperty('ghost');
    expect(l.badges).toContain('quiz-ace');
    expect(l.badges).toContain('scam-smart');
  });

  test('streak values are bounded and consistent', () => {
    const l = sanitizeLearning({ streak: 999999999, bestStreak: 2, lastActiveDate: '2026-10-23' });
    expect(l.streak).toBe(36500);
    expect(l.bestStreak).toBe(36500);
    expect(sanitizeLearning({ streak: 5, bestStreak: 5, lastActiveDate: null }).streak).toBe(0);
  });

  test('impossible calendar dates are rejected', () => {
    ['2026-13-45', '2026-02-30', '9999-99-99', '1990-01-01', 'today'].forEach((d) => {
      expect(sanitizeLearning({ streak: 3, lastActiveDate: d }).lastActiveDate).toBeNull();
    });
    expect(sanitizeLearning({ lastActiveDate: '2028-02-29' }).lastActiveDate).toBe('2028-02-29');
  });
});

describe('parseSavedState', () => {
  test('parses saved text and cleans it', () => {
    const clean = parseSavedState(JSON.stringify(realAccount()), options);
    expect(clean.ownerId).toBe('user-123');
  });

  test('returns null for empty, invalid, oversized or non-object text', () => {
    ['', 'not json', '[]', 'null', '5', '{"a":', null, undefined, 42].forEach((text) => {
      expect(parseSavedState(text, options)).toBeNull();
    });
    expect(parseSavedState(' '.repeat(MAX_STATE_CHARS + 1), options)).toBeNull();
  });

  test('the cleaned state survives a save and load round trip unchanged', () => {
    const once = parseSavedState(JSON.stringify(buildDemoState(NOW)), options);
    const twice = parseSavedState(JSON.stringify(once), options);
    expect(twice).toEqual(once);
  });
});
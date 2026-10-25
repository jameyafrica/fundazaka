import { editTransactionById, removeTransactionById, restoreTransaction } from '../utils/transactions';

const list = () => [
  { id: 'a', type: 'income', source: 'work', amount: 1000, note: 'Bolt', createdAt: '2026-10-01T10:00:00.000Z' },
  { id: 'b', type: 'expense', categoryKey: 'transport', amount: 15000, note: 'typo', createdAt: '2026-10-02T10:00:00.000Z' },
  { id: 'c', type: 'expense', categoryKey: 'rent', amount: 3500, note: '', createdAt: '2026-10-03T10:00:00.000Z' },
];

describe('remove and restore', () => {
  test('removes one entry and remembers where it was', () => {
    const result = removeTransactionById(list(), 'b');
    expect(result.list.map((t) => t.id)).toEqual(['a', 'c']);
    expect(result.removed.amount).toBe(15000);
    expect(result.index).toBe(1);
  });

  test('an unknown id changes nothing', () => {
    const result = removeTransactionById(list(), 'zzz');
    expect(result.removed).toBeNull();
    expect(result.list).toHaveLength(3);
  });

  test('restore puts the entry back in its old position', () => {
    const removed = removeTransactionById(list(), 'b');
    const back = restoreTransaction(removed.list, removed.removed, removed.index);
    expect(back.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  test('restore never duplicates an entry that is already there', () => {
    const back = restoreTransaction(list(), list()[1], 1);
    expect(back).toHaveLength(3);
  });

  test('restore clamps a stale index', () => {
    const back = restoreTransaction([], list()[0], 99);
    expect(back.map((t) => t.id)).toEqual(['a']);
  });
});

describe('edit', () => {
  test('fixes a mistyped amount and keeps the rest', () => {
    const result = editTransactionById(list(), 'b', { amount: '1500' });
    expect(result.ok).toBe(true);
    expect(result.after.amount).toBe(1500);
    expect(result.after.categoryKey).toBe('transport');
    expect(result.before.amount).toBe(15000);
    expect(result.list[1].amount).toBe(1500);
  });

  test('uses the same strict money rules as a new entry', () => {
    expect(editTransactionById(list(), 'b', { amount: '1e308' }).ok).toBe(false);
    expect(editTransactionById(list(), 'b', { amount: '0' }).ok).toBe(false);
    expect(editTransactionById(list(), 'b', { amount: '99999999' }).ok).toBe(false);
  });

  test('changes only the note when no amount is given', () => {
    const result = editTransactionById(list(), 'a', { note: '  Weekend gig  ' });
    expect(result.after.note).toBe('Weekend gig');
    expect(result.after.amount).toBe(1000);
  });

  test('an unknown id is a clear error', () => {
    expect(editTransactionById(list(), 'zzz', { amount: '5' }).ok).toBe(false);
  });

  test('does not change the original list', () => {
    const original = list();
    editTransactionById(original, 'b', { amount: '1500' });
    expect(original[1].amount).toBe(15000);
  });
});

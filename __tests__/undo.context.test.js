import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { BudgetProvider, useBudget } from '../context/BudgetContext';
import { buildDemoState } from '../utils/budgetActions';

jest.mock('../lib/supabase', () => ({
  supabase: { auth: { signOut: jest.fn(), signInWithPassword: jest.fn(), signUp: jest.fn() } },
  isSupabaseConfigured: true,
  hasSupabaseSession: jest.fn(async () => true),
  AUTH_STORAGE_KEYS: ['sb-test-auth-token', 'sb-test-auth-token-user'],
}));

const wrapper = ({ children }) => <BudgetProvider>{children}</BudgetProvider>;

async function startDemo() {
  const hook = await renderHook(() => useBudget(), { wrapper });
  await waitFor(() => expect(hook.result.current.hydrated).toBe(true));
  await act(async () => {
    hook.result.current.startGuest({ replace: true });
  });
  return hook;
}

describe('delete, edit and undo', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('a mistyped R15000 expense can be deleted and the balance is corrected', async () => {
    const { result } = await startDemo();
    const before = result.current.totals.balance;
    let id;
    await act(async () => {
      id = result.current.payExpense({ amount: 15000, categoryKey: 'transport', note: 'typo' }).id;
    });
    expect(result.current.totals.balance).toBe(before - 15000);
    await act(async () => {
      expect(result.current.removeTransaction(id).ok).toBe(true);
    });
    expect(result.current.totals.balance).toBe(before);
  });

  test('undo after adding removes the new entry', async () => {
    const { result } = await startDemo();
    const count = result.current.transactions.length;
    await act(async () => {
      result.current.logIncome({ amount: 500, source: 'gift' });
    });
    expect(result.current.transactions).toHaveLength(count + 1);
    expect(result.current.undoEntry.kind).toBe('added');
    await act(async () => {
      result.current.undoLast();
    });
    expect(result.current.transactions).toHaveLength(count);
    expect(result.current.undoEntry).toBeNull();
  });

  test('undo after deleting puts the entry back in its place', async () => {
    const { result } = await startDemo();
    const ids = result.current.transactions.map((t) => t.id);
    const victim = ids[3];
    await act(async () => {
      result.current.removeTransaction(victim);
    });
    expect(result.current.transactions.map((t) => t.id)).not.toContain(victim);
    await act(async () => {
      result.current.undoLast();
    });
    expect(result.current.transactions.map((t) => t.id)).toEqual(ids);
  });

  test('editing fixes the amount and undo restores the old one', async () => {
    const { result } = await startDemo();
    let id;
    await act(async () => {
      id = result.current.payExpense({ amount: 15000, categoryKey: 'transport' }).id;
    });
    await act(async () => {
      expect(result.current.updateTransaction(id, { amount: '150' }).ok).toBe(true);
    });
    expect(result.current.transactions.find((t) => t.id === id).amount).toBe(150);
    await act(async () => {
      result.current.undoLast();
    });
    expect(result.current.transactions.find((t) => t.id === id).amount).toBe(15000);
  });

  test('a bad edit is refused and changes nothing', async () => {
    const { result } = await startDemo();
    const target = result.current.transactions[0];
    let outcome;
    await act(async () => {
      outcome = result.current.updateTransaction(target.id, { amount: '1e308' });
    });
    expect(outcome.ok).toBe(false);
    expect(result.current.transactions[0].amount).toBe(target.amount);
  });

  test('deleting an entry that is gone is a safe no-op', async () => {
    const { result } = await startDemo();
    let outcome;
    await act(async () => {
      outcome = result.current.removeTransaction('does-not-exist');
    });
    expect(outcome.ok).toBe(false);
    expect(result.current.undoEntry).toBeNull();
  });

  test('undo with nothing to undo does nothing', async () => {
    const { result } = await startDemo();
    let outcome;
    await act(async () => {
      outcome = result.current.undoLast();
    });
    expect(outcome.ok).toBe(false);
  });

  test('the monthly reset clears the undo so old entries cannot come back', async () => {
    const { result } = await startDemo();
    await act(async () => {
      result.current.removeTransaction(result.current.transactions[0].id);
    });
    expect(result.current.undoEntry).not.toBeNull();
    await act(async () => {
      result.current.runReset(result.current.categories, 1);
    });
    expect(result.current.undoEntry).toBeNull();
  });

  test('the undo entry is never saved to the phone', async () => {
    const { result } = await startDemo();
    await act(async () => {
      result.current.logIncome({ amount: 100, source: 'other' });
    });
    expect(buildDemoState).toBeDefined();
    const keys = await AsyncStorage.getAllKeys();
    const stored = await Promise.all(keys.map((k) => AsyncStorage.getItem(k)));
    expect(stored.join('')).not.toMatch(/undoEntry/);
  });
});

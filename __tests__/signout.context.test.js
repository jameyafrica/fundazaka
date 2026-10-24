import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { BudgetProvider, useBudget } from '../context/BudgetContext';
import { authStorage, stateStorage } from '../lib/encryptedStorage';
import { supabase } from '../lib/supabase';
import { buildDemoState } from '../utils/budgetActions';
import { GUEST_OWNER, hasAccountData } from '../lib/session';

jest.mock('../lib/supabase', () => ({
  supabase: { auth: { signOut: jest.fn(), signInWithPassword: jest.fn(), signUp: jest.fn() } },
  isSupabaseConfigured: true,
  hasSupabaseSession: jest.fn(async () => true),
  AUTH_STORAGE_KEYS: ['sb-test-auth-token', 'sb-test-auth-token-user'],
}));

const STATE_KEY = 'fundazaka_state_v2';
const wrapper = ({ children }) => <BudgetProvider>{children}</BudgetProvider>;
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
};

const realAccount = {
  user: { id: 'user-123', email: 'thandi@example.com' },
  ownerId: 'user-123',
  isGuest: false,
  displayName: 'Thandi',
  onboardingCompleted: true,
  tourCompleted: true,
  resetDay: 25,
  cycleStartedAt: new Date().toISOString(),
  categories: [
    { key: 'rent', targetAmount: 3500 },
    { key: 'transport', targetAmount: 1200 },
    { key: 'savings', targetAmount: 500 },
  ],
  transactions: [
    { id: 'a1', type: 'income', source: 'work', amount: 1000, note: 'Bolt', createdAt: new Date().toISOString() },
    { id: 'a2', type: 'expense', categoryKey: 'rent', amount: 500, note: '', createdAt: new Date().toISOString() },
  ],
  monthlyReports: [],
  learning: {},
};

async function startWith(saved) {
  if (saved) await stateStorage.setItem(STATE_KEY, JSON.stringify(saved));
  await authStorage.setItem('sb-test-auth-token', '{"access_token":"abc"}');
  await authStorage.setItem('sb-test-auth-token-user', '{"id":"user-123"}');
  const hook = await renderHook(() => useBudget(), { wrapper });
  await waitFor(() => expect(hook.result.current.hydrated).toBe(true));
  return hook;
}

describe('sign out keeps a real account\'s data and wipes demo data', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    supabase.auth.signOut.mockReset().mockResolvedValue({ error: null });
    supabase.auth.signInWithPassword.mockReset();
  });

  test('a real account starts signed in with its data', async () => {
    const { result } = await startWith(realAccount);
    expect(result.current.user).toEqual({ id: 'user-123', email: 'thandi@example.com' });
    expect(result.current.transactions).toHaveLength(2);
  });

  test('signing out ends the login on this phone but keeps the data', async () => {
    const { result } = await startWith(realAccount);
    await act(async () => {
      await result.current.signOut();
    });
    await settle();

    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(result.current.user).toBeNull();
    expect(result.current.isGuest).toBe(false);
    expect(result.current.ownerId).toBe('user-123');
    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.onboardingCompleted).toBe(true);
    expect(await authStorage.getItem('sb-test-auth-token')).toBeNull();
    expect(await authStorage.getItem('sb-test-auth-token-user')).toBeNull();

    const saved = JSON.parse(await stateStorage.getItem(STATE_KEY));
    expect(saved.user).toBeNull();
    expect(saved.transactions).toHaveLength(2);
  });

  test('signing out works offline: the login is still removed from the phone', async () => {
    supabase.auth.signOut.mockRejectedValue(new Error('Network request failed'));
    const { result } = await startWith(realAccount);
    await act(async () => {
      await result.current.signOut();
    });
    await settle();
    expect(result.current.user).toBeNull();
    expect(result.current.transactions).toHaveLength(2);
    expect(await authStorage.getItem('sb-test-auth-token')).toBeNull();
  });

  test('the same account logging back in gets its data back', async () => {
    const { result } = await startWith(realAccount);
    await act(async () => {
      await result.current.signOut();
    });
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'thandi@example.com' } },
      error: null,
    });
    let outcome;
    await act(async () => {
      outcome = await result.current.signIn({ email: 'thandi@example.com', password: 'secret-pass' });
    });
    expect(outcome.ok).toBe(true);
    expect(result.current.user.id).toBe('user-123');
    expect(result.current.transactions).toHaveLength(2);
  });

  test('a different account never sees the previous account\'s data', async () => {
    const { result } = await startWith(realAccount);
    await act(async () => {
      await result.current.signOut();
    });
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-999', email: 'other@example.com' } },
      error: null,
    });
    await act(async () => {
      await result.current.signIn({ email: 'other@example.com', password: 'secret-pass' });
    });
    expect(result.current.ownerId).toBe('user-999');
    expect(result.current.transactions).toEqual([]);
    expect(result.current.onboardingCompleted).toBe(false);
  });

  test('signing out of demo mode erases the demo data from storage', async () => {
    const { result } = await startWith(null);
    await act(async () => {
      result.current.startGuest();
    });
    await waitFor(async () => expect(await AsyncStorage.getAllKeys()).toContain(STATE_KEY));
    await act(async () => {
      await result.current.signOut();
    });
    await settle();
    expect(result.current.user).toBeNull();
    expect(result.current.isGuest).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).not.toContain(STATE_KEY);
  });
});

describe('starting demo mode never silently erases an account\'s data', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    supabase.auth.signOut.mockReset().mockResolvedValue({ error: null });
  });

  test('refuses while a signed-out account\'s data is on the phone', async () => {
    const { result } = await startWith({ ...realAccount, user: null });
    let outcome;
    await act(async () => {
      outcome = result.current.startGuest();
    });
    expect(outcome).toEqual({ ok: false, reason: 'account-data' });
    expect(result.current.isGuest).toBe(false);
    expect(result.current.ownerId).toBe('user-123');
    expect(result.current.transactions).toHaveLength(2);
  });

  test('starts after the person confirms the replacement', async () => {
    const { result } = await startWith({ ...realAccount, user: null });
    await act(async () => {
      result.current.startGuest({ replace: true });
    });
    expect(result.current.isGuest).toBe(true);
    expect(result.current.ownerId).toBe(GUEST_OWNER);
    expect(result.current.transactions.length).toBeGreaterThan(0);
  });

  test('starts straight away on a clean phone', async () => {
    const { result } = await startWith(null);
    let outcome;
    await act(async () => {
      outcome = result.current.startGuest();
    });
    expect(outcome).toEqual({ ok: true });
    expect(result.current.isGuest).toBe(true);
  });
});

describe('hasAccountData', () => {
  test('is true only for real, non-demo data', () => {
    expect(hasAccountData({ isGuest: false, onboardingCompleted: true, categories: [], transactions: [] })).toBe(true);
    expect(hasAccountData({ isGuest: false, onboardingCompleted: false, categories: [], transactions: [{}] })).toBe(true);
    expect(hasAccountData({ isGuest: false, onboardingCompleted: false, categories: [], transactions: [] })).toBe(false);
    expect(hasAccountData({ ...buildDemoState(new Date()) })).toBe(false);
  });
});
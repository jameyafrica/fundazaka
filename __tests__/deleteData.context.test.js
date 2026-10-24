import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { BudgetProvider, useBudget } from '../context/BudgetContext';

const STATE_KEY = 'fundazaka_state_v2';
const LEGACY_KEY = 'fundazaka_state';

const wrapper = ({ children }) => <BudgetProvider>{children}</BudgetProvider>;
const keys = async () => AsyncStorage.getAllKeys();
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
};

async function startWithDemoData() {
  const hook = await renderHook(() => useBudget(), { wrapper });
  await waitFor(() => expect(hook.result.current.hydrated).toBe(true));
  await act(async () => {
    hook.result.current.startGuest();
  });
  await waitFor(async () => expect(await keys()).toContain(STATE_KEY));
  return hook;
}

describe('deleteLocalData in the budget context', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('erases saved data, resets the state and does not write anything back', async () => {
    const { result } = await startWithDemoData();
    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.isGuest).toBe(true);

    let outcome;
    await act(async () => {
      outcome = await result.current.deleteLocalData();
    });
    await settle();

    expect(outcome).toEqual({ ok: true });
    expect(result.current.user).toBeNull();
    expect(result.current.isGuest).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(result.current.monthlyReports).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.onboardingCompleted).toBe(false);
    expect(result.current.hydrated).toBe(true);
    expect(await keys()).not.toContain(STATE_KEY);
    expect(await keys()).not.toContain(LEGACY_KEY);
  });

  test('also removes an old plain-text save', async () => {
    await AsyncStorage.setItem(LEGACY_KEY, '{"displayName":"Old"}');
    const { result } = await startWithDemoData();
    await AsyncStorage.setItem(LEGACY_KEY, '{"displayName":"Old again"}');
    await act(async () => {
      await result.current.deleteLocalData();
    });
    await settle();
    expect(await keys()).not.toContain(LEGACY_KEY);
  });

  test('keeps the app language, which is not personal data', async () => {
    await AsyncStorage.setItem('fundazaka_language', 'zu');
    const { result } = await startWithDemoData();
    await act(async () => {
      await result.current.deleteLocalData();
    });
    await settle();
    expect(await AsyncStorage.getItem('fundazaka_language')).toBe('zu');
  });

  test('saving works again after a delete', async () => {
    const { result } = await startWithDemoData();
    await act(async () => {
      await result.current.deleteLocalData();
    });
    await settle();
    expect(await keys()).not.toContain(STATE_KEY);
    await act(async () => {
      result.current.startGuest();
    });
    await waitFor(async () => expect(await keys()).toContain(STATE_KEY));
  });

  test('if erasing fails the data and state stay, and the user is told', async () => {
    const { result } = await startWithDemoData();
    const { stateStorage } = require('../lib/encryptedStorage');
    const original = stateStorage.removeItem;
    stateStorage.removeItem = jest.fn().mockRejectedValue(new Error('disk error'));

    let outcome;
    await act(async () => {
      outcome = await result.current.deleteLocalData();
    });
    stateStorage.removeItem = original;

    expect(outcome).toEqual({ ok: false });
    expect(result.current.isGuest).toBe(true);
    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(await keys()).toContain(STATE_KEY);

    // changes are saved again after a failed delete
    await act(async () => {
      result.current.setDisplayName('Still here');
    });
    await waitFor(() => expect(result.current.displayName).toBe('Still here'));
  });
});
import React from 'react';
import { AppState, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import { BudgetProvider, useBudget } from '../context/BudgetContext';
import { appLockService } from '../lib/appLock';
import AppLockGate from '../components/AppLockGate';
import { LOCK_GRACE_MS, createAppLockService, isLocked, shouldRelock } from '../utils/appLock';

jest.mock('../context/BudgetContext', () => {
  const actual = jest.requireActual('../context/BudgetContext');
  return { ...actual, useBudget: jest.fn(actual.useBudget) };
});

describe('createAppLockService', () => {
  test('a phone with any screen lock can use App lock', async () => {
    for (const level of [1, 2, 3]) {
      const service = createAppLockService({ getEnrolledLevelAsync: async () => level });
      expect(await service.isAvailable()).toBe(true);
    }
  });

  test('a phone with no screen lock, or a failing check, cannot', async () => {
    expect(await createAppLockService({ getEnrolledLevelAsync: async () => 0 }).isAvailable()).toBe(false);
    expect(await createAppLockService({ getEnrolledLevelAsync: async () => { throw new Error('boom'); } }).isAvailable()).toBe(false);
  });

  test('authenticate passes the prompt and allows the phone PIN fallback', async () => {
    const authenticateAsync = jest.fn(async () => ({ success: true }));
    const service = createAppLockService({ authenticateAsync });
    expect(await service.authenticate({ promptMessage: 'Unlock', cancelLabel: 'Cancel' })).toEqual({ ok: true });
    expect(authenticateAsync).toHaveBeenCalledWith({ promptMessage: 'Unlock', cancelLabel: 'Cancel', disableDeviceFallback: false });
  });

  test('cancelled, failed or crashing checks are not ok', async () => {
    const failing = createAppLockService({ authenticateAsync: async () => ({ success: false, error: 'user_cancel' }) });
    expect(await failing.authenticate()).toEqual({ ok: false });
    const crashing = createAppLockService({ authenticateAsync: async () => { throw new Error('boom'); } });
    expect(await crashing.authenticate()).toEqual({ ok: false });
    const odd = createAppLockService({ authenticateAsync: async () => ({ success: 'true' }) });
    expect(await odd.authenticate()).toEqual({ ok: false });
  });
});

describe('lock rules', () => {
  test('isLocked needs loaded data, App lock on, a signed-in person and no unlock yet', () => {
    const on = { hydrated: true, enabled: true, hasUser: true, unlocked: false };
    expect(isLocked(on)).toBe(true);
    expect(isLocked({ ...on, hydrated: false })).toBe(false);
    expect(isLocked({ ...on, enabled: false })).toBe(false);
    expect(isLocked({ ...on, hasUser: false })).toBe(false);
    expect(isLocked({ ...on, unlocked: true })).toBe(false);
  });

  test('shouldRelock needs the app to have been away for the grace period', () => {
    expect(shouldRelock({ backgroundedAt: 1000, now: 1000 + LOCK_GRACE_MS })).toBe(true);
    expect(shouldRelock({ backgroundedAt: 1000, now: 1000 + LOCK_GRACE_MS - 1 })).toBe(false);
    expect(shouldRelock({ backgroundedAt: null, now: 5000000 })).toBe(false);
    expect(shouldRelock({ backgroundedAt: 1000, now: undefined })).toBe(false);
  });
});

describe('setAppLockEnabled in the budget context', () => {
  const wrapper = ({ children }) => <BudgetProvider>{children}</BudgetProvider>;
  const realUseBudget = jest.requireActual('../context/BudgetContext').useBudget;

  beforeEach(async () => {
    await AsyncStorage.clear();
    useBudget.mockImplementation(realUseBudget);
    appLockService.isAvailable.mockReset().mockResolvedValue(true);
    appLockService.authenticate.mockReset().mockResolvedValue({ ok: true });
  });

  async function start() {
    const hook = await renderHook(() => useBudget(), { wrapper });
    await waitFor(() => expect(hook.result.current.hydrated).toBe(true));
    return hook;
  }

  test('turns on after the person proves it is them', async () => {
    const { result } = await start();
    let outcome;
    await act(async () => {
      outcome = await result.current.setAppLockEnabled(true, { promptMessage: 'Confirm', cancelLabel: 'Cancel' });
    });
    expect(outcome).toEqual({ ok: true });
    expect(appLockService.authenticate).toHaveBeenCalledWith({ promptMessage: 'Confirm', cancelLabel: 'Cancel' });
    expect(result.current.appLockEnabled).toBe(true);
  });

  test('cannot turn on without a screen lock on the phone', async () => {
    appLockService.isAvailable.mockResolvedValue(false);
    const { result } = await start();
    let outcome;
    await act(async () => {
      outcome = await result.current.setAppLockEnabled(true);
    });
    expect(outcome).toEqual({ ok: false, reason: 'unavailable' });
    expect(appLockService.authenticate).not.toHaveBeenCalled();
    expect(result.current.appLockEnabled).toBe(false);
  });

  test('stays unchanged when the person fails or cancels the check', async () => {
    appLockService.authenticate.mockResolvedValue({ ok: false });
    const { result } = await start();
    let outcome;
    await act(async () => {
      outcome = await result.current.setAppLockEnabled(true);
    });
    expect(outcome).toEqual({ ok: false, reason: 'failed' });
    expect(result.current.appLockEnabled).toBe(false);
  });

  test('turning it off also needs proof, unless the phone has no screen lock any more', async () => {
    const { result } = await start();
    await act(async () => {
      await result.current.setAppLockEnabled(true);
    });
    appLockService.authenticate.mockResolvedValue({ ok: false });
    let outcome;
    await act(async () => {
      outcome = await result.current.setAppLockEnabled(false);
    });
    expect(outcome).toEqual({ ok: false, reason: 'failed' });
    expect(result.current.appLockEnabled).toBe(true);

    appLockService.isAvailable.mockResolvedValue(false);
    await act(async () => {
      outcome = await result.current.setAppLockEnabled(false);
    });
    expect(outcome).toEqual({ ok: true });
    expect(result.current.appLockEnabled).toBe(false);
  });

  test('asking for the state it already has does nothing', async () => {
    const { result } = await start();
    await act(async () => {
      await result.current.setAppLockEnabled(false);
    });
    expect(appLockService.authenticate).not.toHaveBeenCalled();
  });
});

describe('AppLockGate', () => {
  const budget = { hydrated: true, user: { id: 'u1' }, appLockEnabled: true, updateState: jest.fn() };
  let appStateHandler;
  let nowSpy;

  beforeEach(() => {
    useBudget.mockImplementation(() => budget);
    Object.assign(budget, { hydrated: true, user: { id: 'u1' }, appLockEnabled: true });
    budget.updateState.mockReset();
    appLockService.isAvailable.mockReset().mockResolvedValue(true);
    appLockService.authenticate.mockReset().mockResolvedValue({ ok: true });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((type, handler) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    });
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderGate = () =>
    render(
      <AppLockGate>
        <Text>secret money screen</Text>
      </AppLockGate>
    );

  test('asks to unlock on launch and shows the app once the phone says yes', async () => {
    await renderGate();
    await waitFor(() => expect(screen.queryByTestId('app-lock-screen')).toBeNull());
    expect(appLockService.authenticate).toHaveBeenCalledWith({ promptMessage: 'Unlock Fundazaka', cancelLabel: 'Cancel' });
    expect(screen.getByText('secret money screen')).toBeTruthy();
  });

  test('stays locked, with a message, when the check fails; Unlock tries again', async () => {
    appLockService.authenticate.mockResolvedValueOnce({ ok: false });
    await renderGate();
    await waitFor(() => expect(screen.getByText('We could not confirm it was you. Please try again.')).toBeTruthy());
    expect(screen.getByTestId('app-lock-screen')).toBeTruthy();
    expect(screen.getByText('Fundazaka is locked')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Unlock'));
    await waitFor(() => expect(screen.queryByTestId('app-lock-screen')).toBeNull());
    expect(appLockService.authenticate).toHaveBeenCalledTimes(2);
  });

  test('does nothing when App lock is off, nobody is signed in, or data has not loaded', async () => {
    for (const change of [{ appLockEnabled: false }, { user: null }, { hydrated: false }]) {
      Object.assign(budget, { hydrated: true, user: { id: 'u1' }, appLockEnabled: true }, change);
      appLockService.authenticate.mockClear();
      const view = await renderGate();
      expect(screen.queryByTestId('app-lock-screen')).toBeNull();
      expect(appLockService.authenticate).not.toHaveBeenCalled();
      await view.unmount();
    }
  });

  test('switches App lock off when the phone no longer has a screen lock', async () => {
    appLockService.isAvailable.mockResolvedValue(false);
    await renderGate();
    await waitFor(() => expect(budget.updateState).toHaveBeenCalledWith({ appLockEnabled: false }));
    expect(appLockService.authenticate).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByTestId('app-lock-screen')).toBeNull());
  });

  test('locks again after a long time in the background, but not after a short one', async () => {
    await renderGate();
    await waitFor(() => expect(screen.queryByTestId('app-lock-screen')).toBeNull());
    appLockService.authenticate.mockClear();

    // away for 5 seconds: stays unlocked
    nowSpy.mockReturnValue(2000000);
    await act(async () => appStateHandler('background'));
    nowSpy.mockReturnValue(2005000);
    await act(async () => appStateHandler('active'));
    expect(appLockService.authenticate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('app-lock-screen')).toBeNull();

    // away for 2 minutes: asks again
    appLockService.authenticate.mockResolvedValue({ ok: false });
    nowSpy.mockReturnValue(3000000);
    await act(async () => appStateHandler('background'));
    nowSpy.mockReturnValue(3120000);
    await act(async () => appStateHandler('active'));
    await waitFor(() => expect(appLockService.authenticate).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('app-lock-screen')).toBeTruthy();
  });

  test('turning App lock on does not lock the screen the person is already on', async () => {
    budget.appLockEnabled = false;
    const view = await renderGate();
    await waitFor(() => expect(screen.queryByTestId('app-lock-screen')).toBeNull());
    budget.appLockEnabled = true;
    await view.rerender(
      <AppLockGate>
        <Text>secret money screen</Text>
      </AppLockGate>
    );
    expect(screen.queryByTestId('app-lock-screen')).toBeNull();
    expect(appLockService.authenticate).not.toHaveBeenCalled();
  });
});
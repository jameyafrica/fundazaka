import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import SettingsScreen from '../app/settings';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => ({ replace: jest.fn(), push: jest.fn() }) }));
jest.mock('../components/ScreenBackground', () => () => null);
jest.mock('../components/NavBar', () => () => null);
jest.mock('../components/LanguagePicker', () => () => null);

const mockBudget = {
  user: { id: 'u1', email: 'thandi@example.com' },
  isGuest: false,
  displayName: 'Thandi',
  resetDay: 25,
  signOut: jest.fn(),
  deleteLocalData: jest.fn(),
};
jest.mock('../context/BudgetContext', () => ({ useBudget: () => mockBudget }));

describe('Settings: Delete my data', () => {
  let alertSpy;
  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockBudget.deleteLocalData.mockReset();
  });
  afterEach(() => alertSpy.mockRestore());

  test('asks for confirmation and deletes nothing yet', async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Delete my data'));
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, body, buttons] = alertSpy.mock.calls[0];
    expect(title).toBe('Delete all data on this phone?');
    expect(body).toMatch(/cannot be undone/i);
    expect(buttons.map((b) => b.text)).toEqual(['Cancel', 'Delete everything']);
    expect(buttons[0].style).toBe('cancel');
    expect(buttons[1].style).toBe('destructive');
    expect(mockBudget.deleteLocalData).not.toHaveBeenCalled();
  });

  test('deletes only after the person confirms', async () => {
    mockBudget.deleteLocalData.mockResolvedValue({ ok: true });
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Delete my data'));
    const buttons = alertSpy.mock.calls[0][2];
    await act(async () => {
      await buttons[1].onPress();
    });
    expect(mockBudget.deleteLocalData).toHaveBeenCalledTimes(1);
  });

  test('shows an error when something could not be deleted', async () => {
    mockBudget.deleteLocalData.mockResolvedValue({ ok: false });
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Delete my data'));
    const buttons = alertSpy.mock.calls[0][2];
    await act(async () => {
      await buttons[1].onPress();
    });
    expect(alertSpy).toHaveBeenCalledTimes(2);
    expect(alertSpy.mock.calls[1][1]).toBe('We could not delete everything. Please try again.');
  });
});
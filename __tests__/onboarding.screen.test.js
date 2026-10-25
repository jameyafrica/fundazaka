import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import OnboardingExpensesScreen from '../app/(auth)/onboarding-expenses';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

const mockBudget = {
  user: { id: 'u1', email: 'a@b.co' },
  categories: [],
  resetDay: null,
  onboardingCompleted: false,
  tourCompleted: false,
  resetPending: false,
  saveSetup: jest.fn(() => ({ ok: true })),
  runReset: jest.fn(),
};
jest.mock('../context/BudgetContext', () => ({ useBudget: () => mockBudget }));

// Icons and the background picture are not needed to test the flow.
jest.mock('../components/icons/OnboardingExpensesIconRent', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconTransport', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconDebitOrders', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconGroceries', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconSaving', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesButtonNextBottomRight', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingConfirmButtonCheckCenter', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingConfirmIconCloseBottomRight', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../assets/icons/background-splash.png', () => 1, { virtual: true });

async function goToDayStep() {
  await render(<OnboardingExpensesScreen />);
  await fireEvent.press(screen.getByText('Rent'));
  await fireEvent.press(screen.getByText('Transport'));
  await fireEvent.press(screen.getByText('Debit Orders'));
  await fireEvent.press(screen.getByLabelText('Next'));
  const inputs = screen.getAllByPlaceholderText('0');
  expect(inputs).toHaveLength(3);
  for (const input of inputs) await fireEvent.changeText(input, '500');
  await fireEvent.press(screen.getByLabelText('Next'));
}

describe('Onboarding: targets and reset day', () => {
  test('every target card shows the full expense name with a labelled amount field', async () => {
    await render(<OnboardingExpensesScreen />);
    await fireEvent.press(screen.getByText('Rent'));
    await fireEvent.press(screen.getByText('Transport'));
    await fireEvent.press(screen.getByText('Debit Orders'));
    await fireEvent.press(screen.getByLabelText('Next'));

    ['Rent', 'Transport', 'Debit Orders'].forEach((name) => {
      const title = screen.getByText(name);
      expect(title.props.numberOfLines).toBe(1); // the name stays on one line
      expect(screen.getByLabelText(`${name} Target:`)).toBeTruthy();
    });
    expect(screen.getAllByText('Target:')).toHaveLength(3);
  });

  test('the Next arrow is there while choosing the day', async () => {
    await goToDayStep();
    expect(screen.getByText('Please choose the day your targets reset each month.')).toBeTruthy();
    expect(screen.getByLabelText('Next')).toBeTruthy();
  });

  test('the Next arrow is gone once the confirmation box is open', async () => {
    await goToDayStep();
    await fireEvent.press(screen.getByText('17'));
    await fireEvent.press(screen.getByLabelText('Next'));

    expect(screen.getByText('Save expenses and reset date?')).toBeTruthy();
    expect(screen.queryByLabelText('Next')).toBeNull();
    expect(screen.getByLabelText('Cancel')).toBeTruthy();
    expect(screen.getByLabelText('Save')).toBeTruthy();
  });

  test('cancelling the confirmation goes back to choosing expenses and saves nothing', async () => {
    mockBudget.saveSetup.mockClear();
    await goToDayStep();
    await fireEvent.press(screen.getByText('17'));
    await fireEvent.press(screen.getByLabelText('Next'));
    await fireEvent.press(screen.getByLabelText('Cancel'));
    expect(screen.queryByText('Save expenses and reset date?')).toBeNull();
    expect(screen.getByText('Please select the expenses that matter most to you.')).toBeTruthy();
    expect(mockBudget.saveSetup).not.toHaveBeenCalled();
  });

  test('saving from the confirmation stores the setup', async () => {
    await goToDayStep();
    await fireEvent.press(screen.getByText('17'));
    await fireEvent.press(screen.getByLabelText('Next'));
    await fireEvent.press(screen.getByLabelText('Save'));
    expect(mockBudget.saveSetup).toHaveBeenCalledWith(
      [
        { key: 'rent', targetAmount: '500' },
        { key: 'transport', targetAmount: '500' },
        { key: 'debit', targetAmount: '500' },
      ],
      17
    );
  });
});
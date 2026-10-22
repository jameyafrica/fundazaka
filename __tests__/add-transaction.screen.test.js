import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AddTransactionScreen from '../app/add-transaction';
import { getCategoryVisual } from '../utils/budgetMath';

let mockParams = {};
const mockLogIncome = jest.fn(() => ({ ok: true }));
const mockPayExpense = jest.fn(() => ({ ok: true }));
let mockBudget;

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('../context/BudgetContext', () => ({ useBudget: () => mockBudget }));
jest.mock('../components/ScreenBackground', () => () => null);
jest.mock('../components/CategoryIcon', () => () => null);

const row = (key, spentAmount, targetAmount) => ({
  key,
  spentAmount,
  targetAmount,
  visual: getCategoryVisual(key, spentAmount, targetAmount),
});

beforeEach(() => {
  mockLogIncome.mockClear();
  mockPayExpense.mockClear();
  mockBudget = {
    user: { id: 'u1' },
    categoryRows: [row('transport', 1100, 1200), row('savings', 450, 500)],
    logIncome: mockLogIncome,
    payExpense: mockPayExpense,
  };
});

const typeAmount = async (text) => {
  await fireEvent.changeText(screen.getByLabelText('Amount in rand'), text);
};

describe('Add transaction: expenses', () => {
  test('warns in orange when the expense pushes a category over target', async () => {
    mockParams = { type: 'expense', category: 'transport' };
    await render(<AddTransactionScreen />);
    await typeAmount('200');
    expect(screen.getByText('This puts Transport R100 over target.')).toBeTruthy();
  });

  test('shows what is left when still under target', async () => {
    mockParams = { type: 'expense', category: 'transport' };
    await render(<AddTransactionScreen />);
    await typeAmount('50');
    expect(screen.getByText('R50 will be left in Transport.')).toBeTruthy();
  });

  test('savings never shows an over-target warning and uses Add Savings', async () => {
    mockParams = { type: 'expense', category: 'savings' };
    await render(<AddTransactionScreen />);
    await typeAmount('100');
    expect(screen.getByText('Target reached. That is R50 extra saved!')).toBeTruthy();
    expect(screen.queryByText(/over target/)).toBeNull();
    expect(screen.getAllByText(/Add Savings/).length).toBeGreaterThan(0);
  });

  test('pays the expense with the amount, category and note', async () => {
    mockParams = { type: 'expense', category: 'transport' };
    await render(<AddTransactionScreen />);
    await typeAmount('50');
    await fireEvent.changeText(screen.getByLabelText('Note'), 'Taxi');
    await fireEvent.press(screen.getByText(/\u00B7 R50$/));
    expect(mockPayExpense).toHaveBeenCalledWith({ amount: 50, categoryKey: 'transport', note: 'Taxi' });
  });

  test('does not save until an amount is entered', async () => {
    mockParams = { type: 'expense', category: 'transport' };
    await render(<AddTransactionScreen />);
    // The heading and the save button both read "Pay Expense", so target the button by role.
    const saveButton = screen.getByRole('button', { name: 'Pay Expense' });
    expect(saveButton).toBeDisabled();
    await fireEvent.press(saveButton);
    expect(mockPayExpense).not.toHaveBeenCalled();
  });
});

describe('Add transaction: income', () => {
  test('logs income with the chosen source tag', async () => {
    mockParams = { type: 'income' };
    await render(<AddTransactionScreen />);
    await fireEvent.press(screen.getByText('Gift'));
    await typeAmount('300');
    await fireEvent.press(screen.getByText(/\u00B7 R300$/));
    expect(mockLogIncome).toHaveBeenCalledWith({ amount: 300, source: 'gift', note: '' });
  });

  test('accepts a comma decimal like 1500,50', async () => {
    mockParams = { type: 'income' };
    await render(<AddTransactionScreen />);
    await typeAmount('1500,50');
    await fireEvent.press(screen.getByText(/\u00B7/));
    expect(mockLogIncome).toHaveBeenCalledWith({ amount: 1500.5, source: 'work', note: '' });
  });
});

import React from 'react';
import { Share } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AddTransactionScreen from '../app/add-transaction';
import BreakdownScreen from '../app/breakdown';
import IncomeProofScreen from '../app/income-proof';
import OnboardingExpensesScreen from '../app/(auth)/onboarding-expenses';
import UndoSnackbar from '../components/UndoSnackbar';
import { getCategoryVisual } from '../utils/budgetMath';

let mockParams = {};
let mockBudget;
const mockBack = jest.fn();

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: mockBack, canGoBack: () => true, replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('../context/BudgetContext', () => ({ useBudget: () => mockBudget }));
jest.mock('../components/ScreenBackground', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/CategoryIcon', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/NavBar', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconRent', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconTransport', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconDebitOrders', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconGroceries', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesIconSaving', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingExpensesButtonNextBottomRight', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingConfirmButtonCheckCenter', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../components/icons/OnboardingConfirmIconCloseBottomRight', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../assets/icons/background-splash.png', () => 1, { virtual: true });

const row = (key, spentAmount, targetAmount) => ({ key, spentAmount, targetAmount, visual: getCategoryVisual(key, spentAmount, targetAmount) });
const inc = (id, amount, day) => ({ id, type: 'income', source: 'work', amount, note: '', createdAt: new Date(2026, 9, day, 12).toISOString() });
const NOW = new Date(2026, 9, 25, 12).toISOString();

beforeEach(() => {
  mockParams = {};
  mockBack.mockClear();
  mockBudget = {
    user: { id: 'u1' },
    displayName: 'Thandi',
    categoryRows: [row('transport', 100, 1200), row('savings', 100, 500)],
    categories: [],
    transactions: [inc('a', 1000, 1), inc('b', 1200, 5), inc('c', 900, 9)],
    monthlyReports: [],
    cycleStartedAt: NOW,
    logIncome: jest.fn(() => ({ ok: true })),
    payExpense: jest.fn(() => ({ ok: true })),
    removeTransaction: jest.fn(() => ({ ok: true })),
    updateTransaction: jest.fn(() => ({ ok: true })),
  };
});

describe('windfall prompt after logging income', () => {
  const logIncome = async (amount) => {
    mockParams = { type: 'income' };
    await render(<AddTransactionScreen />);
    await fireEvent.changeText(screen.getByLabelText('Amount in rand'), String(amount));
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`Add Income .* R`) }));
  };

  test('a payment well above the usual size shows the split and a one-tap Add to savings', async () => {
    await logIncome(2500);
    expect(mockBudget.logIncome).toHaveBeenCalledWith({ amount: 2500, source: 'work', note: '' });
    expect(screen.getByText(/Zak suggests/)).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Add to savings'));
    expect(mockBudget.payExpense).toHaveBeenCalledWith({ amount: 500, categoryKey: 'savings', note: 'Windfall' });
    expect(mockBack).toHaveBeenCalled();
  });

  test('a normal payment just saves and closes', async () => {
    await logIncome(1100);
    expect(screen.queryByText(/Zak suggests/)).toBeNull();
    expect(mockBack).toHaveBeenCalled();
  });

  test('Not now closes without touching savings', async () => {
    await logIncome(2500);
    await fireEvent.press(screen.getByLabelText('Done'));
    expect(mockBudget.payExpense).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  test('without a Savings category the prompt explains how to get one-tap saving', async () => {
    mockBudget.categoryRows = [row('transport', 100, 1200)];
    await logIncome(2500);
    expect(screen.getByText(/Add Savings as one of your expenses/)).toBeTruthy();
    expect(screen.queryByLabelText('Add to savings')).toBeNull();
  });

  test('an income that fails to save does not show the prompt', async () => {
    mockBudget.logIncome = jest.fn(() => ({ ok: false, error: 'nope' }));
    await logIncome(2500);
    expect(screen.queryByText(/Zak suggests/)).toBeNull();
    expect(screen.getByText('nope')).toBeTruthy();
  });
});

describe('breakdown: delete and edit this cycle', () => {
  beforeEach(() => {
    mockBudget.categories = [{ key: 'transport', targetAmount: 1200 }];
    mockBudget.transactions = [
      { id: 'x1', type: 'expense', categoryKey: 'transport', amount: 15000, note: 'typo', createdAt: new Date(2026, 9, 20, 12).toISOString() },
    ];
  });

  test('a mistyped entry can be deleted', async () => {
    await render(<BreakdownScreen />);
    await fireEvent.press(screen.getByLabelText(/^Delete Transport/));
    expect(mockBudget.removeTransaction).toHaveBeenCalledWith('x1');
  });

  test('a mistyped amount can be corrected in place', async () => {
    await render(<BreakdownScreen />);
    await fireEvent.press(screen.getByLabelText(/^Edit Transport/));
    await fireEvent.changeText(screen.getByLabelText('Edit amount in rand'), '150');
    await fireEvent.press(screen.getByLabelText('Save changes'));
    expect(mockBudget.updateTransaction).toHaveBeenCalledWith('x1', { amount: '150', note: 'typo' });
  });

  test('a refused edit shows the reason and keeps the box open', async () => {
    mockBudget.updateTransaction = jest.fn(() => ({ ok: false, error: 'Please enter an amount greater than R0.' }));
    await render(<BreakdownScreen />);
    await fireEvent.press(screen.getByLabelText(/^Edit Transport/));
    await fireEvent.changeText(screen.getByLabelText('Edit amount in rand'), '0');
    await fireEvent.press(screen.getByLabelText('Save changes'));
    expect(screen.getByText('Please enter an amount greater than R0.')).toBeTruthy();
  });

  test('archived months are history: no Edit or Delete there', async () => {
    mockBudget.monthlyReports = [
      {
        id: 'r1',
        periodStart: new Date(2026, 8, 1).toISOString(),
        periodEnd: new Date(2026, 9, 1).toISOString(),
        totalIncome: 2000,
        categories: [{ key: 'transport', targetAmount: 1200 }],
        transactions: [{ id: 'old', type: 'expense', categoryKey: 'transport', amount: 300, note: '', createdAt: new Date(2026, 8, 5, 12).toISOString() }],
      },
    ];
    await render(<BreakdownScreen />);
    await fireEvent.press(screen.getByText('Previous Months'));
    expect(screen.queryByLabelText(/^Delete /)).toBeNull();
    expect(screen.queryByLabelText(/^Edit /)).toBeNull();
  });

  test('Proof of income only appears once a month has been archived', async () => {
    await render(<BreakdownScreen />);
    expect(screen.queryByLabelText('Proof of income')).toBeNull();
  });
});

describe('undo snackbar', () => {
  test('names what changed and undoes it with one tap', async () => {
    const undoLast = jest.fn();
    mockBudget = {
      undoEntry: { kind: 'removed', transaction: { id: 'x', type: 'expense', categoryKey: 'transport', amount: 15000 } },
      undoLast,
      dismissUndo: jest.fn(),
    };
    await render(<UndoSnackbar />);
    expect(screen.getByText('R15\u00A0000 Transport deleted')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Undo'));
    expect(undoLast).toHaveBeenCalled();
  });

  test('shows nothing when there is nothing to undo', async () => {
    mockBudget = { undoEntry: null, undoLast: jest.fn(), dismissUndo: jest.fn() };
    await render(<UndoSnackbar />);
    expect(screen.queryByLabelText('Undo')).toBeNull();
  });

  test('hides itself after a few seconds', async () => {
    jest.useFakeTimers();
    const dismissUndo = jest.fn();
    mockBudget = {
      undoEntry: { kind: 'added', transaction: { id: 'x', type: 'income', amount: 500 } },
      undoLast: jest.fn(),
      dismissUndo,
    };
    await render(<UndoSnackbar />);
    expect(screen.getByText('R500 income added')).toBeTruthy();
    jest.advanceTimersByTime(6100);
    expect(dismissUndo).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('proof of income screen', () => {
  const report = (i, income) => ({
    id: `r${i}`,
    periodStart: new Date(2026, i, 1).toISOString(),
    periodEnd: new Date(2026, i + 1, 1).toISOString(),
    totalIncome: income,
    incomeBySource: { work: income, gift: 0, other: 0 },
  });

  test('shows average, lowest and highest and shares a text summary', async () => {
    mockBudget.monthlyReports = [report(7, 4000), report(8, 6000)];
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({});
    await render(<IncomeProofScreen />);
    expect(screen.getByText('R5\u00A0000')).toBeTruthy();
    expect(screen.getAllByText('R4\u00A0000').length).toBeGreaterThan(0); // lowest card and its month row
    expect(screen.getAllByText('R6\u00A0000').length).toBeGreaterThan(0); // highest card and its month row
    expect(screen.getByText(/has not been verified by a bank/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Share income summary'));
    expect(shareSpy).toHaveBeenCalledTimes(1);
    expect(shareSpy.mock.calls[0][0].message).toMatch(/Average per month: R5\u00A0000/);
    shareSpy.mockRestore();
  });

  test('explains itself when no month has finished yet', async () => {
    await render(<IncomeProofScreen />);
    expect(screen.getByText('No finished months yet')).toBeTruthy();
    expect(screen.queryByLabelText('Share income summary')).toBeNull();
  });

  test('a failed share shows a message instead of crashing', async () => {
    mockBudget.monthlyReports = [report(7, 4000)];
    const shareSpy = jest.spyOn(Share, 'share').mockRejectedValue(new Error('no apps'));
    await render(<IncomeProofScreen />);
    await fireEvent.press(screen.getByLabelText('Share income summary'));
    expect(await screen.findByText('Sharing did not work. Please try again.')).toBeTruthy();
    shareSpy.mockRestore();
  });
});

describe("reset review: Zak's suggestion", () => {
  const archived = (i, income) => ({ id: `m${i}`, totalIncome: income });
  const setupReset = (reports) => {
    mockParams = { mode: 'reset' };
    mockBudget = {
      ...mockBudget,
      categories: [
        { key: 'rent', targetAmount: 3500 },
        { key: 'transport', targetAmount: 1200 },
        { key: 'savings', targetAmount: 500 },
      ],
      resetDay: 1,
      onboardingCompleted: true,
      tourCompleted: true,
      resetPending: true,
      monthlyReports: reports,
      runReset: jest.fn(() => ({ ok: true })),
    };
  };

  test('offers smaller targets when they exceed a cautious month, and applies them in one tap', async () => {
    setupReset([archived(1, 5000), archived(2, 5200), archived(3, 4800)]);
    await render(<OnboardingExpensesScreen />);
    expect(screen.getByText("Zak's suggestion")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Use Zak's suggestion"));
    const rent = screen.getByLabelText('Rent Target:');
    const transport = screen.getByLabelText('Transport Target:');
    expect(rent.props.value).toBe('3500'); // rent is a fixed bill, so it stays
    expect(Number(transport.props.value)).toBeLessThan(1200);
    expect(screen.queryByText("Zak's suggestion")).toBeNull(); // the targets now fit
  });

  test('says nothing when targets already fit', async () => {
    setupReset([archived(1, 9000), archived(2, 9500)]);
    await render(<OnboardingExpensesScreen />);
    expect(screen.queryByText("Zak's suggestion")).toBeNull();
  });

  test('says nothing until two finished months exist', async () => {
    setupReset([archived(1, 3000)]);
    await render(<OnboardingExpensesScreen />);
    expect(screen.queryByText("Zak's suggestion")).toBeNull();
  });

  test('never shows during first-time onboarding', async () => {
    mockParams = {};
    mockBudget = { ...mockBudget, categories: [], monthlyReports: [archived(1, 100), archived(2, 100)], saveSetup: jest.fn(), runReset: jest.fn() };
    await render(<OnboardingExpensesScreen />);
    expect(screen.queryByText("Zak's suggestion")).toBeNull();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from '../i18n/LanguageContext';
import AddTransactionScreen from '../app/add-transaction';
import BreakdownScreen from '../app/breakdown';
import SavingsGlow from '../components/SavingsGlow';
import { Text } from 'react-native';
import { getCategoryVisual } from '../utils/budgetMath';

let mockParams = {};
let mockBudget;

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('../context/BudgetContext', () => ({ useBudget: () => mockBudget }));
jest.mock('../components/ScreenBackground', () => () => null);
jest.mock('../components/NavBar', () => () => null);
jest.mock('../components/CategoryIcon', () => () => null);

const row = (key, spentAmount, targetAmount) => ({
  key,
  spentAmount,
  targetAmount,
  visual: getCategoryVisual(key, spentAmount, targetAmount),
});

const inLanguage = async (code, ui) => {
  await AsyncStorage.setItem('fundazaka_language', code);
  await render(<LanguageProvider>{ui}</LanguageProvider>);
  await screen.findAllByText(/./); // wait for the saved language to load
};

beforeEach(async () => {
  await AsyncStorage.clear();
  mockParams = { type: 'expense', category: 'transport' };
  mockBudget = {
    user: { id: 'u1' },
    categoryRows: [row('transport', 1100, 1200), row('savings', 450, 500)],
    logIncome: jest.fn(() => ({ ok: true })),
    payExpense: jest.fn(() => ({ ok: true })),
    transactions: [],
    monthlyReports: [],
    categories: [{ key: 'transport', targetAmount: 1200 }],
    cycleStartedAt: '2026-10-01T08:00:00.000Z',
    removeTransaction: jest.fn(),
    updateTransaction: jest.fn(() => ({ ok: true })),
  };
});

describe('screens in another language', () => {
  test('Add expense is fully in Afrikaans', async () => {
    await inLanguage('af', <AddTransactionScreen />);
    expect((await screen.findAllByText('Betaal uitgawe')).length).toBeGreaterThan(0); // title and save button
    expect(screen.getByText('Bedrag')).toBeTruthy();
    expect(screen.getByText('Watter uitgawe?')).toBeTruthy();
    expect(screen.getByText('Nota (opsioneel)')).toBeTruthy();
    expect(screen.queryByText('Which expense?')).toBeNull();
  });

  test('Add income shows the source chips in isiZulu', async () => {
    mockParams = { type: 'income' };
    await inLanguage('zu', <AddTransactionScreen />);
    expect(await screen.findByText('Yavelaphi?')).toBeTruthy();
    expect(screen.getByText('Umsebenzi')).toBeTruthy();
    expect(screen.getByText('Isipho')).toBeTruthy();
  });

  test('Breakdown is in Sesotho, with translated months', async () => {
    mockBudget.monthlyReports = [];
    await inLanguage('st', <BreakdownScreen />);
    expect(await screen.findByText('Kgwedi ena')).toBeTruthy();
    expect(screen.getByText('Dikgwedi tse fetileng')).toBeTruthy();
    expect(screen.getByText('Tsohle')).toBeTruthy();
    expect(screen.queryByText('Current Month')).toBeNull();
  });
});

describe('SavingsGlow', () => {
  test('always shows its children, lit or not', async () => {
    await render(
      <>
        <SavingsGlow active style={{ borderRadius: 20 }}>
          <Text>lit card</Text>
        </SavingsGlow>
        <SavingsGlow active={false}>
          <Text>plain card</Text>
        </SavingsGlow>
      </>
    );
    expect(screen.getByText('lit card')).toBeTruthy();
    expect(screen.getByText('plain card')).toBeTruthy();
  });
});
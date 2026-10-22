import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AiBotScreen from '../app/ai-bot';
import { buildDemoState, getTotals, withSpent } from '../utils/budgetActions';

const mockPush = jest.fn();
let mockBudget;

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: mockPush }),
}));
jest.mock('../context/BudgetContext', () => ({ useBudget: () => mockBudget }));
jest.mock('../components/ScreenBackground', () => () => null);
jest.mock('../components/NavBar', () => () => null);

beforeEach(() => {
  mockPush.mockClear();
  const demo = buildDemoState(new Date());
  mockBudget = {
    ...demo,
    categoryRows: withSpent(demo.categories, demo.transactions),
    totals: getTotals(demo.categories, demo.transactions),
  };
});

describe('AI bot (Zak)', () => {
  test('opens with a greeting and says it works offline', async () => {
    await render(<AiBotScreen />);
    expect(screen.getByText(/Howzit, Thandi! I am Zak/)).toBeTruthy();
    expect(screen.getByText(/works offline/)).toBeTruthy();
  });

  test('a suggestion chip asks the question and shows an answer built from the data', async () => {
    await render(<AiBotScreen />);
    await fireEvent.press(screen.getByLabelText('How do I spot a scam?'));
    expect(screen.getAllByText('How do I spot a scam?').length).toBeGreaterThan(0);
    expect(screen.getByText(/never ask for your PIN/)).toBeTruthy();
  });

  test('typing a question and pressing send answers it and clears the box', async () => {
    await render(<AiBotScreen />);
    await fireEvent.changeText(screen.getByLabelText('Message'), 'What is my balance?');
    await fireEvent.press(screen.getByLabelText('Send'));
    expect(screen.getByText(/left this cycle/)).toBeTruthy();
    expect(screen.getByLabelText('Message').props.value).toBe('');
  });

  test('send is disabled until something is typed', async () => {
    await render(<AiBotScreen />);
    expect(screen.getByLabelText('Send')).toBeDisabled();
  });

  test('an answer with a follow-up button navigates there', async () => {
    await render(<AiBotScreen />);
    await fireEvent.changeText(screen.getByLabelText('Message'), 'is this a scam sms');
    await fireEvent.press(screen.getByLabelText('Send'));
    await fireEvent.press(screen.getByLabelText('Open scam course'));
    expect(mockPush).toHaveBeenCalledWith('/learning/scam-awareness');
  });
});

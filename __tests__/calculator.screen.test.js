import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import CalculatorScreen from '../app/calculator';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('../context/BudgetContext', () => ({ useBudget: () => ({ user: { id: 'u1' } }) }));
jest.mock('../components/ScreenBackground', () => () => null);

const tap = async (label) => { await fireEvent.press(screen.getByLabelText(label)); };
const tapAll = async (labels) => {
  for (const label of labels) await tap(label);
};

describe('Calculator screen', () => {
  test('starts at 0', async () => {
    await render(<CalculatorScreen />);
    expect(screen.getByLabelText('Display 0')).toBeTruthy();
  });

  test('adds two amounts and shows the grouped result', async () => {
    await render(<CalculatorScreen />);
    await tapAll(['1', '5', '0', '0', 'Add', '2', '5', '0', 'Equals']);
    expect(screen.getByLabelText('Display 1\u00A0750')).toBeTruthy();
  });

  test('shows Error for divide by zero and recovers', async () => {
    await render(<CalculatorScreen />);
    await tapAll(['5', 'Divide', '0', 'Equals']);
    expect(screen.getByText('Error')).toBeTruthy();
    await tap('7');
    expect(screen.getByLabelText('Display 7')).toBeTruthy();
  });

  test('AC clears everything', async () => {
    await render(<CalculatorScreen />);
    await tapAll(['9', '9', 'All clear']);
    expect(screen.getByLabelText('Display 0')).toBeTruthy();
  });
});

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import NextPaymentCard from '../components/NextPaymentCard';

const upcoming = { kind: 'upcoming', date: 'Thu 29 Oct', days: 4, low: 950, high: 1050, typical: 1000, confidence: 'medium' };

describe('NextPaymentCard', () => {
  test('shows the likely date, the usual amounts and how sure Zak is', async () => {
    await render(<NextPaymentCard card={upcoming} onPress={jest.fn()} />);
    expect(screen.getByText('Next payment')).toBeTruthy();
    expect(screen.getByText('Likely around Thu 29 Oct')).toBeTruthy();
    expect(screen.getByText(/Usually R950 to R1 050/)).toBeTruthy();
    expect(screen.getByText('Good guess')).toBeTruthy();
  });

  test('a single usual amount is not shown as a range', async () => {
    await render(<NextPaymentCard card={{ ...upcoming, low: 1000, high: 1000 }} onPress={jest.fn()} />);
    expect(screen.getByText(/^Usually R1 000$/)).toBeTruthy();
    expect(screen.queryByText(/ to R/)).toBeNull();
  });

  test('says due about now on the expected day', async () => {
    await render(<NextPaymentCard card={{ ...upcoming, kind: 'today' }} onPress={jest.fn()} />);
    expect(screen.getByText('Due about now')).toBeTruthy();
  });

  test('an overdue payment asks the user to go easy on spending', async () => {
    await render(<NextPaymentCard card={{ ...upcoming, kind: 'overdue' }} onPress={jest.fn()} />);
    expect(screen.getByText(/Overdue by my count/)).toBeTruthy();
  });

  test('a new user is asked to keep logging, with no amounts or confidence tag', async () => {
    await render(<NextPaymentCard card={{ kind: 'learning', count: 3, seen: 1 }} onPress={jest.fn()} />);
    expect(screen.getByText(/After 3 pay days I can predict your next payment/)).toBeTruthy();
    expect(screen.queryByText(/Usually/)).toBeNull();
    expect(screen.queryByText('Good guess')).toBeNull();
  });

  test('tapping the card calls onPress', async () => {
    const onPress = jest.fn();
    await render(<NextPaymentCard card={upcoming} onPress={onPress} />);
    await fireEvent.press(screen.getByLabelText('Next payment forecast. Opens Zak.'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('renders nothing without a card', async () => {
    await render(<NextPaymentCard card={null} onPress={jest.fn()} />);
    expect(screen.queryByText('Next payment')).toBeNull();
  });
});
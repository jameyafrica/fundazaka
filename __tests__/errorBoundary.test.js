import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ErrorBoundary from '../components/ErrorBoundary';

let shouldCrash = true;
function Bomb() {
  if (shouldCrash) throw new Error('boom');
  return <Text>All good</Text>;
}

describe('error boundary', () => {
  let spy;
  beforeEach(() => {
    shouldCrash = true;
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => spy.mockRestore());

  test('shows a calm message instead of a blank screen when a screen crashes', async () => {
    await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  test('renders children normally when nothing crashes', async () => {
    shouldCrash = false;
    await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  test('Try again recovers once the problem is gone', async () => {
    await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    shouldCrash = false;
    await fireEvent.press(screen.getByText('Try again'));
    expect(screen.getByText('All good')).toBeTruthy();
  });

  test('Back to dashboard calls the go-home action', async () => {
    const onGoHome = jest.fn();
    await render(
      <ErrorBoundary onGoHome={onGoHome}>
        <Bomb />
      </ErrorBoundary>
    );
    await fireEvent.press(screen.getByText('Back to dashboard'));
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  test('Back to dashboard survives navigation itself failing', async () => {
    const failing = jest.fn(() => {
      throw new Error('no navigator');
    });
    await render(
      <ErrorBoundary onGoHome={failing}>
        <Bomb />
      </ErrorBoundary>
    );
    await fireEvent.press(screen.getByText('Back to dashboard'));
    expect(failing).toHaveBeenCalled();
  });

  test('reports the error to onError', async () => {
    const onError = jest.fn();
    await render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('boom');
  });
});

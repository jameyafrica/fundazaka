import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import QuizScreen from '../app/learning/quiz';
import { COURSES } from '../constants/courses';
import { initialLearning } from '../utils/learning';

const mockSubmitQuiz = jest.fn();

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  Redirect: () => null,
  useLocalSearchParams: () => ({ courseId: 'budgeting-101' }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('../context/BudgetContext', () => ({
  useBudget: () => ({
    user: { id: 'u1' },
    learning: require('../utils/learning').initialLearning,
    submitQuiz: mockSubmitQuiz,
  }),
}));
jest.mock('../components/ScreenBackground', () => () => null);

const course = COURSES.find((c) => c.id === 'budgeting-101');

describe('Quiz screen', () => {
  beforeEach(() => {
    mockSubmitQuiz.mockReset();
    mockSubmitQuiz.mockReturnValue({
      ok: true,
      result: { correct: 4, total: 4, percent: 100, passed: true },
      newBadges: ['quiz-ace'],
    });
  });

  test('walks through every question, submits the answers once, and shows the result and badge', async () => {
    await render(<QuizScreen />);
    expect(screen.getByText(`Question 1 of ${course.quiz.length}`)).toBeTruthy();

    for (const [i, q] of course.quiz.entries()) {
      await fireEvent.press(screen.getByText(q.options[q.correctIndex]));
      await fireEvent.press(screen.getByText(i === course.quiz.length - 1 ? 'See results' : 'Next question'));
    }

    expect(mockSubmitQuiz).toHaveBeenCalledTimes(1);
    expect(mockSubmitQuiz).toHaveBeenCalledWith('budgeting-101', course.quiz.map((q) => q.correctIndex));
    expect(screen.getByText('4/4')).toBeTruthy();
    expect(screen.getByText('New badge: Quiz Ace')).toBeTruthy();
  });

  test('shows the explanation after answering and blocks Next until then', async () => {
    await render(<QuizScreen />);
    const q = course.quiz[0];
    const wrong = q.options.findIndex((_, i) => i !== q.correctIndex);
    await fireEvent.press(screen.getByText('Next question')); // ignored: nothing answered yet
    expect(screen.getByText(`Question 1 of ${course.quiz.length}`)).toBeTruthy();
    await fireEvent.press(screen.getByText(q.options[wrong]));
    expect(screen.getByText('Not quite.')).toBeTruthy();
    expect(screen.getByText(q.explanation)).toBeTruthy();
  });
});

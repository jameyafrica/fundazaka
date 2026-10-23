import { COURSES } from '../constants/courses.js';
import { BADGES } from '../constants/badges.js';
import {
  completeLesson,
  daysBetween,
  evaluateBadges,
  getCourseProgress,
  getCurrentStreak,
  getNextLesson,
  getReadMinutes,
  initialLearning,
  localDateKey,
  normalizeLearning,
  scoreQuiz,
  submitQuiz,
  updateStreak,
} from '../utils/learning.js';

const day = (offset, hour = 12) => new Date(2026, 9, 10 + offset, hour);
const budgeting = COURSES[0];
const scam = COURSES.find((c) => c.id === 'scam-awareness');
const perfectAnswers = (course) => course.quiz.map((q) => q.correctIndex);

describe('bundled content', () => {
  test('there are the four required courses', () => {
    expect(COURSES.map((c) => c.id)).toEqual(['budgeting-101', 'saving-matters', 'wise-credit', 'scam-awareness']);
  });

  test('ids are unique across lessons and questions', () => {
    const ids = COURSES.flatMap((c) => [...c.lessons.map((l) => l.id), ...c.quiz.map((q) => q.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every course has lessons and a quiz with a valid correct answer', () => {
    COURSES.forEach((course) => {
      expect(course.lessons.length).toBeGreaterThan(0);
      expect(course.quiz.length).toBeGreaterThan(0);
      course.quiz.forEach((q) => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(0);
      });
    });
  });

  test('every badge id used by the rules exists', () => {
    const known = BADGES.map((b) => b.id);
    ['first-lesson', 'streak-3', 'streak-7', 'quiz-ace', 'scam-smart', 'graduate'].forEach((id) => {
      expect(known).toContain(id);
    });
  });

  test('read time is at least one minute', () => {
    COURSES.forEach((c) => c.lessons.forEach((l) => expect(getReadMinutes(l)).toBeGreaterThanOrEqual(1)));
  });
});

describe('local date helpers', () => {
  test('localDateKey uses the local calendar date', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDateKey(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
  });

  test('daysBetween counts whole days across month and year ends', () => {
    expect(daysBetween('2026-10-10', '2026-10-11')).toBe(1);
    expect(daysBetween('2026-10-31', '2026-11-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2026-10-10', '2026-10-10')).toBe(0);
    expect(daysBetween('2026-10-12', '2026-10-10')).toBe(-2);
  });
});

describe('streak rules', () => {
  test('first ever activity starts a streak of 1', () => {
    expect(updateStreak(initialLearning, day(0)).streak).toBe(1);
  });

  test('a second activity on the same day does not add to the streak', () => {
    const first = { ...initialLearning, ...updateStreak(initialLearning, day(0, 8)) };
    expect(updateStreak(first, day(0, 22)).streak).toBe(1);
  });

  test('learning on consecutive days extends the streak', () => {
    let l = { ...initialLearning, ...updateStreak(initialLearning, day(0)) };
    l = { ...l, ...updateStreak(l, day(1)) };
    l = { ...l, ...updateStreak(l, day(2)) };
    expect(l.streak).toBe(3);
    expect(l.bestStreak).toBe(3);
  });

  test('11pm and 1am the next day are consecutive days, not the same day', () => {
    const l = { ...initialLearning, ...updateStreak(initialLearning, day(0, 23)) };
    expect(updateStreak(l, day(1, 1)).streak).toBe(2);
  });

  test('missing a whole day resets the streak but keeps the best', () => {
    let l = { ...initialLearning, ...updateStreak(initialLearning, day(0)) };
    l = { ...l, ...updateStreak(l, day(1)) };
    const after = updateStreak(l, day(3));
    expect(after.streak).toBe(1);
    expect(after.bestStreak).toBe(2);
  });

  test('a clock moved backwards does not break or double-count the streak', () => {
    let l = { ...initialLearning, ...updateStreak(initialLearning, day(5)) };
    const after = updateStreak(l, day(2));
    expect(after.streak).toBe(1);
    expect(after.lastActiveDate).toBe(localDateKey(day(5)));
  });

  test('display streak survives until the end of tomorrow, then shows 0', () => {
    const l = { ...initialLearning, streak: 4, bestStreak: 4, lastActiveDate: localDateKey(day(0)) };
    expect(getCurrentStreak(l, day(0))).toBe(4);
    expect(getCurrentStreak(l, day(1))).toBe(4);
    expect(getCurrentStreak(l, day(2))).toBe(0);
    expect(getCurrentStreak(initialLearning, day(0))).toBe(0);
  });
});

describe('lesson completion', () => {
  test('marks a lesson done, starts a streak and awards First Step', () => {
    const result = completeLesson(initialLearning, COURSES, budgeting.id, budgeting.lessons[0].id, day(0));
    expect(result.ok).toBe(true);
    expect(result.learning.completedLessons[budgeting.id]).toEqual([budgeting.lessons[0].id]);
    expect(result.learning.streak).toBe(1);
    expect(result.newBadges).toEqual(['first-lesson']);
  });

  test('re-reading a finished lesson changes nothing and does not extend the streak', () => {
    const first = completeLesson(initialLearning, COURSES, budgeting.id, budgeting.lessons[0].id, day(0));
    const again = completeLesson(first.learning, COURSES, budgeting.id, budgeting.lessons[0].id, day(1));
    expect(again.alreadyDone).toBe(true);
    expect(again.learning.streak).toBe(1);
    expect(again.newBadges).toEqual([]);
  });

  test('unknown course or lesson is rejected', () => {
    expect(completeLesson(initialLearning, COURSES, 'nope', 'x', day(0)).ok).toBe(false);
    expect(completeLesson(initialLearning, COURSES, budgeting.id, 'nope', day(0)).ok).toBe(false);
  });

  test('course progress and next lesson follow completed lessons', () => {
    let l = initialLearning;
    expect(getNextLesson(l, budgeting).id).toBe(budgeting.lessons[0].id);
    budgeting.lessons.forEach((lesson, i) => {
      l = completeLesson(l, COURSES, budgeting.id, lesson.id, day(i)).learning;
    });
    const progress = getCourseProgress(l, budgeting);
    expect(progress.complete).toBe(true);
    expect(progress.fraction).toBe(1);
    expect(getNextLesson(l, budgeting)).toBeNull();
  });
});

describe('quizzes', () => {
  test('scoreQuiz counts correct answers and handles unanswered', () => {
    const questions = budgeting.quiz;
    expect(scoreQuiz(questions, perfectAnswers(budgeting))).toEqual({ correct: 4, total: 4, percent: 100 });
    expect(scoreQuiz(questions, []).correct).toBe(0);
    expect(scoreQuiz([], []).percent).toBe(0);
  });

  test('a perfect quiz awards Quiz Ace and counts as learning today', () => {
    const result = submitQuiz(initialLearning, COURSES, budgeting.id, perfectAnswers(budgeting), day(0));
    expect(result.ok).toBe(true);
    expect(result.result.percent).toBe(100);
    expect(result.result.passed).toBe(true);
    expect(result.newBadges).toContain('quiz-ace');
    expect(result.learning.streak).toBe(1);
  });

  test('keeps the best score, counts attempts, and never lowers the best', () => {
    const good = submitQuiz(initialLearning, COURSES, budgeting.id, perfectAnswers(budgeting), day(0)).learning;
    const bad = submitQuiz(good, COURSES, budgeting.id, [], day(0)).learning;
    expect(bad.quizScores[budgeting.id].bestPercent).toBe(100);
    expect(bad.quizScores[budgeting.id].attempts).toBe(2);
  });

  test('Scam Smart needs 75% on the scam quiz specifically', () => {
    const wrongOne = perfectAnswers(scam).map((a, i) => (i === 0 ? (a + 1) % 4 : a));
    const pass = submitQuiz(initialLearning, COURSES, scam.id, wrongOne, day(0));
    expect(pass.result.percent).toBe(75);
    expect(pass.newBadges).toContain('scam-smart');

    const wrongTwo = perfectAnswers(scam).map((a, i) => (i < 2 ? (a + 1) % 4 : a));
    const fail = submitQuiz(initialLearning, COURSES, scam.id, wrongTwo, day(0));
    expect(fail.result.passed).toBe(false);
    expect(fail.newBadges).not.toContain('scam-smart');

    const other = submitQuiz(initialLearning, COURSES, budgeting.id, perfectAnswers(budgeting), day(0));
    expect(other.newBadges).not.toContain('scam-smart');
  });

  test('unknown course is rejected', () => {
    expect(submitQuiz(initialLearning, COURSES, 'nope', [], day(0)).ok).toBe(false);
  });
});

describe('badges', () => {
  test('streak badges come from the best streak', () => {
    const l = { ...initialLearning, bestStreak: 3 };
    expect(evaluateBadges(l, COURSES)).toContain('streak-3');
    expect(evaluateBadges(l, COURSES)).not.toContain('streak-7');
    expect(evaluateBadges({ ...initialLearning, bestStreak: 7 }, COURSES)).toContain('streak-7');
  });

  test('Graduate needs every lesson in every course', () => {
    let l = initialLearning;
    COURSES.forEach((course, ci) =>
      course.lessons.forEach((lesson, li) => {
        l = completeLesson(l, COURSES, course.id, lesson.id, day(ci * 10 + li)).learning;
      })
    );
    expect(l.badges).toContain('graduate');
  });

  test('badges once earned are kept', () => {
    const l = { ...initialLearning, badges: ['streak-7'] };
    expect(evaluateBadges(l, COURSES)).toContain('streak-7');
  });
});

describe('normalizeLearning', () => {
  test('turns missing or corrupt data into a safe default', () => {
    expect(normalizeLearning(undefined)).toEqual(initialLearning);
    expect(normalizeLearning('garbage')).toEqual(initialLearning);
    expect(normalizeLearning({ streak: -4, lastActiveDate: 'yesterday', badges: 'x' })).toEqual(initialLearning);
  });

  test('keeps valid saved data and drops duplicates', () => {
    const saved = {
      streak: 2,
      bestStreak: 5,
      lastActiveDate: '2026-10-21',
      completedLessons: { 'budgeting-101': ['b101-1', 'b101-1', 'b101-2'] },
      quizScores: {},
      badges: ['first-lesson', 'first-lesson'],
    };
    const clean = normalizeLearning(saved);
    expect(clean.streak).toBe(2);
    expect(clean.completedLessons['budgeting-101']).toEqual(['b101-1', 'b101-2']);
    expect(clean.badges).toEqual(['first-lesson']);
  });
});

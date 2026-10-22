// Pure learning-hub logic: streaks, lesson progress, quiz scoring and badges.
// No React and no storage, so it is easy to test with plain node or Jest.
//
// learning state shape (stored inside BudgetContext, persisted by AsyncStorage):
//   {
//     streak: number,                       // current run of consecutive learning days
//     bestStreak: number,
//     lastActiveDate: 'YYYY-MM-DD' | null,  // LOCAL calendar date of last learning activity
//     completedLessons: { [courseId]: [lessonId] },
//     quizScores: { [courseId]: { bestPercent, bestCorrect, total, attempts } },
//     badges: [badgeId],
//   }

export const initialLearning = {
  streak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  completedLessons: {},
  quizScores: {},
  badges: [],
};

export const PASS_PERCENT = 75;
const WORDS_PER_MINUTE = 200;

// Local calendar date, NOT UTC. A user in South Africa learning at 11pm must still
// count as "today" so their streak does not break at the wrong moment.
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Whole days from key a to key b. Uses UTC midnight for both so daylight saving can never shift it.
export function daysBetween(keyA, keyB) {
  const toUtc = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(keyB) - toUtc(keyA)) / 86400000);
}

export function getReadMinutes(lesson) {
  const text = [...lesson.body, lesson.tip || ''].join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// Makes any saved value safe to use (old app versions, missing fields, corrupt storage).
export function normalizeLearning(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const completedLessons = {};
  if (isObject(src.completedLessons)) {
    Object.keys(src.completedLessons).forEach((courseId) => {
      const list = src.completedLessons[courseId];
      if (Array.isArray(list)) completedLessons[courseId] = [...new Set(list.filter((id) => typeof id === 'string'))];
    });
  }
  return {
    streak: Number.isInteger(src.streak) && src.streak > 0 ? src.streak : 0,
    bestStreak: Number.isInteger(src.bestStreak) && src.bestStreak > 0 ? src.bestStreak : 0,
    lastActiveDate: typeof src.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(src.lastActiveDate) ? src.lastActiveDate : null,
    completedLessons,
    quizScores: isObject(src.quizScores) ? { ...src.quizScores } : {},
    badges: Array.isArray(src.badges) ? [...new Set(src.badges.filter((id) => typeof id === 'string'))] : [],
  };
}

// Applies "the user learned something today" to the streak.
export function updateStreak(learning, now = new Date()) {
  const today = localDateKey(now);
  const last = learning.lastActiveDate;
  let streak;
  if (!last) {
    streak = 1;
  } else {
    const gap = daysBetween(last, today);
    if (gap <= 0) streak = Math.max(learning.streak, 1); // same day (or clock moved back): keep it
    else if (gap === 1) streak = learning.streak + 1;
    else streak = 1; // missed at least one full day
  }
  const lastActiveDate = last && daysBetween(last, today) < 0 ? last : today;
  return { streak, bestStreak: Math.max(learning.bestStreak, streak), lastActiveDate };
}

// What to SHOW as the streak. If the user has not learned since before yesterday,
// the run is over, so display 0 without changing the saved data.
export function getCurrentStreak(learning, now = new Date()) {
  if (!learning.lastActiveDate) return 0;
  const gap = daysBetween(learning.lastActiveDate, localDateKey(now));
  return gap <= 1 ? learning.streak : 0;
}

export function hasLearnedToday(learning, now = new Date()) {
  return learning.lastActiveDate === localDateKey(now);
}

export function getCourseProgress(learning, course) {
  const done = (learning.completedLessons[course.id] || []).filter((id) =>
    course.lessons.some((l) => l.id === id)
  ).length;
  const total = course.lessons.length;
  return { done, total, fraction: total ? done / total : 0, complete: total > 0 && done === total };
}

// First lesson the user has not finished yet, or null if the course is complete.
export function getNextLesson(learning, course) {
  const doneIds = learning.completedLessons[course.id] || [];
  return course.lessons.find((l) => !doneIds.includes(l.id)) || null;
}

export function isLessonDone(learning, courseId, lessonId) {
  return (learning.completedLessons[courseId] || []).includes(lessonId);
}

// answers: array of chosen option indexes (null/undefined = unanswered).
export function scoreQuiz(questions, answers) {
  const total = questions.length;
  const correct = questions.reduce((sum, q, i) => (answers[i] === q.correctIndex ? sum + 1 : sum), 0);
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
}

// Every badge the user has earned so far (includes ones they already had).
export function evaluateBadges(learning, courses) {
  const earned = new Set(learning.badges);
  const totalDone = Object.values(learning.completedLessons).reduce((n, list) => n + list.length, 0);
  if (totalDone >= 1) earned.add('first-lesson');
  if (learning.bestStreak >= 3) earned.add('streak-3');
  if (learning.bestStreak >= 7) earned.add('streak-7');
  if (Object.values(learning.quizScores).some((s) => s && s.bestPercent === 100)) earned.add('quiz-ace');
  const scam = learning.quizScores['scam-awareness'];
  if (scam && scam.bestPercent >= PASS_PERCENT) earned.add('scam-smart');
  if (courses.length > 0 && courses.every((c) => getCourseProgress(learning, c).complete)) earned.add('graduate');
  return [...earned];
}

function withBadges(learning, courses) {
  const badges = evaluateBadges(learning, courses);
  const newBadges = badges.filter((id) => !learning.badges.includes(id));
  return { learning: { ...learning, badges }, newBadges };
}

// Marks a lesson read. A first-time completion counts as learning today; re-reading does not.
export function completeLesson(learning, courses, courseId, lessonId, now = new Date()) {
  const course = courses.find((c) => c.id === courseId);
  if (!course || !course.lessons.some((l) => l.id === lessonId)) {
    return { ok: false, error: 'That lesson could not be found.' };
  }
  if (isLessonDone(learning, courseId, lessonId)) {
    return { ok: true, learning, newBadges: [], alreadyDone: true };
  }
  const next = {
    ...learning,
    ...updateStreak(learning, now),
    completedLessons: {
      ...learning.completedLessons,
      [courseId]: [...(learning.completedLessons[courseId] || []), lessonId],
    },
  };
  return { ok: true, alreadyDone: false, ...withBadges(next, courses) };
}

// Scores a finished quiz, keeps the best result, and counts as learning today.
export function submitQuiz(learning, courses, courseId, answers, now = new Date()) {
  const course = courses.find((c) => c.id === courseId);
  if (!course || !course.quiz || course.quiz.length === 0) {
    return { ok: false, error: 'That quiz could not be found.' };
  }
  const result = scoreQuiz(course.quiz, Array.isArray(answers) ? answers : []);
  const previous = learning.quizScores[courseId];
  const isBest = !previous || result.percent > previous.bestPercent;
  const next = {
    ...learning,
    ...updateStreak(learning, now),
    quizScores: {
      ...learning.quizScores,
      [courseId]: {
        bestPercent: isBest ? result.percent : previous.bestPercent,
        bestCorrect: isBest ? result.correct : previous.bestCorrect,
        total: result.total,
        attempts: (previous ? previous.attempts : 0) + 1,
      },
    },
  };
  return { ok: true, result: { ...result, passed: result.percent >= PASS_PERCENT }, ...withBadges(next, courses) };
}

// Validates saved app state before the app trusts it. Pure: no React, no storage.
//
// Why: the phone's storage is encrypted, but data can still be corrupted, written by an older
// app version, or edited on a rooted/jailbroken device. Anything read back is treated as
// untrusted input. The result is rebuilt from a whitelist of known fields, so unknown keys,
// impossible amounts, fake badges and inconsistent owners never reach the screens.
//
// sanitizeState(raw)      -> clean state object, or null when the data cannot be trusted at all
// parseSavedState(text)   -> same, starting from the saved JSON text

import { CATEGORY_KEYS, INCOME_SOURCES, MAX_CATEGORIES, MIN_CATEGORIES, getTotals, sortCategories, sumIncomeBySource, withSpent } from './budgetActions.js';
import { COURSES } from '../constants/courses.js';
import { GUEST_OWNER } from '../lib/session.js';
import { makeId } from './ids.js';
import { cleanStoredAmount, cleanText } from './money.js';
import { evaluateBadges, normalizeLearning } from './learning.js';
import { isValidResetDay } from './resetDate.js';

export const MAX_STATE_CHARS = 5000000; // saved text larger than this is ignored (about 5 MB)
export const MAX_TRANSACTIONS = 2000; // per list: the current month, and each archived month
export const MAX_REPORTS = 60; // five years of monthly reports
export const MAX_STREAK = 36500;

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanId(value) {
  return typeof value === 'string' && ID_PATTERN.test(value) ? value : null;
}

// A real date between 2000 and 2100, returned as an ISO string. Otherwise null.
function cleanDate(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 40) return null;
  const date = new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;
  const year = date.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  return date.toISOString();
}

// 'YYYY-MM-DD' that is a real calendar day.
function cleanDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const real = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  return real && y >= MIN_YEAR && y <= MAX_YEAR ? value : null;
}

function clampInt(value, min, max, fallback) {
  if (!Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function sanitizeCategories(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const clean = [];
  for (const item of list.slice(0, 50)) {
    if (!isPlainObject(item) || !CATEGORY_KEYS.includes(item.key) || seen.has(item.key)) continue;
    const targetAmount = cleanStoredAmount(item.targetAmount);
    if (targetAmount === null) continue;
    seen.add(item.key);
    clean.push({ key: item.key, targetAmount });
    if (clean.length === MAX_CATEGORIES) break;
  }
  return sortCategories(clean);
}

export function sanitizeTransactions(list, newId = makeId) {
  if (!Array.isArray(list)) return [];
  // Entries are saved oldest first, so when there are too many keep the newest.
  const source = list.length > MAX_TRANSACTIONS ? list.slice(-MAX_TRANSACTIONS) : list;
  const seen = new Set();
  const clean = [];
  for (const item of source) {
    if (!isPlainObject(item)) continue;
    const amount = cleanStoredAmount(item.amount);
    const createdAt = cleanDate(item.createdAt);
    if (amount === null || createdAt === null) continue;
    const note = cleanText(item.note);
    let id = cleanId(item.id);
    if (id === null || seen.has(id)) id = newId(); // the id is only an identity, so repair it
    let entry = null;
    if (item.type === 'income' && INCOME_SOURCES.includes(item.source)) {
      entry = { id, type: 'income', source: item.source, amount, note, createdAt };
    } else if (item.type === 'expense' && CATEGORY_KEYS.includes(item.categoryKey)) {
      entry = { id, type: 'expense', categoryKey: item.categoryKey, amount, note, createdAt };
    }
    if (entry) {
      seen.add(id);
      clean.push(entry);
    }
  }
  return clean;
}

// Archived months. Every total is recomputed from the (cleaned) transactions, never trusted.
export function sanitizeReports(list, newId = makeId) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const clean = [];
  for (const item of list.slice(0, MAX_REPORTS)) {
    if (!isPlainObject(item)) continue;
    const periodEnd = cleanDate(item.periodEnd);
    if (periodEnd === null) continue;
    const categories = sanitizeCategories(item.categories);
    const transactions = sanitizeTransactions(item.transactions, newId);
    let id = cleanId(item.id);
    if (id === null || seen.has(id)) id = newId();
    seen.add(id);
    const totals = getTotals(categories, transactions);
    clean.push({
      id,
      periodStart: cleanDate(item.periodStart),
      periodEnd,
      totalIncome: totals.income,
      totalExpenses: totals.expenses,
      balance: totals.balance,
      incomeBySource: sumIncomeBySource(transactions),
      categories: withSpent(categories, transactions),
      transactions,
    });
  }
  return clean;
}

// Learning progress. Only real lessons and quizzes survive; quiz percentages and badges are
// derived from the progress itself, so they cannot be faked by editing the saved data.
export function sanitizeLearning(raw) {
  const base = normalizeLearning(raw);

  const completedLessons = {};
  COURSES.forEach((course) => {
    const saved = base.completedLessons[course.id];
    if (!Array.isArray(saved)) return;
    const valid = course.lessons.map((lesson) => lesson.id).filter((id) => saved.includes(id));
    if (valid.length > 0) completedLessons[course.id] = valid;
  });

  const quizScores = {};
  COURSES.forEach((course) => {
    const saved = base.quizScores[course.id];
    if (!isPlainObject(saved) || !course.quiz || course.quiz.length === 0) return;
    const total = course.quiz.length;
    const bestCorrect = clampInt(saved.bestCorrect, 0, total, 0);
    quizScores[course.id] = {
      bestPercent: Math.round((bestCorrect / total) * 100),
      bestCorrect,
      total,
      attempts: clampInt(saved.attempts, 1, 100000, 1),
    };
  });

  const lastActiveDate = cleanDateKey(base.lastActiveDate);
  const streak = lastActiveDate ? Math.min(base.streak, MAX_STREAK) : 0;
  const bestStreak = Math.min(Math.max(base.bestStreak, streak), MAX_STREAK);

  const learning = { streak, bestStreak, lastActiveDate, completedLessons, quizScores, badges: [] };
  return { ...learning, badges: evaluateBadges(learning, COURSES) };
}

// Who the saved data belongs to. Returns { ok: false } when the owner fields contradict each other.
function sanitizeIdentity(raw) {
  if (raw.isGuest === true) {
    if (raw.ownerId !== GUEST_OWNER) return { ok: false };
    return { ok: true, isGuest: true, ownerId: GUEST_OWNER, user: { id: GUEST_OWNER } };
  }
  let ownerId = null;
  if (raw.ownerId !== null && raw.ownerId !== undefined) {
    ownerId = cleanId(raw.ownerId);
    if (ownerId === null || ownerId === GUEST_OWNER) return { ok: false }; // not a real account id
  }
  let user = null;
  if (isPlainObject(raw.user)) {
    const userId = cleanId(raw.user.id);
    // With an owner, the signed-in user must be that same owner. Older data has no owner yet.
    if (userId !== null && userId !== GUEST_OWNER && (ownerId === null || userId === ownerId)) {
      user = { id: userId, email: cleanText(raw.user.email, 254) };
    }
  }
  return { ok: true, isGuest: false, ownerId, user };
}

export function sanitizeState(raw, options = {}) {
  if (!isPlainObject(raw)) return null;
  const now = options.now instanceof Date ? options.now : new Date();
  const newId = typeof options.makeId === 'function' ? options.makeId : makeId;

  const identity = sanitizeIdentity(raw);
  if (!identity.ok) return null;

  const categories = sanitizeCategories(raw.categories);
  const resetDay = isValidResetDay(raw.resetDay) ? raw.resetDay : null;
  // Onboarding only counts as done when the setup it produced is still complete and valid.
  const setupComplete =
    raw.onboardingCompleted === true && categories.length >= MIN_CATEGORIES && resetDay !== null;
  let cycleStartedAt = cleanDate(raw.cycleStartedAt);
  if (setupComplete && cycleStartedAt === null) cycleStartedAt = now.toISOString();

  return {
    user: identity.user,
    ownerId: identity.ownerId,
    isGuest: identity.isGuest,
    displayName: cleanText(raw.displayName),
    onboardingCompleted: setupComplete,
    tourCompleted: raw.tourCompleted === true,
    resetPending: false, // always recomputed by the app, never trusted from storage
    resetDay,
    categories,
    transactions: sanitizeTransactions(raw.transactions, newId),
    monthlyReports: sanitizeReports(raw.monthlyReports, newId),
    cycleStartedAt,
    learning: sanitizeLearning(raw.learning),
  };
}

export function parseSavedState(text, options) {
  if (typeof text !== 'string' || text.length === 0 || text.length > MAX_STATE_CHARS) return null;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return null;
  }
  return sanitizeState(parsed, options);
}
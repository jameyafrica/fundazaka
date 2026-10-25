import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { authStorage, stateStorage } from '../lib/encryptedStorage';
import { isResetDue } from '../utils/resetDate';
import { COURSES } from '../constants/courses';
import {
  completeLesson as applyCompleteLesson,
  initialLearning,
  submitQuiz as applySubmitQuiz,
} from '../utils/learning';
import { getCategoryVisual } from '../utils/budgetMath';
import { cleanText, coerceAmount } from '../utils/money';
import { checkEmail, checkNewPassword, friendlyAuthError } from '../utils/validation';
import { hasAccountData, ownsLocalData } from '../lib/session';
import { parseSavedState } from '../utils/sanitizeState';
import { eraseLocalData } from '../utils/deleteData';
import { appLockService } from '../lib/appLock';
import { buildConsentRecord } from '../utils/privacy';
import { supabase, isSupabaseConfigured, hasSupabaseSession, AUTH_STORAGE_KEYS } from '../lib/supabase';
import {
  INCOME_SOURCES,
  applyReset,
  buildDemoState,
  getTotals,
  makeId,
  validateSetup,
  withSpent,
} from '../utils/budgetActions';
 
// Saved state is encrypted under a new name. The old plain-text name is migrated once, then deleted.
const STORAGE_KEY = 'fundazaka_state_v2';
const LEGACY_STORAGE_KEY = 'fundazaka_state';

// Dev only: set EXPO_PUBLIC_RESET_ON_LAUNCH=true in .env to start from a clean slate every launch.
const RESET_ON_LAUNCH = process.env.EXPO_PUBLIC_RESET_ON_LAUNCH === 'true';
 
const BudgetContext = createContext(null);
 
const initialState = {
  hydrated: false,
  user: null,
  ownerId: null, // id of the account whose data is stored on this phone
  isGuest: false,
  displayName: '',
  onboardingCompleted: false,
  tourCompleted: false,
  resetPending: false,
  appLockEnabled: false, // ask for fingerprint, face or phone PIN when the app opens
  privacyConsent: null, // { version, acceptedAt } recorded when the privacy notice is accepted at sign-up
  resetDay: null,
  categories: [], // [{ key, targetAmount }]
  transactions: [], // current cycle only
  monthlyReports: [], // archived cycles, newest first
  cycleStartedAt: null,
  learning: initialLearning, // streak, lesson progress, quiz scores, badges
};
 
function checkCredentials(email, password, isSignUp) {
  if (!isSupabaseConfigured) {
    return 'Supabase is not set up yet. Add your keys to the .env file, or use Demo Mode.';
  }
  const emailProblem = checkEmail(email);
  if (emailProblem) return emailProblem;
  // Password strength is only enforced when CREATING an account, so older passwords still log in.
  if (isSignUp) return checkNewPassword(password, email);
  if (!String(password || '').length) return 'Please enter your password.';
  return null;
}

// Puts a signed-in Supabase user into state. If a different account used this
// phone before, its local data is cleared so users never see each other's money.
function withSession(prev, user, fallbackName) {
  // Only keep data saved under this exact account. Demo data and unowned data are discarded.
  const sameOwner = ownsLocalData(prev, user.id);
  const base = sameOwner ? prev : { ...initialState, hydrated: true };
  return {
    ...base,
    user: { id: user.id, email: user.email },
    ownerId: user.id,
    isGuest: false,
    displayName: (user.user_metadata && user.user_metadata.display_name) || base.displayName || fallbackName || '',
  };
}
 
export function BudgetProvider({ children }) {
  const [state, setState] = useState(initialState);
  // Controls saving while "Delete my data" runs: 'open' saves normally, 'blocked' saves nothing,
  // 'skip' ignores the one save caused by the reset itself, so nothing is written back after a delete.
  const saveGate = useRef('open');
 
  // Load saved state once. resetPending is always recomputed, never trusted from storage.
  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      let next = { ...initialState, hydrated: true };
      try {
        if (RESET_ON_LAUNCH) {
          await stateStorage.removeItem(STORAGE_KEY);
          await stateStorage.removeItem(LEGACY_STORAGE_KEY);
          if (supabase) await supabase.auth.signOut({ scope: 'local' });
        } else {
          await stateStorage.migrateLegacy(LEGACY_STORAGE_KEY, STORAGE_KEY);
          const saved = await stateStorage.getItem(STORAGE_KEY);
          // Saved data is untrusted: it is validated and rebuilt from a whitelist before use.
          const parsed = parseSavedState(saved);
          if (parsed) {
            const due =
              parsed.onboardingCompleted && isResetDue(parsed.resetDay, parsed.cycleStartedAt);
            next = {
              ...initialState,
              ...parsed,
              resetPending: Boolean(due),
              hydrated: true,
            };
            // A saved real account only counts if its Supabase login is still on the phone.
            if (next.user && !next.isGuest && !(await hasSupabaseSession())) {
              next = { ...next, user: null };
            }
          }
        }
      } catch (e) {
        console.error('Failed to load state', e);
      }
      if (!cancelled) setState(next);
    }
    loadState();
    return () => {
      cancelled = true;
    };
  }, []);
 
  // Save to the phone every time something changes (offline-first).
  useEffect(() => {
    if (!state.hydrated) return;
    if (saveGate.current === 'blocked') return;
    if (saveGate.current === 'skip') {
      saveGate.current = 'open';
      return;
    }
    const { hydrated, ...persisted } = state;
    stateStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch((e) =>
      console.error('Failed to save state', e)
    );
  }, [state]);
 
  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);
 
  // Erases everything this app keeps on the phone (budget data, its encryption key and the login),
  // then returns to a clean state. Returns { ok: true }, or { ok: false } if something could not be erased.
  const deleteLocalData = useCallback(async () => {
    saveGate.current = 'blocked';
    const result = await eraseLocalData({
      targets: [
        { storage: stateStorage, keys: [STORAGE_KEY, LEGACY_STORAGE_KEY] },
        { storage: authStorage, keys: AUTH_STORAGE_KEYS },
      ],
      signOut: supabase ? () => supabase.auth.signOut({ scope: 'local' }) : null,
    });
    if (!result.ok) {
      saveGate.current = 'open';
      return { ok: false };
    }
    saveGate.current = 'skip';
    setState({ ...initialState, hydrated: true });
    return { ok: true };
  }, []);

  // Starts Demo Mode. If a signed-out account's data is still on the phone, this refuses unless
  // replace is true, because the demo would erase it. Returns { ok } or { ok: false, reason }.
  const startGuest = useCallback(
    ({ replace = false } = {}) => {
      if (!replace && hasAccountData(state)) return { ok: false, reason: 'account-data' };
      setState((prev) => ({ ...prev, ...buildDemoState(new Date()) }));
      return { ok: true };
    },
    [state]
  );

  // Demo data is disposable, so leaving Demo Mode erases it. A real account only ends its login:
  // its data stays on the phone (encrypted) so the person finds it when they log back in.
  const signOut = useCallback(async () => {
    if (state.isGuest) {
      const result = await deleteLocalData();
      if (!result.ok) setState({ ...initialState, hydrated: true });
      return;
    }
    // Best effort on the server, then always remove the login from this phone, even when offline.
    await eraseLocalData({
      targets: [{ storage: authStorage, keys: AUTH_STORAGE_KEYS }],
      signOut: supabase ? () => supabase.auth.signOut({ scope: 'local' }) : null,
    });
    setState((prev) => ({ ...prev, user: null, isGuest: false }));
  }, [state.isGuest, deleteLocalData]);

  const signUp = useCallback(async ({ email, password, name = '', acceptedPrivacy = false }) => {
    // An account is only created after the person has accepted the privacy notice.
    if (acceptedPrivacy !== true) {
      return { ok: false, error: 'Please accept the Privacy Notice to create an account.' };
    }
    const problem = checkCredentials(email, password, true);
    if (problem) return { ok: false, error: problem };
    try {
      const consent = buildConsentRecord(new Date());
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name.trim(),
            privacy_version: consent.version,
            privacy_accepted_at: consent.acceptedAt,
          },
        },
      });
      if (error) return { ok: false, error: friendlyAuthError(error) };
      if (!data.session || !data.user) {
        return { ok: false, error: 'Please confirm your email, then log in. (Turn off "Confirm email" in Supabase for instant sign up.)' };
      }
      setState((prev) => ({ ...withSession(prev, data.user, name.trim()), privacyConsent: consent }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyAuthError(e) };
    }
  }, []);
 
  const signIn = useCallback(async ({ email, password }) => {
    const problem = checkCredentials(email, password, false);
    if (problem) return { ok: false, error: problem };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, error: friendlyAuthError(error) };
      setState((prev) => withSession(prev, data.user, ''));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyAuthError(e) };
    }
  }, []);
 
  // Turns App lock on or off. The person must prove it is them first (fingerprint, face or phone PIN),
  // and App lock cannot be turned on if the phone has no screen lock. Returns { ok } or { ok: false, reason }.
  const setAppLockEnabled = useCallback(
    async (enabled, promptOptions = {}) => {
      const wanted = enabled === true;
      if (wanted === state.appLockEnabled) return { ok: true };
      const available = await appLockService.isAvailable();
      if (wanted && !available) return { ok: false, reason: 'unavailable' };
      // With no screen lock left on the phone there is nothing to prove, so turning it off is always allowed.
      if (available) {
        const proof = await appLockService.authenticate(promptOptions);
        if (!proof.ok) return { ok: false, reason: 'failed' };
      }
      setState((prev) => ({ ...prev, appLockEnabled: wanted }));
      return { ok: true };
    },
    [state.appLockEnabled]
  );

  const setDisplayName = useCallback((name) => {
    setState((prev) => ({ ...prev, displayName: String(name || '').trim() }));
  }, []);
 
  // Onboarding: categories = [{ key, targetAmount }], resetDay = 1..30.
  const saveSetup = useCallback((categories, resetDay) => {
    const result = validateSetup(categories, resetDay);
    if (!result.ok) return result;
    setState((prev) => ({
      ...prev,
      categories: result.categories,
      resetDay,
      cycleStartedAt: new Date().toISOString(),
      onboardingCompleted: true,
      resetPending: false,
    }));
    return { ok: true };
  }, []);
 
  const completeTour = useCallback(() => {
    setState((prev) => ({ ...prev, tourCompleted: true }));
  }, []);
 
  // Log irregular income: amount in Rand, source = 'work' | 'gift' | 'other'.
  const logIncome = useCallback(({ amount, source, note = '' }) => {
    const parsed = coerceAmount(amount);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const value = parsed.amount;
    if (!INCOME_SOURCES.includes(source)) {
      return { ok: false, error: 'Please choose Work, Gift or Other.' };
    }
    setState((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        { id: makeId(), type: 'income', source, amount: value, note: cleanText(note), createdAt: new Date().toISOString() },
      ],
    }));
    return { ok: true };
  }, []);
 
  // Pay an expense (or add savings) against one of the user's chosen categories.
  const payExpense = useCallback(
    ({ amount, categoryKey, note = '' }) => {
      const parsed = coerceAmount(amount);
      if (!parsed.ok) return { ok: false, error: parsed.error };
      const value = parsed.amount;
      if (!state.categories.some((c) => c.key === categoryKey)) {
        return { ok: false, error: 'Please choose one of your expenses.' };
      }
      setState((prev) => ({
        ...prev,
        transactions: [
          ...prev.transactions,
          { id: makeId(), type: 'expense', categoryKey, amount: value, note: cleanText(note), createdAt: new Date().toISOString() },
        ],
      }));
      return { ok: true };
    },
    [state.categories]
  );
 
  // Monthly reset: archive this cycle, clear spending, apply the reviewed targets.
  const runReset = useCallback(
    (newCategories, newResetDay) => {
      const result = validateSetup(newCategories, newResetDay);
      if (!result.ok) return result;
      setState((prev) => ({ ...prev, ...applyReset(prev, result.categories, newResetDay, new Date()) }));
      return { ok: true };
    },
    []
  );
 
  // Learning hub: mark a lesson as read. Returns { ok, newBadges, alreadyDone } for the UI.
  const completeLesson = useCallback(
    (courseId, lessonId) => {
      const now = new Date();
      const result = applyCompleteLesson(state.learning, COURSES, courseId, lessonId, now);
      if (!result.ok) return result;
      setState((prev) => {
        const applied = applyCompleteLesson(prev.learning, COURSES, courseId, lessonId, now);
        return applied.ok ? { ...prev, learning: applied.learning } : prev;
      });
      return result;
    },
    [state.learning]
  );

  // Learning hub: score a finished quiz. answers = chosen option index per question.
  // Returns { ok, result: { correct, total, percent, passed }, newBadges }.
  const submitQuiz = useCallback(
    (courseId, answers) => {
      const now = new Date();
      const result = applySubmitQuiz(state.learning, COURSES, courseId, answers, now);
      if (!result.ok) return result;
      setState((prev) => {
        const applied = applySubmitQuiz(prev.learning, COURSES, courseId, answers, now);
        return applied.ok ? { ...prev, learning: applied.learning } : prev;
      });
      return result;
    },
    [state.learning]
  );

  // Derived values every screen needs, computed once here so all screens agree.
  const derived = useMemo(() => {
    const categoryRows = withSpent(state.categories, state.transactions).map((row) => ({
      ...row,
      visual: getCategoryVisual(row.key, row.spentAmount, row.targetAmount),
    }));
    return {
      categoryRows,
      totals: getTotals(state.categories, state.transactions),
    };
  }, [state.categories, state.transactions]);
 
  const value = useMemo(
    () => ({
      ...state,
      ...derived,
      updateState,
      startGuest,
      signUp,
      signIn,
      signOut,
      deleteLocalData,
      setAppLockEnabled,
      setDisplayName,
      saveSetup,
      completeTour,
      logIncome,
      payExpense,
      runReset,
      completeLesson,
      submitQuiz,
    }),
    [state, derived, updateState, startGuest, signUp, signIn, signOut, deleteLocalData, setAppLockEnabled, setDisplayName, saveSetup, completeTour, logIncome, payExpense, runReset, completeLesson, submitQuiz]
  );
 
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}
 
export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error('useBudget must be used inside <BudgetProvider>');
  }
  return ctx;
}
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { BudgetProvider, useBudget } from '../context/BudgetContext';
import { supabase } from '../lib/supabase';
import { PRIVACY_CONTACT_EMAIL, PRIVACY_NOTICE, PRIVACY_UPDATED, PRIVACY_VERSION } from '../constants/privacy';
import { buildConsentRecord, splitLinkText } from '../utils/privacy';
import { sanitizeState } from '../utils/sanitizeState';
import { buildDemoState } from '../utils/budgetActions';
import en from '../i18n/locales/en';
import af from '../i18n/locales/af';
import zu from '../i18n/locales/zu';
import xh from '../i18n/locales/xh';
import st from '../i18n/locales/st';

jest.mock('../lib/supabase', () => ({
  supabase: { auth: { signOut: jest.fn(), signInWithPassword: jest.fn(), signUp: jest.fn() } },
  isSupabaseConfigured: true,
  hasSupabaseSession: jest.fn(async () => true),
  AUTH_STORAGE_KEYS: [],
}));

const NOW = new Date('2026-10-24T10:00:00.000Z');
const wrapper = ({ children }) => <BudgetProvider>{children}</BudgetProvider>;

describe('privacy notice content', () => {
  test('has a dated version and plain-language sections', () => {
    expect(PRIVACY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PRIVACY_UPDATED).toMatch(/\d{4}/);
    expect(PRIVACY_NOTICE.length).toBeGreaterThanOrEqual(8);
    PRIVACY_NOTICE.forEach((section) => {
      expect(section.heading.length).toBeGreaterThan(0);
      expect(section.paragraphs.length).toBeGreaterThan(0);
      section.paragraphs.forEach((p) => expect(p.trim().length).toBeGreaterThan(10));
    });
  });

  test('covers what POPIA expects a notice to say', () => {
    const text = PRIVACY_NOTICE.map((s) => `${s.heading} ${s.paragraphs.join(' ')}`).join(' ').toLowerCase();
    ['collect', 'why', 'supabase', 'sell', 'delete', 'rights', 'information regulator', 'encrypted', 'popia'].forEach((word) => {
      expect(text).toContain(word);
    });
  });

  test('has no leftover placeholder text', () => {
    const text = PRIVACY_NOTICE.map((s) => s.paragraphs.join(' ')).join(' ');
    expect(text).not.toMatch(/todo|tbd|lorem|xxx|\[.*\]/i);
  });

  test('the contact email is either not set yet, or a real-looking address', () => {
    if (PRIVACY_CONTACT_EMAIL !== '') expect(PRIVACY_CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe('consent helpers', () => {
  test('buildConsentRecord records the version and the time', () => {
    expect(buildConsentRecord(NOW)).toEqual({ version: PRIVACY_VERSION, acceptedAt: '2026-10-24T10:00:00.000Z' });
  });

  test('splitLinkText splits around the bracketed link words', () => {
    expect(splitLinkText('I accept the [Privacy Notice]')).toEqual({ before: 'I accept the ', link: 'Privacy Notice', after: '' });
    expect(splitLinkText('Ek het die [Kennisgewing] gelees')).toEqual({ before: 'Ek het die ', link: 'Kennisgewing', after: ' gelees' });
    expect(splitLinkText('no link here')).toEqual({ before: 'no link here', link: '', after: '' });
  });

  test('every language marks exactly one link in the consent line', () => {
    [en, af, zu, xh, st].forEach((strings) => {
      const text = strings['login.consent'];
      expect(text.match(/\[[^\]]+\]/g)).toHaveLength(1);
      expect(splitLinkText(text).link.length).toBeGreaterThan(0);
    });
  });
});

describe('saved consent and App lock setting are validated', () => {
  const base = { ...buildDemoState(NOW), isGuest: false, ownerId: 'user-1', user: { id: 'user-1', email: 'a@b.co' } };

  test('a valid consent record is kept', () => {
    const clean = sanitizeState({ ...base, privacyConsent: { version: PRIVACY_VERSION, acceptedAt: NOW.toISOString(), extra: 1 } }, { now: NOW });
    expect(clean.privacyConsent).toEqual({ version: PRIVACY_VERSION, acceptedAt: NOW.toISOString() });
  });

  test('invalid consent records become null', () => {
    [null, 'yes', 5, [], {}, { version: PRIVACY_VERSION }, { version: '<b>', acceptedAt: NOW.toISOString() }, { version: PRIVACY_VERSION, acceptedAt: 'soon' }].forEach((privacyConsent) => {
      expect(sanitizeState({ ...base, privacyConsent }, { now: NOW }).privacyConsent).toBeNull();
    });
  });

  test('demo data never carries a consent record', () => {
    const clean = sanitizeState({ ...buildDemoState(NOW), privacyConsent: { version: PRIVACY_VERSION, acceptedAt: NOW.toISOString() } }, { now: NOW });
    expect(clean.privacyConsent).toBeNull();
  });

  test('appLockEnabled must be exactly true', () => {
    expect(sanitizeState({ ...base, appLockEnabled: true }, { now: NOW }).appLockEnabled).toBe(true);
    ['true', 1, {}, null, undefined].forEach((value) => {
      expect(sanitizeState({ ...base, appLockEnabled: value }, { now: NOW }).appLockEnabled).toBe(false);
    });
  });
});

describe('sign-up needs the privacy notice', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    supabase.auth.signUp.mockReset();
  });

  async function start() {
    const hook = await renderHook(() => useBudget(), { wrapper });
    await waitFor(() => expect(hook.result.current.hydrated).toBe(true));
    return hook;
  }

  test('no account is created without acceptance', async () => {
    const { result } = await start();
    let outcome;
    await act(async () => {
      outcome = await result.current.signUp({ email: 'thandi@example.com', password: 'longenough1', name: 'Thandi' });
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toMatch(/privacy notice/i);
    expect(supabase.auth.signUp).not.toHaveBeenCalled();

    await act(async () => {
      outcome = await result.current.signUp({ email: 'thandi@example.com', password: 'longenough1', acceptedPrivacy: 'yes' });
    });
    expect(outcome.ok).toBe(false);
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  test('acceptance is sent with the account and recorded on the phone', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { session: { access_token: 'x' }, user: { id: 'user-1', email: 'thandi@example.com' } },
      error: null,
    });
    const { result } = await start();
    let outcome;
    await act(async () => {
      outcome = await result.current.signUp({ email: 'thandi@example.com', password: 'longenough1', name: 'Thandi', acceptedPrivacy: true });
    });
    expect(outcome.ok).toBe(true);
    const call = supabase.auth.signUp.mock.calls[0][0];
    expect(call.options.data.privacy_version).toBe(PRIVACY_VERSION);
    expect(call.options.data.privacy_accepted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.current.privacyConsent).toEqual({
      version: PRIVACY_VERSION,
      acceptedAt: call.options.data.privacy_accepted_at,
    });
    expect(result.current.user.id).toBe('user-1');
  });

  test('logging in does not need new consent and keeps the saved record', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { session: { access_token: 'x' }, user: { id: 'user-1', email: 'thandi@example.com' } },
      error: null,
    });
    const { result } = await start();
    await act(async () => {
      await result.current.signUp({ email: 'thandi@example.com', password: 'longenough1', acceptedPrivacy: true });
    });
    const recorded = result.current.privacyConsent;
    await act(async () => {
      await result.current.signOut();
    });
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'user-1', email: 'thandi@example.com' } }, error: null });
    await act(async () => {
      await result.current.signIn({ email: 'thandi@example.com', password: 'longenough1' });
    });
    expect(result.current.privacyConsent).toEqual(recorded);
  });
});
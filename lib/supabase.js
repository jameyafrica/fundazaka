import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import { authStorage } from './encryptedStorage';
import { createClient } from '@supabase/supabase-js';

// EXPO_PUBLIC_ variables are read from .env and baked into the app at bundle time.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// BudgetContext checks this flag so the app still works in Demo Mode without keys.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: authStorage, // keeps the user logged in between app launches
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // no browser redirects in a mobile app
      },
    })
  : null;

// Only refresh the login token while the app is on screen (saves battery and data).
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

// True if a real Supabase login is still stored on this phone.
// If we can't tell (offline, slow network, errors) we keep the user signed in,
// so the app never gets stuck waiting on the network at launch.
export async function hasSupabaseSession() {
  if (!supabase) return false;
  try {
    const check = supabase.auth.getSession().then(({ data, error }) => (error ? true : Boolean(data.session)));
    const timeout = new Promise((resolve) => setTimeout(() => resolve(true), 2500));
    return await Promise.race([check, timeout]);
  } catch (e) {
    return true;
  }
}

// Dev helper: tells you in the Metro terminal whether the keys work and whether
// "Confirm email" is switched off in the Supabase dashboard.
export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        'Keys missing. Check .env has EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY, then restart with: npx expo start -c',
    };
  }
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseKey } });
    if (!res.ok) {
      return { ok: false, message: `Supabase answered ${res.status}. Check the URL and publishable key in .env.` };
    }
    const settings = await res.json();
    if (settings.disable_signup) {
      return { ok: false, message: 'Connected, but sign-ups are disabled in Supabase (Authentication settings).' };
    }
    if (settings.mailer_autoconfirm === false) {
      return { ok: false, message: 'Connected, but "Confirm email" is still ON. Turn it off under Authentication > Sign In / Providers > Email.' };
    }
    return { ok: true, message: 'Connected. Keys are valid, sign-up is open and email confirmation is off.' };
  } catch (e) {
    return { ok: false, message: `Could not reach Supabase (${e.message}). Check your internet connection.` };
  }
}
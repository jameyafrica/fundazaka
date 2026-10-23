import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// EXPO_PUBLIC_ variables are read from .env and baked into the app at bundle time.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// BudgetContext checks this flag so the app still works in Demo Mode without keys.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: AsyncStorage, // keeps the user logged in between app launches
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
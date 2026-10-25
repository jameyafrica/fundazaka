// Remembers that the opening and welcome screens have been shown once, so later launches
// go straight to the app. Not sensitive, so it uses plain AsyncStorage under its own key.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SPLASH_SEEN_KEY = 'fundazaka_splash_seen';

export async function hasSeenSplash() {
  try {
    return (await AsyncStorage.getItem(SPLASH_SEEN_KEY)) === '1';
  } catch (e) {
    return false;
  }
}

export async function markSplashSeen() {
  try {
    await AsyncStorage.setItem(SPLASH_SEEN_KEY, '1');
  } catch (e) {
    console.error('Failed to save splash flag', e);
  }
}

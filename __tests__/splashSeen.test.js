import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPLASH_SEEN_KEY, hasSeenSplash, markSplashSeen } from '../lib/splashSeen';

describe('splash screens only on first launch', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('a fresh install has not seen the splash screens', async () => {
    expect(await hasSeenSplash()).toBe(false);
  });

  test('after they have been shown once, later launches skip them', async () => {
    await markSplashSeen();
    expect(await AsyncStorage.getItem(SPLASH_SEEN_KEY)).toBe('1');
    expect(await hasSeenSplash()).toBe(true);
  });

  test('a storage problem never blocks the app: it just shows the splash again', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    expect(await hasSeenSplash()).toBe(false);
    spy.mockRestore();
  });
});

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Redirect } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { useT } from '../i18n/LanguageContext';
import { getNextRoute } from '../utils/routing';

const SPLASH_DURATION = 3000;
const BACKGROUND_BLUR = 17; // if the background looks blurrier than the mockup, try 8 (or 0 if the image is already blurred)

// The mockups are 390 x 844 (iPhone 13/14). Every number below is a position
// measured from the mockups, and scaled to the real screen size.
const DESIGN_W = 390;
const DESIGN_H = 844;

export default function LaunchScreen() {
  const { hydrated, user, onboardingCompleted, tourCompleted, resetPending } = useBudget();
  const { lang, ready: languageReady, tList } = useT();
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState('opening');
  const [greeting, setGreeting] = useState('');

  // sx scales widths and font sizes, sy scales vertical positions.
  const sx = Math.min(Math.max(width / DESIGN_W, 0.85), 1.2);
  const sy = height / DESIGN_H;

  // Picked once the saved language has loaded, so the greeting is in the user's language.
  useEffect(() => {
    if (!languageReady) return;
    const greetings = tList('greetings');
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageReady, lang]);

  // Wait until saved data has loaded, so each splash screen always gets its full 3 seconds.
  useEffect(() => {
    if (!hydrated) return;
    if (phase === 'opening' || phase === 'welcome') {
      const timer = setTimeout(() => setPhase(phase === 'opening' ? 'welcome' : 'routing'), SPLASH_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase, hydrated]);

  // Dev only: shows in the Metro terminal so we can see where the launch flow is.
  useEffect(() => {
    if (__DEV__) {
      console.log('[launch]', { phase, hydrated, hasUser: Boolean(user), onboardingCompleted, tourCompleted, resetPending });
    }
  }, [phase, hydrated, user, onboardingCompleted, tourCompleted, resetPending]);

  if (!hydrated) return <View style={styles.container} />;

  if (phase === 'routing') {
    return <Redirect href={getNextRoute({ user, onboardingCompleted, tourCompleted, resetPending })} />;
  }

  // Each screen is a plain View with an exact width and height and absolutely positioned
  // children. (A SafeAreaView inside the fading view collapsed to just its padding, which
  // pushed the logo, greeting and badge off the screen.)
  const screenSize = { width, height };

  return (
    <View style={styles.container}>
      {phase === 'opening' && (
        <Animated.View style={[styles.screen, screenSize]} entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)}>
          <Image
            source={require('../assets/icons/background-opening.png')}
            style={screenSize}
            resizeMode="cover"
            blurRadius={BACKGROUND_BLUR}
          />

          {/* fundazaka logo: mockup glyphs start at x=76, baseline at y=429 */}
          <Text
            style={[
              styles.logoText,
              { left: 75 * sx, top: 363 * sy, fontSize: Math.round(70 * sx), lineHeight: Math.round(84 * sx) },
            ]}
          >
            <Text style={styles.logoLight}>funda</Text>
            <Text style={styles.logoBold}>zaka</Text>
          </Text>

          {/* powered by: mockup text spans x=155 to 223 at y=699 */}
          <Text
            style={[
              styles.poweredBy,
              { left: 154 * sx, top: 693 * sy, fontSize: Math.round(16 * sx), lineHeight: Math.round(20 * sx) },
            ]}
          >
            powered by
          </Text>

          {/* FNB badge: mockup circle is 45 x 45 at x=168, y=722 */}
          <View style={[styles.badge, { left: 168 * sx, top: 722 * sy }]}>
            <View style={[styles.badgeCircle, { width: Math.round(45 * sx), height: Math.round(45 * sx) }]}>
              <Text style={[styles.badgeText, { fontSize: Math.round(15 * sx) }]}>FNB</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {phase === 'welcome' && (
        <Animated.View style={[styles.screen, screenSize]} entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)}>
          <Image
            source={require('../assets/icons/background-splash.png')}
            style={screenSize}
            resizeMode="cover"
            blurRadius={BACKGROUND_BLUR}
          />

          {/* Greeting: mockup is 64px Nunito Light, left edge x=54, first line top about y=112, 87px between lines */}
          <Text
            style={[
              styles.greeting,
              {
                left: 54 * sx,
                top: 112 * sy,
                width: (DESIGN_W - 108) * sx,
                fontSize: Math.round(64 * sx),
                lineHeight: Math.round(87 * sx),
              },
            ]}
          >
            {greeting}
          </Text>

          {/* fundazaka logo: mockup glyphs start at x=151, baseline at y=780 */}
          <Text
            style={[
              styles.logoText,
              { left: 150 * sx, top: 752 * sy, fontSize: Math.round(30 * sx), lineHeight: Math.round(36 * sx) },
            ]}
          >
            <Text style={styles.logoLight}>funda</Text>
            <Text style={styles.logoBold}>zaka</Text>
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#041F21' },
  screen: { position: 'absolute', top: 0, left: 0, backgroundColor: '#041F21' },

  logoText: { position: 'absolute', color: '#FFFFFF' },
  logoLight: { fontFamily: 'AdventPro-Light' },
  logoBold: { fontFamily: 'AdventPro-Bold' },

  poweredBy: { position: 'absolute', color: '#FFFFFF', fontFamily: 'AdventPro-Light' },
  badge: { position: 'absolute' },
  badgeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: { color: '#FFFFFF', fontFamily: 'Nunito-Bold' },

  greeting: { position: 'absolute', color: '#FFFFFF', fontFamily: 'Nunito-Light' },
});
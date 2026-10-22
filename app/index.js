import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { Redirect } from 'expo-router';
import { theme } from '../constants/theme';
import { useBudget } from '../context/BudgetContext';
import { GREETINGS } from '../constants/greetings';

// Newly generated SVGR components
import BackgroundSplash from '../components/icons/BackgroundSplash';
import SplashLogoFundazakaCenter from '../components/icons/SplashLogoFundazakaCenter';
import SplashIconFnbBadgeBottomCenter from '../components/icons/SplashIconFnbBadgeBottomCenter';
import WelcomeLogoFundazakaBottomLeft from '../components/icons/WelcomeLogoFundazakaBottomLeft';

const SPLASH_DURATION = 3000;

export default function LaunchScreen() {
  const { hydrated, isGuest, user, onboardingCompleted, resetPending } = useBudget();
  const [phase, setPhase] = useState('opening'); // 'opening' | 'welcome' | 'routing'
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Pick a random greeting on mount
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(randomGreeting);
  }, []);

  // Hydration safety check - wait until AsyncStorage is loaded
  if (!hydrated) return null;

  // Routing logic triggered after animations finish
  if (phase === 'routing') {
    if (!user && !isGuest) {
      return <Redirect href="/(auth)/login" />;
    }
    if (!onboardingCompleted) {
      return <Redirect href="/onboarding" />;
    }
    if (resetPending) {
      return <Redirect href="/reset-review" />; 
    }
    return <Redirect href="/dashboard" />;
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <BackgroundSplash width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {phase === 'opening' && (
        <Animated.View 
          style={styles.absoluteCenter}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500).withCallback((finished) => {
            if (finished) runOnJS(setPhase)('welcome');
          })}
        >
          <OpeningContent onComplete={() => setPhase('welcome')} />
        </Animated.View>
      )}

      {phase === 'welcome' && (
        <Animated.View 
          style={styles.absoluteCenter}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500).withCallback((finished) => {
            if (finished) runOnJS(setPhase)('routing');
          })}
        >
          <WelcomeContent greeting={greeting} onComplete={() => setPhase('routing')} />
        </Animated.View>
      )}
    </View>
  );
}

// Opening Screen Component
function OpeningContent({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContent}>
        <SplashLogoFundazakaCenter width={250} height={120} />
        <Text style={styles.logoText}>
          <Text style={styles.logoLight}>funda</Text>
          <Text style={styles.logoBold}>zaka</Text>
        </Text>
      </View>
      <View style={styles.bottomContent}>
        <Text style={styles.poweredBy}>powered by</Text>
        <SplashIconFnbBadgeBottomCenter width={100} height={40} />
      </View>
    </SafeAreaView>
  );
}

// Welcome Screen Component
function WelcomeContent({ greeting, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <SafeAreaView style={styles.safeAreaWelcome}>
      <Text style={styles.greetingText}>{greeting}</Text>
      <View style={styles.bottomLeftContent}>
        <WelcomeLogoFundazakaBottomLeft width={50} height={50} />
        <Text style={styles.logoTextSmall}>
          <Text style={styles.logoLightSmall}>funda</Text>
          <Text style={styles.logoBoldSmall}>zaka</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  absoluteCenter: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  safeAreaWelcome: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  bottomLeftContent: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: theme.colors.text,
    fontSize: 70, 
    marginTop: -20, 
  },
  logoLight: {
    fontFamily: theme.fonts.logoLight,
  },
  logoBold: {
    fontFamily: theme.fonts.logoBold,
  },
  logoTextSmall: {
    color: theme.colors.text,
    fontSize: 30, 
    marginLeft: theme.spacing.sm,
  },
  logoLightSmall: {
    fontFamily: theme.fonts.logoLight,
  },
  logoBoldSmall: {
    fontFamily: theme.fonts.logoBold,
  },
  poweredBy: {
    color: theme.colors.text,
    fontFamily: theme.fonts.logoLight,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  greetingText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyLight,
    fontSize: 64, 
    lineHeight: 70,
  }
});
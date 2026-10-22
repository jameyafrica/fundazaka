import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Redirect } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { GREETINGS } from '../constants/greetings';

import SplashIconFnbBadgeBottomCenter from '../components/icons/SplashIconFnbBadgeBottomCenter';
import WelcomeLogoFundazakaBottomLeft from '../components/icons/WelcomeLogoFundazakaBottomLeft';

const SPLASH_DURATION = 3000;

export default function LaunchScreen() {
  const { hydrated, isGuest, user, onboardingCompleted, resetPending } = useBudget();
  const [phase, setPhase] = useState('opening'); 
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, []);

  useEffect(() => {
    if (phase === 'opening' || phase === 'welcome') {
      const timer = setTimeout(() => setPhase(phase === 'opening' ? 'welcome' : 'routing'), SPLASH_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (!hydrated) return null;

  if (phase === 'routing') {
    if (!user && !isGuest) return <Redirect href="/(auth)/login" />;
    if (!onboardingCompleted) return <Redirect href="/onboarding" />;
    if (resetPending) return <Redirect href="/reset-review" />;
    return <Redirect href="/dashboard" />;
  }

  return (
    <View style={styles.container}>
      {phase === 'opening' && (
        <Animated.View style={styles.absoluteCenter} entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)}>
          <View style={styles.backgroundLayer} pointerEvents="none">
            <Image 
              source={require('../assets/icons/background-opening.png')} 
              style={StyleSheet.absoluteFill} 
              resizeMode="cover" 
            />
          </View>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.centerContent}>
              <Text style={styles.logoText}>
                <Text style={styles.logoLight}>funda</Text>
                <Text style={styles.logoBold}>zaka</Text>
              </Text>
            </View>
            <View style={styles.bottomContent}>
              <Text style={styles.poweredBy}>powered by</Text>
              <SplashIconFnbBadgeBottomCenter width={55} height={55} />
            </View>
          </SafeAreaView>
        </Animated.View>
      )}

      {phase === 'welcome' && (
        <Animated.View style={styles.absoluteCenter} entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)}>
          <View style={styles.backgroundLayer} pointerEvents="none">
            <Image 
              source={require('../assets/icons/background-splash.png')} 
              style={StyleSheet.absoluteFill} 
              resizeMode="cover" 
            />
          </View>
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
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#041F21' },
  absoluteCenter: { ...StyleSheet.absoluteFillObject },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, zIndex: -1, elevation: -1 },
  safeArea: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40, zIndex: 1 },
  safeAreaWelcome: { flex: 1, justifyContent: 'center', padding: 32, zIndex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 70 },
  logoLight: { fontFamily: 'AdventPro-Light', fontWeight: '300' },
  logoBold: { fontFamily: 'AdventPro-Bold', fontWeight: 'bold' },
  bottomContent: { alignItems: 'center', marginBottom: 20 },
  poweredBy: { color: '#FFFFFF', fontFamily: 'AdventPro-Light', fontSize: 16, marginBottom: 8 },
  greetingText: { color: '#FFFFFF', fontFamily: 'Nunito-Light', fontSize: 64, lineHeight: 70 },
  bottomLeftContent: { position: 'absolute', bottom: 40, left: 32, flexDirection: 'row', alignItems: 'center' },
  logoTextSmall: { color: '#FFFFFF', fontSize: 30, marginLeft: 8 },
  logoLightSmall: { fontFamily: 'AdventPro-Light', fontWeight: '300' },
  logoBoldSmall: { fontFamily: 'AdventPro-Bold', fontWeight: 'bold' }
});
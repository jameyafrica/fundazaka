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
    // TEMPORARY OVERRIDE: Bypasses cached state to let you test the new login layout
    return <Redirect href="/(auth)/login" />;
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
              blurRadius={17}
            />
          </View>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.centerContent}>
              <Text style={styles.logoText}>
                <Text style={styles.logoLight}>funda</Text>
                <Text style={styles.logoBold}>zaka</Text>
              </Text>
            </View>
            
            {/* EXACT DESIGNER SPECIFICATIONS APPLIED HERE */}
            <Text style={styles.poweredByOpening}>powered by</Text>
            <View style={styles.fnbBadgeWrapper}>
              <SplashIconFnbBadgeBottomCenter width={34} height={34} />
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
              blurRadius={17}
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
  safeArea: { flex: 1, width: '100%', zIndex: 1 },
  safeAreaWelcome: { flex: 1, width: '100%', justifyContent: 'center', padding: 32, zIndex: 1 },
  
  centerContent: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 70 },
  logoLight: { fontFamily: 'AdventPro-Light' },
  logoBold: { fontFamily: 'AdventPro-Bold' },
  
  // Exact coordinate positioning for Opening Screen
  poweredByOpening: { position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', color: '#FFFFFF', fontFamily: 'AdventPro-Light', fontSize: 16 },
  fnbBadgeWrapper: { position: 'absolute', bottom: 77, left: 0, right: 0, alignItems: 'center' }, 
  
  // Welcome Screen styling
  greetingText: { color: '#FFFFFF', fontFamily: 'Nunito-Light', fontSize: 64, lineHeight: 70 },
  bottomLeftContent: { position: 'absolute', bottom: 40, left: 32, flexDirection: 'row', alignItems: 'center' },
  logoTextSmall: { color: '#FFFFFF', fontSize: 30, marginLeft: 8 },
  logoLightSmall: { fontFamily: 'AdventPro-Light' },
  logoBoldSmall: { fontFamily: 'AdventPro-Bold' }
});
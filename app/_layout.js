import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { BudgetProvider } from '../context/BudgetContext';
import { checkSupabaseConnection } from '../lib/supabase';
import { theme } from '../constants/theme';

// Keep the splash screen visible while we fetch fonts
SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const [fontsLoaded, fontError] = useFonts({
    'AdventPro-Light': require('../assets/fonts/AdventPro-Light.ttf'),
    'AdventPro-Bold': require('../assets/fonts/AdventPro-Bold.ttf'),
    'Nunito-Light': require('../assets/fonts/Nunito-Light.ttf'),
    'Nunito-Medium': require('../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-Black': require('../assets/fonts/Nunito-Black.ttf'),
    'Nunito-MediumItalic': require('../assets/fonts/Nunito-MediumItalic.ttf'),
    'Nunito-SemiBoldItalic': require('../assets/fonts/Nunito-SemiBoldItalic.ttf'),
    'Nunito-BoldItalic': require('../assets/fonts/Nunito-BoldItalic.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  // Dev only: prints whether Supabase is reachable in the Metro terminal.
  useEffect(() => {
    if (__DEV__) {
      checkSupabaseConnection().then((r) =>
        console.log('[Supabase]', r.ok ? 'OK:' : 'PROBLEM:', r.message)
      );
    }
  }, []);

  return (
    <BudgetProvider>
      <StatusBar style="light" />
      <RootNavigation />
    </BudgetProvider>
  );
}
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';
import BackgroundGeneral from './icons/BackgroundGeneral';

// The "general" background used by every screen after onboarding.
export default function ScreenBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]} pointerEvents="none">
      <BackgroundGeneral width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}

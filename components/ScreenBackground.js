import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';

// Matches the Figma layer blur on the "general" background. Change this one number
// to make every screen softer or sharper. It only blurs the background: cards,
// icons and text sit on top of it and stay sharp.
const BACKGROUND_BLUR = 25;

// The "general" background used by every screen after onboarding.
// It is a PNG (exported from Figma) because an SVG can't be blurred with blurRadius.
export default function ScreenBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]} pointerEvents="none">
      <Image
        source={require('../assets/icons/background-general.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={BACKGROUND_BLUR}
      />
    </View>
  );
}
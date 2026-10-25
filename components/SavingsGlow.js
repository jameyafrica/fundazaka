import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

// Wraps a card and, while `active`, lights it up in celebratory mint: a glowing border, a soft
// gradient wash and a slow breathing pulse. It is deliberately different from the orange "Over"
// warning so saving past a target feels like a win. With "reduce motion" on, the glow stays but
// does not pulse.
export default function SavingsGlow({ active, style, children }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let alive = true;
    if (AccessibilityInfo && typeof AccessibilityInfo.isReduceMotionEnabled === 'function') {
      Promise.resolve(AccessibilityInfo.isReduceMotionEnabled())
        .then((value) => {
          if (alive) setReduceMotion(Boolean(value));
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!active || reduceMotion) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, reduceMotion, pulse]);

  const radius = (StyleSheet.flatten(style) || {}).borderRadius || theme.radius.card;
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View style={[style, active && styles.lit]}>
      {active ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', opacity }]}>
          <LinearGradient
            colors={[theme.colors.celebrateStrong, 'rgba(52, 245, 197, 0.04)', theme.colors.celebrateStrong]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  lit: {
    borderWidth: 1.5,
    borderColor: theme.colors.celebrate,
    backgroundColor: theme.colors.celebrateSurface,
    shadowColor: theme.colors.celebrate,
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
});
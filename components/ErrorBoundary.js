import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

// Catches a crash in any screen so the app shows a calm message with a way out,
// instead of a blank screen. Saved budget data is untouched by a crash.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
    this.goHome = this.goHome.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Screen crashed', error, info && info.componentStack);
    if (typeof this.props.onError === 'function') this.props.onError(error, info);
  }

  retry() {
    this.setState({ error: null });
  }

  // Tries to leave the broken screen first; if navigation is not available, just retries.
  goHome() {
    try {
      if (typeof this.props.onGoHome === 'function') this.props.onGoHome();
    } catch (e) {
      console.error('Could not go home', e);
    }
    this.retry();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container} accessibilityRole="alert">
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          This screen hit a problem. Your money data is safe on your phone. Try again, or head back to the dashboard.
        </Text>
        <Pressable
          onPress={this.retry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Try again</Text>
        </Pressable>
        <Pressable
          onPress={this.goHome}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Back to dashboard</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 24, textAlign: 'center' },
  body: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyLight,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  primary: {
    marginTop: 28,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
  },
  primaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
  secondary: {
    marginTop: 12,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  secondaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },
  pressed: { opacity: 0.7 },
});

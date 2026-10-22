import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>MONEY CONFIDENCE, YOUR WAY</Text>

        <Text style={styles.logo}>
          <Text style={styles.logoLight}>funda</Text>
          <Text style={styles.logoBold}>zaka</Text>
        </Text>

        <Text style={styles.tagline}>
          Budgeting that moves with the way you earn.
        </Text>

        <View style={styles.card}>
          <Text style={styles.greeting}>Your wallet says howzit!</Text>
          <Text style={styles.description}>
            Track what comes in, plan what goes out, and build confidence one
            day at a time.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  logo: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 58,
    textAlign: 'center',
  },
  logoLight: {
    fontWeight: '300',
  },
  logoBold: {
    fontWeight: '800',
  },
  tagline: {
    color: theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    marginTop: 64,
    padding: theme.spacing.lg,
  },
  greeting: {
    color: theme.colors.text,
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
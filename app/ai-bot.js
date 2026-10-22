import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import NavBar from '../components/NavBar';

// Placeholder so the dashboard's AI Bot button never lands on an "unmatched route" screen.
// It says plainly that the bot is not built yet and points to the part that is.
export default function AiBotScreen() {
  const router = useRouter();
  const { user } = useBudget();

  if (!user) return <Redirect href="/(auth)/login" />;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={close}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <Text style={styles.headerIcon}>{'\u2039'}</Text>
          </Pressable>
          <Text style={styles.title}>AI Bot</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.emoji}>{'\u{1F916}'}</Text>
            <Text style={styles.cardTitle}>Coming soon</Text>
            <Text style={styles.cardText}>
              Your money assistant is still being built. For now, the Learn hub has short lessons on budgeting,
              saving, credit and spotting scams.
            </Text>
            <Pressable
              onPress={() => router.push('/learning')}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Open Learn</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  pressed: { opacity: 0.75 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 16 },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 24 },
  body: { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 24,
  },
  emoji: { fontSize: 52, marginBottom: 8 },
  cardTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 22, marginBottom: 8 },
  cardText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.pill, paddingVertical: 14, paddingHorizontal: 32 },
  buttonText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
});

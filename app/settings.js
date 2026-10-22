import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import NavBar from '../components/NavBar';

export default function SettingsScreen() {
  const { user, isGuest, displayName, resetDay, signOut } = useBudget();

  if (!user) return <Redirect href="/(auth)/login" />;

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out',
      isGuest ? 'Demo mode data will be cleared when you sign out.' : 'You can log back in at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const rows = [
    { label: 'Name', value: displayName || 'Not set' },
    { label: 'Account', value: isGuest ? 'Demo mode' : user.email || 'Signed in' },
    { label: 'Targets reset on', value: resetDay ? `Day ${resetDay} of the month` : 'Not set' },
  ];

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.card}>
            {rows.map((row, index) => (
              <View key={row.label} style={[styles.row, index > 0 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
            onPress={confirmSignOut}
            accessibilityRole="button"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyLight, fontSize: 40, marginBottom: theme.spacing.lg },
  card: {
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  row: { padding: theme.spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder },
  rowLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 12 },
  rowValue: { marginTop: 2, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
  signOut: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  signOutText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  pressed: { opacity: 0.75 },
});

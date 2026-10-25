import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import ScreenBackground from '../components/ScreenBackground';
import NavBar from '../components/NavBar';
import LanguagePicker from '../components/LanguagePicker';
import { useT } from '../i18n/LanguageContext';

export default function SettingsScreen() {
  const { user, isGuest, displayName, resetDay, appLockEnabled, signOut, deleteLocalData, setAppLockEnabled } = useBudget();
  const { t } = useT();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [lockBusy, setLockBusy] = useState(false);

  if (!user) return <Redirect href="/(auth)/login" />;

  const confirmSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      isGuest ? t('settings.signOutGuest') : t('settings.signOutUser'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.signOut'), style: 'destructive', onPress: signOut },
      ]
    );
  };

  const toggleAppLock = async (wanted) => {
    if (lockBusy) return;
    setLockBusy(true);
    const result = await setAppLockEnabled(wanted, {
      promptMessage: t('lock.confirmPrompt'),
      cancelLabel: t('common.cancel'),
    });
    setLockBusy(false);
    if (!result.ok) {
      Alert.alert(t('settings.appLock'), result.reason === 'unavailable' ? t('settings.appLockUnavailable') : t('lock.failed'));
    }
  };

  const runDelete = async () => {
    setDeleting(true);
    const result = await deleteLocalData();
    // On success the app returns to the login screen, so there is nothing left to update here.
    if (!result.ok) {
      setDeleting(false);
      Alert.alert(t('settings.deleteData'), t('settings.deleteDataFailed'));
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('settings.deleteDataTitle'), t('settings.deleteDataBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deleteDataConfirm'), style: 'destructive', onPress: runDelete },
    ]);
  };

  const rows = [
    { label: t('settings.name'), value: displayName || t('settings.notSet') },
    { label: t('settings.account'), value: isGuest ? t('settings.demoMode') : user.email || t('settings.signedIn') },
    { label: t('settings.resetOn'), value: resetDay ? t('settings.resetDay', { day: resetDay }) : t('settings.notSet') },
  ];

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('settings.title')}</Text>

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

          <View style={[styles.card, styles.languageCard]}>
            <Text style={[styles.rowLabel, styles.languageLabel]}>{t('lang.label')}</Text>
            <LanguagePicker />
          </View>

          <View style={[styles.card, styles.lockCard]}>
            <View style={styles.lockText}>
              <Text style={styles.lockTitle}>{t('settings.appLock')}</Text>
              <Text style={styles.rowLabel}>{t('settings.appLockHint')}</Text>
            </View>
            <Switch
              value={Boolean(appLockEnabled)}
              onValueChange={toggleAppLock}
              disabled={lockBusy}
              trackColor={{ false: 'rgba(255, 255, 255, 0.25)', true: theme.colors.accent }}
              thumbColor={theme.colors.text}
              accessibilityLabel={t('settings.appLock')}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.privacyRow, pressed && styles.pressed]}
            onPress={() => router.push('/privacy')}
            accessibilityRole="button"
            accessibilityLabel={t('settings.privacy')}
          >
            <Text style={styles.privacyText}>{t('settings.privacy')}</Text>
            <Text style={styles.privacyArrow}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
            onPress={confirmSignOut}
            accessibilityRole="button"
          >
            <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.deleteData, (pressed || deleting) && styles.pressed]}
            onPress={confirmDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel={t('settings.deleteData')}
          >
            <Text style={styles.deleteDataText}>{t('settings.deleteData')}</Text>
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
  languageCard: { marginTop: theme.spacing.md },
  lockCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockText: { flex: 1, marginRight: theme.spacing.md },
  lockTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16, marginBottom: 2 },
  privacyRow: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  privacyText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
  privacyArrow: { color: theme.colors.textMuted, fontSize: 22 },
  languageLabel: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
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
  deleteData: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  deleteDataText: { color: theme.colors.warning, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
  pressed: { opacity: 0.75 },
});

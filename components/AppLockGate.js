import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget } from '../context/BudgetContext';
import { useT } from '../i18n/LanguageContext';
import { theme } from '../constants/theme';
import { appLockService } from '../lib/appLock';
import { isLocked, shouldRelock } from '../utils/appLock';

// Wraps the whole app. When App lock is on, a lock screen covers everything on launch and after
// the app has been in the background for a while. The app underneath stays mounted, so the person
// returns to exactly where they were.
export default function AppLockGate({ children }) {
  const { hydrated, user, appLockEnabled, updateState } = useBudget();
  const { t } = useT();
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const asking = useRef(false);
  const backgroundedAt = useRef(null);

  const lockOn = Boolean(appLockEnabled && user);
  const locked = isLocked({ hydrated, enabled: appLockEnabled, hasUser: Boolean(user), unlocked });

  // With nothing to protect, count the visit as unlocked. A lock switched on later, or a login,
  // then does not lock the person out of what they are already looking at.
  useEffect(() => {
    if (hydrated && !lockOn && !unlocked) setUnlocked(true);
  }, [hydrated, lockOn, unlocked]);

  const unlock = useCallback(async () => {
    if (asking.current) return;
    asking.current = true;
    setFailed(false);
    try {
      if (!(await appLockService.isAvailable())) {
        // The phone has no screen lock any more, so App lock protects nothing. Switch it off.
        updateState({ appLockEnabled: false });
        setUnlocked(true);
        return;
      }
      const result = await appLockService.authenticate({
        promptMessage: t('lock.prompt'),
        cancelLabel: t('common.cancel'),
      });
      if (result.ok) setUnlocked(true);
      else setFailed(true);
    } finally {
      asking.current = false;
    }
  }, [t, updateState]);

  const unlockRef = useRef(unlock);
  unlockRef.current = unlock;

  // Ask as soon as the lock screen appears.
  useEffect(() => {
    if (locked) unlockRef.current();
  }, [locked]);

  // Lock again after the app has been away for a while. Only a real move to the background counts,
  // so the phone's own unlock prompt appearing never locks the app again.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        backgroundedAt.current = Date.now();
      } else if (next === 'active') {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (!asking.current && shouldRelock({ backgroundedAt: since, now: Date.now() })) setUnlocked(false);
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.fill}>
      <View
        style={styles.fill}
        pointerEvents={locked ? 'none' : 'auto'}
        accessibilityElementsHidden={locked}
        importantForAccessibility={locked ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
      {locked && (
        <View style={styles.overlay} testID="app-lock-screen">
          <SafeAreaView style={styles.center}>
            <Text style={styles.logo}>
              <Text style={styles.logoLight}>funda</Text>
              <Text style={styles.logoBold}>zaka</Text>
            </Text>
            <Text style={styles.title}>{t('lock.title')}</Text>
            {failed && <Text style={styles.error}>{t('lock.failed')}</Text>}
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={unlock}
              accessibilityRole="button"
              accessibilityLabel={t('lock.unlock')}
            >
              <Text style={styles.buttonText}>{t('lock.unlock')}</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    zIndex: 1000,
    elevation: 1000,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl },
  logo: { fontSize: 56, color: theme.colors.text },
  logoLight: { fontFamily: theme.fonts.logoLight, color: theme.colors.text },
  logoBold: { fontFamily: theme.fonts.logoBold, color: theme.colors.text },
  title: {
    marginTop: theme.spacing.lg,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    marginTop: theme.spacing.md,
    color: theme.colors.warning,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    minWidth: 180,
    height: 52,
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.accent,
  },
  buttonText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
  pressed: { opacity: 0.75 },
});
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { useScale } from '../../hooks/useScale';
import { getNextRoute } from '../../utils/routing';
import { useT } from '../../i18n/LanguageContext';
import LanguagePicker from '../../components/LanguagePicker';
import WelcomeLogoFundazakaBottomLeft from '../../components/icons/WelcomeLogoFundazakaBottomLeft';

export default function LoginScreen() {
  const router = useRouter();
  const scale = useScale();
  const { t } = useT();
  const { user, onboardingCompleted, tourCompleted, resetPending, signIn, signUp, startGuest } = useBudget();

  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  // As soon as a user exists (real account or demo), move on to wherever they belong.
  useEffect(() => {
    if (user) {
      router.replace(getNextRoute({ user, onboardingCompleted, tourCompleted, resetPending }));
    }
  }, [user, onboardingCompleted, tourCompleted, resetPending, router]);

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  };

  const submit = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    const result = isSignup
      ? await signUp({ email, password, name })
      : await signIn({ email, password });
    setBusy(false);
    if (!result.ok) setError(result.error);
  };

  const demo = () => {
    if (busy) return;
    setError('');
    startGuest();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/background-splash.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={17}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <LanguagePicker compact />
              <Text style={[styles.headline, { fontSize: scale(55), lineHeight: scale(60) }]}>
                {isSignup ? t('login.headlineSignup') : t('login.headlineLogin')}
              </Text>

              <View style={styles.form}>
                {isSignup && (
                  <TextInput
                    style={styles.input}
                    placeholder={t('login.firstName')}
                    placeholderTextColor={theme.colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    textContentType="givenName"
                    returnKeyType="next"
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder={t('login.email')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder={t('login.password')}
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType={isSignup ? 'newPassword' : 'password'}
                    returnKeyType="done"
                    onSubmitEditing={submit}
                  />
                  <Pressable
                    style={styles.showButton}
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                  >
                    <Text style={styles.showText}>{showPassword ? t('login.hide') : t('login.show')}</Text>
                  </Pressable>
                </View>

                {error !== '' && <Text style={styles.error}>{error}</Text>}

                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, busy && styles.disabled]}
                  onPress={submit}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>{isSignup ? t('login.signUp') : t('login.logIn')}</Text>
                  )}
                </Pressable>

                <Pressable onPress={switchMode} disabled={busy} style={styles.linkButton}>
                  <Text style={styles.linkText}>
                    {isSignup ? t('login.haveAccount') : t('login.newHere')}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}
                  onPress={demo}
                  disabled={busy}
                >
                  <Text style={styles.demoText}>{t('login.demo')}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.logoRow}>
              <WelcomeLogoFundazakaBottomLeft width={50} height={50} />
              <Text style={styles.logoText}>
                <Text style={styles.logoLight}>funda</Text>
                <Text style={styles.logoBold}>zaka</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headline: { marginTop: theme.spacing.md, color: theme.colors.text, fontFamily: theme.fonts.bodyLight },
  form: { marginTop: theme.spacing.xl },
  input: {
    height: 52,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 15,
  },
  passwordRow: { justifyContent: 'center' },
  passwordInput: { paddingRight: 64 },
  showButton: { position: 'absolute', right: theme.spacing.md, top: 0, bottom: theme.spacing.md, justifyContent: 'center' },
  showText: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  error: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm + 4,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 13,
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  primaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  linkButton: { alignItems: 'center', paddingVertical: theme.spacing.md },
  linkText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },
  demoButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  demoText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xl },
  logoText: { color: theme.colors.text, fontSize: 30, marginLeft: theme.spacing.sm },
  logoLight: { fontFamily: theme.fonts.logoLight },
  logoBold: { fontFamily: theme.fonts.logoBold },
});
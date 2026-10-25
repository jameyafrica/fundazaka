import React, { useEffect, useRef, useState } from 'react';
import {
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
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { useT } from '../../i18n/LanguageContext';
import { useScale } from '../../hooks/useScale';
import { CATEGORY_KEYS, MAX_CATEGORIES, MIN_CATEGORIES, validateSetup } from '../../utils/budgetActions';
import { getNextRoute } from '../../utils/routing';

import IconRent from '../../components/icons/OnboardingExpensesIconRent';
import IconTransport from '../../components/icons/OnboardingExpensesIconTransport';
import IconDebit from '../../components/icons/OnboardingExpensesIconDebitOrders';
import IconGroceries from '../../components/icons/OnboardingExpensesIconGroceries';
import IconSaving from '../../components/icons/OnboardingExpensesIconSaving';
import NextButtonIcon from '../../components/icons/OnboardingExpensesButtonNextBottomRight';
import CheckButtonIcon from '../../components/icons/OnboardingConfirmButtonCheckCenter';
import CloseButtonIcon from '../../components/icons/OnboardingConfirmIconCloseBottomRight';

const ICONS = {
  rent: IconRent,
  transport: IconTransport,
  debit: IconDebit,
  groceries: IconGroceries,
  savings: IconSaving,
};

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const SUCCESS_DELAY = 1800;

// Keeps only digits and one decimal point (max 2 decimals). Accepts a comma too.
function cleanAmount(text) {
  const t = text.replace(',', '.').replace(/[^0-9.]/g, '');
  const dot = t.indexOf('.');
  if (dot === -1) return t;
  return t.slice(0, dot + 1) + t.slice(dot + 1).replace(/\./g, '').slice(0, 2);
}

export default function OnboardingExpensesScreen() {
  const router = useRouter();
  const scale = useScale();
  const { t } = useT();
  const { mode } = useLocalSearchParams();
  const {
    user,
    categories,
    resetDay: savedResetDay,
    onboardingCompleted,
    tourCompleted,
    resetPending,
    saveSetup,
    runReset,
  } = useBudget();

  // ?mode=reset: the monthly target review. Straight to the targets, prefilled.
  const isReset = mode === 'reset' && categories.length > 0;

  const [step, setStep] = useState(isReset ? 'targets' : 'select'); // select | targets | day | confirm | success
  const [selected, setSelected] = useState(() => categories.map((c) => c.key));
  const [targets, setTargets] = useState(() =>
    Object.fromEntries(categories.map((c) => [c.key, String(c.targetAmount)]))
  );
  const [resetDay, setResetDay] = useState(savedResetDay || null);
  const [error, setError] = useState('');

  // Latest values for the timer below, which fires after this render has passed.
  const latest = useRef({});
  latest.current = { user, onboardingCompleted, tourCompleted, resetPending };
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!user) return <Redirect href="/(auth)/login" />;

  const orderedKeys = CATEGORY_KEYS.filter((k) => selected.includes(k));
  const buildCategories = () =>
    orderedKeys.map((k) => ({ key: k, targetAmount: targets[k] ?? '' }));

  const finish = () => {
    setError('');
    setStep('success');
    timer.current = setTimeout(() => router.replace(getNextRoute(latest.current)), SUCCESS_DELAY);
  };

  const toggle = (key) => {
    if (selected.includes(key)) {
      setSelected(selected.filter((k) => k !== key));
      setError('');
    } else if (selected.length >= MAX_CATEGORIES) {
      setError(t('ob.maxError', { max: MAX_CATEGORIES }));
    } else {
      setSelected([...selected, key]);
      setError('');
    }
  };

  const onNext = () => {
    if (step === 'select') {
      if (orderedKeys.length < MIN_CATEGORIES) {
        setError(t('ob.minError', { min: MIN_CATEGORIES }));
        return;
      }
      setError('');
      setStep('targets');
    } else if (step === 'targets') {
      const check = validateSetup(buildCategories(), isReset ? savedResetDay : resetDay || 1);
      if (!check.ok) {
        setError(check.error);
        return;
      }
      if (isReset) {
        const result = runReset(check.categories, savedResetDay);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        finish();
      } else {
        setError('');
        setStep('day');
      }
    } else if (step === 'day') {
      if (!resetDay) {
        setError(t('ob.dayError'));
        return;
      }
      setError('');
      setStep('confirm');
    }
  };

  const onBack = () => {
    setError('');
    setStep(step === 'day' ? 'targets' : 'select');
  };

  const onAccept = () => {
    const result = saveSetup(buildCategories(), resetDay);
    if (!result.ok) {
      setError(result.error);
      setStep('day');
      return;
    }
    finish();
  };

  const onCancel = () => {
    setError('');
    setStep('select');
  };

  const shownStep = step === 'confirm' ? 'day' : step;
  const showBack = (shownStep === 'targets' && !isReset) || shownStep === 'day';
  const headline = isReset ? t('ob.headlineReset') : t('ob.headline');
  const lastResetStep = isReset && shownStep === 'targets';

  let subtitle = t('ob.subSelect');
  if (shownStep === 'targets') {
    subtitle = isReset ? t('ob.subTargetsReset') : t('ob.subTargets');
  } else if (shownStep === 'day') {
    subtitle = t('ob.subDay');
  } else if (shownStep === 'success') {
    subtitle = '';
  }

  const renderSelect = () => (
    <>
      <Text style={styles.note}>
        {t('ob.note', { min: MIN_CATEGORIES, max: MAX_CATEGORIES })}
      </Text>
      {CATEGORY_KEYS.map((key) => {
        const Icon = ICONS[key];
        const isOn = selected.includes(key);
        return (
          <Pressable
            key={key}
            onPress={() => toggle(key)}
            style={[styles.card, isOn && styles.cardActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isOn }}
          >
            <View style={styles.cardIcon}>
              <Icon width={36} height={36} />
            </View>
            <Text style={styles.cardTitle}>{t(`cat.${key}.title`)}</Text>
            <View style={[styles.tick, isOn && styles.tickOn]}>
              {isOn && <Text style={styles.tickMark}>✓</Text>}
            </View>
          </Pressable>
        );
      })}
    </>
  );

  // Two rows per card: the icon and full-width name on top, then the target amount underneath,
  // so long names such as "Debit Orders" never get squeezed onto several lines.
  const renderTargets = () =>
    orderedKeys.map((key) => {
      const Icon = ICONS[key];
      return (
        <View key={key} style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <View style={styles.cardIcon}>
              <Icon width={36} height={36} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit>
              {t(`cat.${key}.title`)}
            </Text>
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>{t('ob.target')}</Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountPrefix}>R</Text>
              <TextInput
                style={styles.amountInput}
                value={targets[key] ?? ''}
                onChangeText={(text) => setTargets((prev) => ({ ...prev, [key]: cleanAmount(text) }))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={9}
                accessibilityLabel={`${t(`cat.${key}.title`)} ${t('ob.target')}`}
              />
            </View>
          </View>
        </View>
      );
    });

  const renderDays = () => (
    <>
      <View style={styles.dayGrid}>
        {DAYS.map((day) => {
          const isOn = resetDay === day;
          return (
            <View key={day} style={styles.dayCell}>
              <Pressable
                onPress={() => {
                  setResetDay(day);
                  setError('');
                }}
                style={[styles.dayButton, isOn && styles.dayButtonActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: isOn }}
              >
                <Text style={styles.dayText}>{day}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Text style={styles.note}>
        {t('ob.dayNote')}
      </Text>
    </>
  );

  const renderSuccess = () => (
    <View style={styles.banner}>
      <CheckButtonIcon width={44} height={44} />
      <Text style={styles.bannerText}>{t('ob.success')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/background-splash.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={17}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            {showBack && (
              <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
                <Text style={styles.backText}>{t('common.back')}</Text>
              </Pressable>
            )}
            <Text style={[styles.headline, { fontSize: scale(55), lineHeight: scale(60) }]}>{headline}</Text>
            {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {shownStep === 'select' && renderSelect()}
            {shownStep === 'targets' && renderTargets()}
            {shownStep === 'day' && renderDays()}
            {shownStep === 'success' && renderSuccess()}
          </ScrollView>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          {/* No Next arrow once the confirmation box is open: the person confirms or cancels there. */}
          {step !== 'success' && step !== 'confirm' && (
            <View style={styles.footer}>
              <Pressable
                onPress={onNext}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={lastResetStep ? t('common.saveTargets') : t('common.next')}
              >
                {lastResetStep ? (
                  <CheckButtonIcon width={64} height={64} />
                ) : (
                  <NextButtonIcon width={64} height={64} />
                )}
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {step === 'confirm' && (
        <View style={styles.scrim}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('ob.confirmTitle')}</Text>
            <Text style={styles.dialogBody}>
              {t('ob.confirmBody', { count: orderedKeys.length, day: resetDay })}
            </Text>
            <View style={styles.dialogButtons}>
              <Pressable onPress={onCancel} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
                <CloseButtonIcon width={56} height={56} />
              </Pressable>
              <Pressable onPress={onAccept} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('common.save')}>
                <CheckButtonIcon width={56} height={56} />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg },
  backButton: { alignSelf: 'flex-start', marginBottom: theme.spacing.sm },
  backText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  headline: { color: theme.colors.text, fontFamily: theme.fonts.bodyLight },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
  },
  note: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: 'Nunito-SemiBoldItalic',
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(0, 180, 162, 0.38)',
  },
  cardIcon: { width: 44, alignItems: 'center', marginRight: theme.spacing.sm },
  cardTitle: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 20 },
  targetCard: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  targetHeader: { flexDirection: 'row', alignItems: 'center' },
  targetRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm + 2 },
  tick: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
  },
  tickOn: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  tickMark: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  targetLabel: {
    marginRight: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
  },
  amountBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  amountPrefix: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17, marginRight: 6 },
  amountInput: { flex: 1, padding: 0, color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 17 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md },
  dayCell: { width: `${100 / 6}%`, padding: 4 },
  dayButton: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  dayButtonActive: { borderWidth: 2, borderColor: theme.colors.accent, backgroundColor: 'rgba(0, 180, 162, 0.55)' },
  dayText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  error: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm + 4,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  bannerText: {
    marginLeft: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: 'Nunito-BoldItalic',
    fontSize: 20,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },
  dialog: {
    width: '100%',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.backgroundAlt,
  },
  dialogTitle: { color: theme.colors.text, fontFamily: 'Nunito-BoldItalic', fontSize: 20 },
  dialogBody: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
});
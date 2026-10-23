import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Redirect } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { COURSE_NAMES, SAMPLE_PILLS, TOOLKIT, TOUR_STEPS } from '../../constants/tourSteps';
import { useT } from '../../i18n/LanguageContext';
import { getCategoryVisual } from '../../utils/budgetMath';
import { formatRand } from '../../utils/format';
import { getNextRoute } from '../../utils/routing';

import IconRent from '../../components/icons/OnboardingExpensesIconRent';
import IconTransport from '../../components/icons/OnboardingExpensesIconTransport';
import IconDebit from '../../components/icons/OnboardingExpensesIconDebitOrders';
import IconGroceries from '../../components/icons/OnboardingExpensesIconGroceries';
import IconSaving from '../../components/icons/OnboardingExpensesIconSaving';
import GuideIncome from '../../components/icons/OnboardingGuideIconIncome';
import GuideExpenses from '../../components/icons/OnboardingGuideIconExpenses';
import GuideRobot from '../../components/icons/OnboardingGuideIconRobot';
import GuideBreakdown from '../../components/icons/OnboardingGuideIconBreakdown';
import GuideCalculator from '../../components/icons/OnboardingGuideIconCalculator';
import GuideGraduation from '../../components/icons/OnboardingGuideIconGraduationFinancialSmart';
import NextButtonIcon from '../../components/icons/OnboardingExpensesButtonNextBottomRight';
import CheckButtonIcon from '../../components/icons/OnboardingConfirmButtonCheckCenter';

const CATEGORY_ICONS = {
  rent: IconRent,
  transport: IconTransport,
  debit: IconDebit,
  groceries: IconGroceries,
  savings: IconSaving,
};

const TOOL_ICONS = { ai: GuideRobot, breakdown: GuideBreakdown, calculator: GuideCalculator };
const INCOME_SOURCES_KEYS = ['income.work', 'income.gift', 'income.other'];

function describePill(t, sample, visual) {
  const title = t(`cat.${sample.key}.title`);
  const spent = formatRand(sample.spent);
  const target = formatRand(sample.target);
  if (visual.variant === 'over') {
    return t('tour.pillOver', { title, amount: formatRand(visual.overAmount) });
  }
  if (visual.variant === 'savings') {
    return t('tour.pillSavings', { title, spent, target });
  }
  const key = visual.remainingAmount === 0 ? 'tour.pillReached' : 'tour.pillNormal';
  return t(key, { title, spent, target });
}

export default function OnboardingTourScreen() {
  const { user, onboardingCompleted, tourCompleted, resetPending, completeTour } = useBudget();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [pillKey, setPillKey] = useState(null);
  const [toolKey, setToolKey] = useState(null);

  // Only stay here while the tour is the right place to be. Once the tour is
  // completed this sends the user on (dashboard, or the monthly reset first).
  const route = getNextRoute({ user, onboardingCompleted, tourCompleted, resetPending });
  if (route !== '/(auth)/onboarding-tour') return <Redirect href={route} />;

  const isLast = step === TOUR_STEPS.length - 1;
  const current = TOUR_STEPS[step];

  const onNext = () => {
    if (isLast) {
      completeTour();
    } else {
      setStep(step + 1);
    }
  };

  const renderZaks = () => (
    <View style={styles.panel}>
      <Text style={styles.exampleTag}>{t('tour.example')}</Text>
      <View style={styles.zaksRow}>
        <View style={styles.zaksColumn}>
          <Text style={styles.zaksLabel}>{t('hero.zaks')}</Text>
          <Text style={styles.zaksValue}>{formatRand(4500)}</Text>
        </View>
        <View style={styles.zaksColumn}>
          <Text style={styles.zaksLabel}>{t('hero.target')}</Text>
          <Text style={styles.zaksValue}>{formatRand(6000)}</Text>
        </View>
        <View style={styles.zaksColumn}>
          <Text style={styles.zaksLabel}>{t('hero.balance')}</Text>
          <Text style={styles.zaksValue}>{formatRand(1500)}</Text>
        </View>
      </View>
      <View style={styles.iconRow}>
        {SAMPLE_PILLS.map((sample) => {
          const Icon = CATEGORY_ICONS[sample.key];
          return (
            <View key={sample.key} style={styles.iconChip}>
              <Icon width={30} height={30} />
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderPills = () => {
    const selectedSample = SAMPLE_PILLS.find((s) => s.key === pillKey);
    const selectedVisual = selectedSample
      ? getCategoryVisual(selectedSample.key, selectedSample.spent, selectedSample.target)
      : null;
    return (
      <View style={styles.panel}>
        <View style={styles.pillRow}>
          {SAMPLE_PILLS.map((sample) => {
            const visual = getCategoryVisual(sample.key, sample.spent, sample.target);
            const Icon = CATEGORY_ICONS[sample.key];
            const isOn = pillKey === sample.key;
            return (
              <Pressable
                key={sample.key}
                style={styles.pillColumn}
                onPress={() => setPillKey(sample.key)}
                accessibilityRole="button"
                accessibilityLabel={t(`cat.${sample.key}.title`)}
              >
                <View
                  style={[
                    styles.pill,
                    visual.isOver && styles.pillOver,
                    isOn && (visual.isOver ? styles.pillOnOver : styles.pillOn),
                  ]}
                >
                  <View style={{ opacity: visual.opacity }}>
                    <Icon width={30} height={30} />
                  </View>
                </View>
                <Text style={styles.pillLabel}>{t(`cat.${sample.key}.short`)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.caption}>
          {selectedSample ? describePill(t, selectedSample, selectedVisual) : t('tour.tapPill')}
        </Text>
      </View>
    );
  };

  const renderMoney = () => (
    <View style={styles.panel}>
      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <GuideIncome width={34} height={34} />
          <Text style={styles.tileTitle}>{t('home.addIncome')}</Text>
        </View>
        <View style={styles.tile}>
          <GuideExpenses width={34} height={34} />
          <Text style={styles.tileTitle}>{t('home.payExpense')}</Text>
        </View>
      </View>
      <View style={styles.chipRow}>
        {INCOME_SOURCES_KEYS.map((key) => (
          <View key={key} style={styles.chip}>
            <Text style={styles.chipText}>{t(key)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderToolkit = () => (
    <View style={styles.panel}>
      <View style={styles.tileRow}>
        {Object.keys(TOOLKIT).map((key) => {
          const Icon = TOOL_ICONS[key];
          const isOn = toolKey === key;
          return (
            <Pressable
              key={key}
              style={[styles.tile, isOn && styles.tileOn]}
              onPress={() => setToolKey(key)}
              accessibilityRole="button"
              accessibilityLabel={t(`tour.tool.${key}.title`)}
            >
              <Icon width={34} height={34} />
              <Text style={styles.tileTitle}>{t(`tour.tool.${key}.title`)}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.caption}>{toolKey ? t(`tour.tool.${toolKey}.text`) : t('tour.tapHelper')}</Text>
    </View>
  );

  const renderLearn = () => (
    <View style={styles.panel}>
      <View style={styles.learnHeader}>
        <GuideGraduation width={72} height={72} />
      </View>
      <View style={styles.chipRow}>
        {COURSE_NAMES.map((name) => (
          <View key={name} style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const visuals = { zaks: renderZaks, pills: renderPills, money: renderMoney, toolkit: renderToolkit, learn: renderLearn };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/background-splash.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={17}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topRow}>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} hitSlop={12}>
              <Text style={styles.topLink}>{t('common.back')}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable onPress={completeTour} hitSlop={12}>
            <Text style={styles.topLink}>{t('common.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.dots}>
          {TOUR_STEPS.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View key={current.id} entering={FadeInRight.duration(300)}>
            <Text style={styles.title}>{t(`tour.${current.id}.title`)}</Text>
            <Text style={styles.body}>{t(`tour.${current.id}.body`)}</Text>
            {visuals[current.id]()}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={onNext}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isLast ? t('common.finishTour') : t('common.next')}
          >
            {isLast ? <CheckButtonIcon width={64} height={64} /> : <NextButtonIcon width={64} height={64} />}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  topLink: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: { width: 24, backgroundColor: theme.colors.accent },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 20 },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  exampleTag: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: 'Nunito-SemiBoldItalic',
    fontSize: 11,
  },
  zaksRow: { flexDirection: 'row', justifyContent: 'space-between' },
  zaksColumn: { flex: 1, alignItems: 'center' },
  zaksLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13 },
  zaksValue: { marginTop: 2, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
  iconRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.lg },
  iconChip: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pillColumn: { flex: 1, alignItems: 'center' },
  pill: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillOver: { backgroundColor: theme.colors.warningSurface, borderColor: theme.colors.warning },
  pillOn: { borderWidth: 2, borderColor: theme.colors.accent },
  pillOnOver: { borderWidth: 2, borderColor: theme.colors.warning },
  pillLabel: { marginTop: 6, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 10 },
  caption: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: 'Nunito-MediumItalic',
    fontSize: 14,
    lineHeight: 20,
  },
  tileRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tile: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  tileOn: { borderWidth: 2, borderColor: theme.colors.accent, backgroundColor: 'rgba(0, 180, 162, 0.3)' },
  tileTitle: { marginTop: theme.spacing.sm, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.md },
  chip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 12 },
  learnHeader: { alignItems: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
});
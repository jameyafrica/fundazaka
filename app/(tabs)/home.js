import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { useT } from '../../i18n/LanguageContext';
import { pickMotivation } from '../../constants/motivation';
import { useScale } from '../../hooks/useScale';
import { formatRand } from '../../utils/format';
import { getHeroForecast, getHeroState, getNextPaymentCard } from '../../utils/dashboard';
import { getCycleProgress } from '../../utils/insights';
import { getNextRoute } from '../../utils/routing';
import ScreenBackground from '../../components/ScreenBackground';
import CategoryIcon from '../../components/CategoryIcon';
import NavBar from '../../components/NavBar';
import NextPaymentCard from '../../components/NextPaymentCard';
import SavingsGlow from '../../components/SavingsGlow';

import Avatar from '../../components/icons/DashboardAvatarUserTopLeft';
import FnbLogo from '../../components/icons/DashboardIconFnbLogoHeroImage30';
import AddZaksIcon from '../../components/icons/DashboardIconAddZuksTopRight30';
import IncomeIcon from '../../components/icons/DashboardIconArrowDownCardIncome46';
import ExpenseIcon from '../../components/icons/DashboardIconArrowDownCardExpenses46';
import AiBotIcon from '../../components/icons/DashboardIconAiBotGridLeft46';
import BreakdownIcon from '../../components/icons/DashboardIconBreakdownGridCenter46';
import CalculatorIcon from '../../components/icons/DashboardIconCalculatorGridRight46';
import EducationIcon from '../../components/icons/DashboardIconEducationCardMiddle80';

export default function HomeScreen() {
  const router = useRouter();
  const scale = useScale();
  const { t, tList } = useT();
  const { user, displayName, onboardingCompleted, tourCompleted, resetPending, categoryRows, totals, transactions, monthlyReports, resetDay, cycleStartedAt } = useBudget();
  const [selectedKey, setSelectedKey] = useState(null); // null = "Total" view
  const seed = useRef(Math.floor(Math.random() * 1000)).current;

  // Stay on the dashboard only when it is the right place (otherwise onboarding / reset).
  const route = getNextRoute({ user, onboardingCompleted, tourCompleted, resetPending });
  if (route !== '/(tabs)/home') return <Redirect href={route} />;

  // The designer's tiny sizes (6, 8, 10) are unreadable on a phone, so small text has a floor of 11.
  const fs = (size) => Math.max(11, scale(size));

  const selected = categoryRows.find((row) => row.key === selectedKey) || null;
  const hero = getHeroState(selected, totals);
  const nextPayment = getNextPaymentCard(monthlyReports, transactions, new Date());
  const motivation = pickMotivation(hero.motivationKind, seed, {
    default: tList('motivation.default'),
    reached: tList('motivation.reached'),
    over: tList('motivation.over'),
    savings: tList('motivation.savings'),
    savingsOver: tList('motivation.savingsOver'),
  });
  const forecast = getHeroForecast(categoryRows, getCycleProgress(resetDay, cycleStartedAt, new Date()), selectedKey);
  let forecastText = '';
  if (forecast) {
    const name = t(`cat.${forecast.key}.title`);
    const days = forecast.daysUntilOver;
    const unit = days === 1 ? 'dayOne' : 'dayMany';
    if (days === null) {
      forecastText = t('home.forecast.pass', { name, amount: formatRand(forecast.projectedOver) });
    } else if (selected) {
      forecastText = days === 0 ? t('home.forecast.todaySel') : t(`home.forecast.${unit}Sel`, { count: days });
    } else {
      forecastText = days === 0 ? t('home.forecast.todayCat', { name }) : t(`home.forecast.${unit}Cat`, { name, count: days });
    }
  }
  const isSavings = selected && selected.key === 'savings';
  const expenseLabel = isSavings ? t('home.addSavings') : t('home.payExpense');
  const catTitle = (key) => t(`cat.${key}.title`);

  const goAddExpense = () =>
    router.push(selected ? `/add-transaction?type=expense&category=${selected.key}` : '/add-transaction?type=expense');

  const pillItems = [{ key: 'total' }, ...categoryRows];

  const renderTool = (label, Icon, href) => (
    <Pressable
      key={label}
      style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon width={34} height={34} />
      <Text style={[styles.toolLabel, { fontSize: fs(10) }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Avatar width={44} height={44} />
            <Text style={styles.welcome} numberOfLines={1}>
              {displayName ? t('home.welcome', { name: displayName }) : t('home.welcomeNoName')}
            </Text>
          </View>

          <SavingsGlow active={hero.isCelebrating} style={[styles.hero, hero.isOver && styles.heroOver]}>
            {hero.isCelebrating && (
              <View
                style={styles.winBanner}
                accessible
                accessibilityLiveRegion="polite"
                accessibilityLabel={t('hero.savingsWinA11y', { amount: formatRand(hero.primaryValue) })}
              >
                <Text style={styles.winBannerText}>{'\u{1F389}'} {t('hero.savingsWin')}</Text>
              </View>
            )}
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Zak-Buckz</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { fontSize: fs(10) }]}>{t(hero.primaryLabelKey || 'hero.balance')}</Text>
                    <Text style={[styles.statValue, hero.isCelebrating && styles.statValueWin]}>{formatRand(hero.primaryValue)}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { fontSize: fs(10) }]}>{t('hero.target')}</Text>
                    <Text style={styles.statValue}>{formatRand(hero.targetValue)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroIcon}>
                {selected ? (
                  <CategoryIcon categoryKey={selected.key} variant="hero" size={64} visual={selected.visual} />
                ) : (
                  <FnbLogo width={64} height={64} />
                )}
                {selected && <Text style={styles.heroIconLabel}>{catTitle(selected.key)}</Text>}
              </View>
            </View>

            {hero.showProgress && (
              <View style={styles.segments}>
                {hero.segments.map((segment, index) => (
                  <View
                    key={index}
                    style={[styles.segment, segment.filled && { backgroundColor: segment.tint, opacity: segment.opacity }]}
                  />
                ))}
              </View>
            )}

            <Text style={[styles.motivation, { fontSize: fs(12) }, hero.isCelebrating && styles.motivationWin]}>{motivation}</Text>

            {forecastText ? (
              <View style={styles.forecast} accessibilityLiveRegion="polite">
                <Text style={[styles.forecastText, { fontSize: fs(12) }]}>{forecastText}</Text>
              </View>
            ) : null}

            {selected && (
              <Pressable
                style={({ pressed }) => [styles.addZaks, pressed && styles.pressed]}
                onPress={goAddExpense}
                accessibilityRole="button"
                accessibilityLabel={t('home.addZaksTo', { title: catTitle(selected.key) })}
              >
                <AddZaksIcon width={22} height={22} />
                <Text style={styles.addZaksText}>{t('home.addZaks')}</Text>
              </Pressable>
            )}
          </SavingsGlow>

          <NextPaymentCard card={nextPayment} onPress={() => router.push('/ai-bot')} />

          <View style={styles.pillBar}>
            {pillItems.map((item) => {
              const isTotal = item.key === 'total';
              const isOn = isTotal ? selectedKey === null : selectedKey === item.key;
              const over = !isTotal && item.visual.isOver;
              const savedOver = !isTotal && item.key === 'savings' && item.spentAmount > item.targetAmount;
              return (
                <Pressable
                  key={item.key}
                  style={styles.pillColumn}
                  onPress={() => setSelectedKey(isTotal || isOn ? null : item.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isOn }}
                  accessibilityLabel={isTotal ? t('home.total') : catTitle(item.key)}
                >
                  <View style={[styles.pill, savedOver && styles.pillWin, isOn && (over ? styles.pillOnOver : savedOver ? styles.pillOnWin : styles.pillOn)]}>
                    {isTotal ? (
                      <FnbLogo width={30} height={30} />
                    ) : (
                      <CategoryIcon categoryKey={item.key} variant="pill" size={30} visual={item.visual} />
                    )}
                  </View>
                  <Text style={[styles.pillLabel, { fontSize: fs(10) }]} numberOfLines={1}>
                    {isTotal ? t('home.total') : t(`cat.${item.key}.short`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}
              onPress={() => router.push('/add-transaction?type=income')}
              accessibilityRole="button"
            >
              <IncomeIcon width={32} height={32} />
              <Text style={styles.actionText}>{t('home.addIncome')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionCard, hero.isCelebrating && styles.actionCardWin, pressed && styles.actionPressed]}
              onPress={goAddExpense}
              accessibilityRole="button"
            >
              <ExpenseIcon width={32} height={32} />
              <Text style={styles.actionText}>{expenseLabel}</Text>
            </Pressable>
          </View>

          <View style={styles.toolRow}>
            {renderTool(t('home.aiBot'), AiBotIcon, '/ai-bot')}
            {renderTool(t('home.breakdown'), BreakdownIcon, '/breakdown')}
            {renderTool(t('home.calculator'), CalculatorIcon, '/calculator')}
          </View>

          <Pressable
            style={({ pressed }) => [styles.learnCard, pressed && styles.actionPressed]}
            onPress={() => router.push('/learning')}
            accessibilityRole="button"
            accessibilityLabel={t('home.learnA11y')}
          >
            <Text style={styles.learnText}>{t('home.learn')}</Text>
            <EducationIcon width={44} height={44} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <NavBar onHomePress={() => setSelectedKey(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  welcome: { flex: 1, marginLeft: theme.spacing.md, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  hero: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  heroOver: { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningSurface },
  winBanner: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm + 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.celebrate,
  },
  winBannerText: { color: theme.colors.background, fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  statValueWin: { color: theme.colors.celebrate },
  motivationWin: { color: theme.colors.celebrate },
  pillWin: { borderColor: theme.colors.celebrate },
  pillOnWin: { borderColor: theme.colors.celebrate, backgroundColor: theme.colors.celebrateStrong },
  actionCardWin: { borderColor: theme.colors.celebrate, backgroundColor: theme.colors.celebrateSurface },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroText: { flex: 1 },
  heroTitle: { color: theme.colors.text, fontFamily: 'Nunito-MediumItalic', fontSize: 13 },
  statsRow: { flexDirection: 'row', marginTop: theme.spacing.sm },
  stat: { flex: 1 },
  statLabel: { color: theme.colors.textMuted, fontFamily: 'Nunito-MediumItalic' },
  statValue: { marginTop: 2, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 22 },
  heroIcon: { width: 84, alignItems: 'center' },
  heroIconLabel: { marginTop: 4, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 12 },
  segments: { flexDirection: 'row', marginTop: theme.spacing.md },
  segment: { flex: 1, height: 8, marginRight: 4, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.12)' },
  motivation: {
    marginTop: theme.spacing.md,
    color: 'rgba(255, 255, 255, 0.63)',
    fontFamily: 'Nunito-MediumItalic',
  },
  forecast: {
    marginTop: theme.spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm + 2,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  forecastText: { color: theme.colors.warning, fontFamily: theme.fonts.bodySemiBold },
  addZaks: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: theme.spacing.md,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addZaksText: { marginLeft: theme.spacing.sm, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  pillBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  pillColumn: { flex: 1, alignItems: 'center' },
  pill: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillOn: { borderColor: theme.colors.accent, backgroundColor: 'rgba(0, 180, 162, 0.25)' },
  pillOnOver: { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningSurface },
  pillLabel: { marginTop: 4, color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  actionRow: { flexDirection: 'row', marginTop: theme.spacing.md },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  actionPressed: { backgroundColor: 'rgba(0, 180, 162, 0.38)' },
  actionText: { marginTop: theme.spacing.sm, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 12 },
  toolRow: { flexDirection: 'row', marginTop: theme.spacing.md },
  toolButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  toolLabel: { marginTop: 6, color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  pressed: { opacity: 0.75 },
  learnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  learnText: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
});
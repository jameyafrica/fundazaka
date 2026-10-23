import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { CATEGORY_META } from '../../constants/categories';
import { pickMotivation } from '../../constants/motivation';
import { useScale } from '../../hooks/useScale';
import { formatRand } from '../../utils/format';
import { getHeroState } from '../../utils/dashboard';
import { getNextRoute } from '../../utils/routing';
import ScreenBackground from '../../components/ScreenBackground';
import CategoryIcon from '../../components/CategoryIcon';
import NavBar from '../../components/NavBar';

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
  const { user, displayName, onboardingCompleted, tourCompleted, resetPending, categoryRows, totals } = useBudget();
  const [selectedKey, setSelectedKey] = useState(null); // null = "Total" view
  const seed = useRef(Math.floor(Math.random() * 1000)).current;

  // Stay on the dashboard only when it is the right place (otherwise onboarding / reset).
  const route = getNextRoute({ user, onboardingCompleted, tourCompleted, resetPending });
  if (route !== '/(tabs)/home') return <Redirect href={route} />;

  // The designer's tiny sizes (6, 8, 10) are unreadable on a phone, so small text has a floor of 11.
  const fs = (size) => Math.max(11, scale(size));

  const selected = categoryRows.find((row) => row.key === selectedKey) || null;
  const hero = getHeroState(selected, totals);
  const motivation = pickMotivation(hero.motivationKind, seed);
  const isSavings = selected && selected.key === 'savings';
  const expenseLabel = isSavings ? 'Add Savings' : 'Pay Expense';

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
              {displayName ? `Welcome back, ${displayName}!` : 'Welcome back!'}
            </Text>
          </View>

          <View style={[styles.hero, hero.isOver && styles.heroOver]}>
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Zak-Buckz</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { fontSize: fs(10) }]}>{hero.primaryLabel}</Text>
                    <Text style={styles.statValue}>{formatRand(hero.primaryValue)}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { fontSize: fs(10) }]}>Target</Text>
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
                {selected && <Text style={styles.heroIconLabel}>{CATEGORY_META[selected.key].title}</Text>}
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

            <Text style={[styles.motivation, { fontSize: fs(12) }]}>{motivation}</Text>

            {selected && (
              <Pressable
                style={({ pressed }) => [styles.addZaks, pressed && styles.pressed]}
                onPress={goAddExpense}
                accessibilityRole="button"
                accessibilityLabel={`Add Zaks to ${CATEGORY_META[selected.key].title}`}
              >
                <AddZaksIcon width={22} height={22} />
                <Text style={styles.addZaksText}>Add Zaks</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.pillBar}>
            {pillItems.map((item) => {
              const isTotal = item.key === 'total';
              const isOn = isTotal ? selectedKey === null : selectedKey === item.key;
              const over = !isTotal && item.visual.isOver;
              return (
                <Pressable
                  key={item.key}
                  style={styles.pillColumn}
                  onPress={() => setSelectedKey(isTotal || isOn ? null : item.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isOn }}
                  accessibilityLabel={isTotal ? 'Total' : CATEGORY_META[item.key].title}
                >
                  <View style={[styles.pill, isOn && (over ? styles.pillOnOver : styles.pillOn)]}>
                    {isTotal ? (
                      <FnbLogo width={30} height={30} />
                    ) : (
                      <CategoryIcon categoryKey={item.key} variant="pill" size={30} visual={item.visual} />
                    )}
                  </View>
                  <Text style={[styles.pillLabel, { fontSize: fs(10) }]} numberOfLines={1}>
                    {isTotal ? 'Total' : CATEGORY_META[item.key].shortTitle}
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
              <Text style={styles.actionText}>Add Income</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}
              onPress={goAddExpense}
              accessibilityRole="button"
            >
              <ExpenseIcon width={32} height={32} />
              <Text style={styles.actionText}>{expenseLabel}</Text>
            </Pressable>
          </View>

          <View style={styles.toolRow}>
            {renderTool('AI Bot', AiBotIcon, '/ai-bot')}
            {renderTool('Breakdown', BreakdownIcon, '/breakdown')}
            {renderTool('Calculator', CalculatorIcon, '/calculator')}
          </View>

          <Pressable
            style={({ pressed }) => [styles.learnCard, pressed && styles.actionPressed]}
            onPress={() => router.push('/learning')}
            accessibilityRole="button"
            accessibilityLabel="Learning pathways"
          >
            <Text style={styles.learnText}>Let's get financially smart!</Text>
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

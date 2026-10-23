import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { useScale } from '../hooks/useScale';
import { formatRand } from '../utils/format';
import {
  TABS,
  filterTransactions,
  formatPeriod,
  formatShortDate,
  share,
  summarise,
} from '../utils/breakdown';
import ScreenBackground from '../components/ScreenBackground';
import NavBar from '../components/NavBar';

const TAB_LABELS = { all: 'All', income: 'Income', expenses: 'Expenses' };
const SOURCE_LABELS = { work: 'Work', gift: 'Gift', other: 'Other' };

function categoryTitle(key) {
  return CATEGORY_META[key] ? CATEGORY_META[key].title : key;
}

function Bar({ fraction, color }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.round(fraction * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

function StatCard({ label, value, tone, fs }) {
  return (
    <View style={[styles.statCard, tone === 'warning' && styles.statCardWarning]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, { fontSize: fs(20) }, tone === 'warning' && styles.textWarning]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {formatRand(value)}
      </Text>
    </View>
  );
}

function TransactionRow({ t, isLast }) {
  const isIncome = t.type === 'income';
  const title = isIncome ? SOURCE_LABELS[t.source] || 'Income' : categoryTitle(t.categoryKey);
  const subtitle = [formatShortDate(t.createdAt), t.note].filter(Boolean).join(' \u00B7 ');
  return (
    <View style={[styles.txRow, !isLast && styles.rowBorder]}>
      <View style={styles.txText}>
        <Text style={styles.txTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.txSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.txAmount, isIncome && styles.txIncome]}>
        {isIncome ? '+' : '\u2212'}
        {formatRand(t.amount)}
      </Text>
    </View>
  );
}

export default function BreakdownScreen() {
  const router = useRouter();
  const scale = useScale();
  const { user, categories, transactions, monthlyReports, cycleStartedAt } = useBudget();

  const [monthMode, setMonthMode] = useState('current'); // 'current' | 'previous'
  const [tab, setTab] = useState('all');
  const [reportId, setReportId] = useState(null);

  const reports = monthlyReports || [];
  const isCurrent = monthMode === 'current';
  const report = reports.find((r) => r.id === reportId) || reports[0] || null;

  // The period being shown, in the same shape for the current month and archived ones.
  const period = useMemo(() => {
    if (isCurrent) {
      return { categories, transactions, label: formatPeriod(cycleStartedAt, new Date().toISOString()) };
    }
    if (!report) return null;
    return {
      categories: report.categories,
      transactions: report.transactions || [],
      label: formatPeriod(report.periodStart, report.periodEnd),
    };
  }, [isCurrent, categories, transactions, cycleStartedAt, report]);

  const summary = useMemo(
    () => (period ? summarise(period.categories, period.transactions) : null),
    [period]
  );
  const list = useMemo(() => (period ? filterTransactions(period.transactions, tab) : []), [period, tab]);

  if (!user) return <Redirect href="/(auth)/login" />;

  const fs = (size) => Math.max(11, scale(size));

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const incomeRows = summary
    ? ['work', 'gift', 'other']
        .map((key) => ({ key, amount: summary.incomeBySource[key] || 0 }))
        .filter((row) => row.amount > 0)
    : [];

  const renderSegment = (items, active, onChange, getLabel) => (
    <View style={styles.segment}>
      {items.map((item) => {
        const isActive = active === item;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.segmentOption, isActive && styles.segmentOptionActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{getLabel(item)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderIncomeBreakdown = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Where it came from</Text>
      {incomeRows.length === 0 ? (
        <Text style={styles.emptyText}>No income logged for this month.</Text>
      ) : (
        incomeRows.map((row) => (
          <View key={row.key} style={styles.breakRow}>
            <View style={styles.breakTop}>
              <Text style={styles.breakName}>{SOURCE_LABELS[row.key]}</Text>
              <Text style={styles.breakAmount}>{formatRand(row.amount)}</Text>
            </View>
            <Bar fraction={share(row.amount, summary.totalIncome)} color={theme.colors.accent} />
          </View>
        ))
      )}
    </View>
  );

  const renderExpenseBreakdown = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Spent vs target</Text>
      {summary.categoryRows.length === 0 ? (
        <Text style={styles.emptyText}>No expenses set up for this month.</Text>
      ) : (
        summary.categoryRows.map((row) => (
          <View key={row.key} style={styles.breakRow}>
            <View style={styles.breakTop}>
              <Text style={styles.breakName}>{categoryTitle(row.key)}</Text>
              <Text style={[styles.breakAmount, row.isOver && styles.textWarning]}>
                {formatRand(row.spentAmount)} / {formatRand(row.targetAmount)}
              </Text>
            </View>
            <Bar fraction={row.ratio} color={row.isOver ? theme.colors.warning : theme.colors.accent} />
            {row.isOver ? (
              <Text style={styles.overText}>Over by {formatRand(row.overAmount)}</Text>
            ) : null}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <Text style={[styles.title, { fontSize: fs(24) }]}>Breakdown</Text>
            <View style={styles.headerButton} />
          </View>

          {renderSegment(['current', 'previous'], monthMode, setMonthMode, (m) =>
            m === 'current' ? 'Current Month' : 'Previous Months'
          )}

          {!isCurrent && reports.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodRow}
            >
              {reports.map((r) => {
                const active = report && r.id === report.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setReportId(r.id)}
                    style={[styles.periodChip, active && styles.periodChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: Boolean(active) }}
                  >
                    <Text style={[styles.periodText, active && styles.periodTextActive]}>
                      {formatPeriod(r.periodStart, r.periodEnd)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {!period ? (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>No previous months yet</Text>
              <Text style={styles.emptyText}>
                Your first report appears after your monthly reset, when this month is archived.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.periodLabel}>{period.label}</Text>

              {renderSegment(TABS, tab, setTab, (t) => TAB_LABELS[t])}

              {tab === 'all' && (
                <View style={styles.statRow}>
                  <StatCard label="Income" value={summary.totalIncome} fs={fs} />
                  <StatCard label="Expenses" value={summary.totalExpenses} fs={fs} />
                  <StatCard
                    label="Balance"
                    value={summary.balance}
                    tone={summary.balance < 0 ? 'warning' : undefined}
                    fs={fs}
                  />
                </View>
              )}

              {tab === 'income' && (
                <>
                  <View style={styles.totalCard}>
                    <Text style={styles.statLabel}>Total income</Text>
                    <Text style={[styles.totalValue, { fontSize: fs(34) }]} numberOfLines={1} adjustsFontSizeToFit>
                      {formatRand(summary.totalIncome)}
                    </Text>
                  </View>
                  {renderIncomeBreakdown()}
                </>
              )}

              {tab === 'expenses' && (
                <>
                  <View style={styles.totalCard}>
                    <Text style={styles.statLabel}>Total expenses</Text>
                    <Text style={[styles.totalValue, { fontSize: fs(34) }]} numberOfLines={1} adjustsFontSizeToFit>
                      {formatRand(summary.totalExpenses)}
                    </Text>
                  </View>
                  {renderExpenseBreakdown()}
                </>
              )}

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Transactions ({list.length})</Text>
                {list.length === 0 ? (
                  <Text style={styles.emptyText}>Nothing logged here yet.</Text>
                ) : (
                  list.map((t, index) => (
                    <TransactionRow key={t.id} t={t} isLast={index === list.length - 1} />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  pressed: { opacity: 0.7 },
  textWarning: { color: theme.colors.warning },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  segment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    padding: 4,
    marginTop: 4,
  },
  segmentOption: { flex: 1, paddingVertical: 10, borderRadius: theme.radius.pill, alignItems: 'center' },
  segmentOptionActive: { backgroundColor: theme.colors.accent },
  segmentText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  segmentTextActive: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  periodRow: { gap: 8, paddingTop: 12, paddingBottom: 4 },
  periodChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  periodChipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  periodText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13 },
  periodTextActive: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  periodLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },

  statRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statCardWarning: { backgroundColor: theme.colors.warningSurface, borderColor: theme.colors.warning },
  statLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13, marginBottom: 4 },
  statValue: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  totalCard: {
    marginTop: 16,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 18,
  },
  totalValue: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  card: {
    marginTop: 16,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16, marginBottom: 10 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17, marginBottom: 6 },
  emptyText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 14, textAlign: 'center' },

  breakRow: { marginBottom: 14 },
  breakTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakName: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },
  breakAmount: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  overText: { color: theme.colors.warning, fontFamily: theme.fonts.bodySemiBold, fontSize: 12, marginTop: 4 },

  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.surfaceBorder },
  txText: { flex: 1, paddingRight: 12 },
  txTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },
  txSubtitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13, marginTop: 2 },
  txAmount: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  txIncome: { color: theme.colors.accent },
});

import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { useT } from '../i18n/LanguageContext';
import { localizeError } from '../i18n/errors';
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
import { getWeekdayPatterns } from '../utils/weekday';
import ScreenBackground from '../components/ScreenBackground';
import NavBar from '../components/NavBar';


// Title of one transaction row: the income source or the expense category, in the chosen language.
function rowTitle(tr, t) {
  if (t.type === 'income') return t.source ? tr(`income.${t.source}`) : tr('tx.income');
  return t.categoryKey ? tr(`cat.${t.categoryKey}.title`) : '';
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

function TransactionRow({ t, tr, months, isLast, onEdit, onDelete }) {
  const isIncome = t.type === 'income';
  const title = rowTitle(tr, t);
  const subtitle = [formatShortDate(t.createdAt, months), t.note].filter(Boolean).join(' \u00B7 ');
  const amountText = `${isIncome ? '+' : '\u2212'}${formatRand(t.amount)}`;
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
      <Text style={[styles.txAmount, isIncome && styles.txIncome]}>{amountText}</Text>
      {onEdit && (
        <Pressable
          onPress={() => onEdit(t)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={tr('bd.editItemA11y', { title, amount: formatRand(t.amount) })}
          style={({ pressed }) => [styles.txAction, pressed && styles.pressed]}
        >
          <Text style={styles.txActionText}>{tr('common.edit')}</Text>
        </Pressable>
      )}
      {onDelete && (
        <Pressable
          onPress={() => onDelete(t)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={tr('bd.deleteItemA11y', { title, amount: formatRand(t.amount) })}
          style={({ pressed }) => [styles.txAction, styles.txActionDelete, pressed && styles.pressed]}
        >
          <Text style={[styles.txActionText, styles.textWarning]}>{tr('common.delete')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function BreakdownScreen() {
  const router = useRouter();
  const scale = useScale();
  const { t: tr, tList } = useT();
  const months = tList('date.months');
  const weekdays = tList('date.weekdays');
  const { user, categories, transactions, monthlyReports, cycleStartedAt, removeTransaction, updateTransaction } = useBudget();

  const [monthMode, setMonthMode] = useState('current'); // 'current' | 'previous'
  const [tab, setTab] = useState('all');
  const [reportId, setReportId] = useState(null);
  const [editing, setEditing] = useState(null); // { id, amountText, note, title }
  const [editError, setEditError] = useState('');

  const reports = monthlyReports || [];
  const isCurrent = monthMode === 'current';
  const report = reports.find((r) => r.id === reportId) || reports[0] || null;

  // The period being shown, in the same shape for the current month and archived ones.
  const period = useMemo(() => {
    if (isCurrent) {
      return { categories, transactions, label: formatPeriod(cycleStartedAt, new Date().toISOString(), months, tr('date.earlierMonth')) };
    }
    if (!report) return null;
    return {
      categories: report.categories,
      transactions: report.transactions || [],
      label: formatPeriod(report.periodStart, report.periodEnd, months, tr('date.earlierMonth')),
    };
  }, [isCurrent, categories, transactions, cycleStartedAt, report, months, tr]);

  const summary = useMemo(
    () => (period ? summarise(period.categories, period.transactions) : null),
    [period]
  );
  const list = useMemo(() => (period ? filterTransactions(period.transactions, tab) : []), [period, tab]);
  const patterns = useMemo(() => getWeekdayPatterns(transactions, reports), [transactions, reports]);

  if (!user) return <Redirect href="/(auth)/login" />;

  const fs = (size) => Math.max(11, scale(size));

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  // Only this cycle can be corrected. Archived months are history and stay as they were.
  const startEdit = (t) => {
    setEditError('');
    setEditing({
      id: t.id,
      amountText: String(t.amount),
      note: t.note || '',
      title: rowTitle(tr, t),
    });
  };
  const saveEdit = () => {
    if (!editing) return;
    const result = updateTransaction(editing.id, { amount: editing.amountText, note: editing.note });
    if (!result.ok) {
      setEditError(localizeError(tr, result.error));
      return;
    }
    setEditing(null);
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
      <Text style={styles.cardTitle}>{tr('bd.whereFrom')}</Text>
      {incomeRows.length === 0 ? (
        <Text style={styles.emptyText}>{tr('bd.noIncome')}</Text>
      ) : (
        incomeRows.map((row) => (
          <View key={row.key} style={styles.breakRow}>
            <View style={styles.breakTop}>
              <Text style={styles.breakName}>{tr(`income.${row.key}`)}</Text>
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
      <Text style={styles.cardTitle}>{tr('bd.spentVsTarget')}</Text>
      {summary.categoryRows.length === 0 ? (
        <Text style={styles.emptyText}>{tr('bd.noExpenses')}</Text>
      ) : (
        summary.categoryRows.map((row) => (
          <View key={row.key} style={styles.breakRow}>
            <View style={styles.breakTop}>
              <Text style={styles.breakName}>{tr(`cat.${row.key}.title`)}</Text>
              <Text style={[styles.breakAmount, row.isOver && styles.textWarning]}>
                {formatRand(row.spentAmount)} / {formatRand(row.targetAmount)}
              </Text>
            </View>
            <Bar fraction={row.ratio} color={row.isOver ? theme.colors.warning : theme.colors.accent} />
            {row.isOver ? (
              <Text style={styles.overText}>{tr('bd.overBy', { amount: formatRand(row.overAmount) })}</Text>
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
              accessibilityLabel={tr('common.backA11y')}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Text style={styles.headerIcon}>{'\u2039'}</Text>
            </Pressable>
            <Text style={[styles.title, { fontSize: fs(24) }]}>{tr('home.breakdown')}</Text>
            <View style={styles.headerButton} />
          </View>

          {renderSegment(['current', 'previous'], monthMode, setMonthMode, (m) =>
            m === 'current' ? tr('bd.current') : tr('bd.previous')
          )}

          {reports.length > 0 && (
            <Pressable
              onPress={() => router.push('/income-proof')}
              style={({ pressed }) => [styles.proofCard, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={tr('bd.proofTitle')}
            >
              <View style={styles.proofText}>
                <Text style={styles.proofTitle}>{tr('bd.proofTitle')}</Text>
                <Text style={styles.proofSub}>{tr('bd.proofSub')}</Text>
              </View>
              <Text style={styles.proofChevron}>{'\u203A'}</Text>
            </Pressable>
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
                      {formatPeriod(r.periodStart, r.periodEnd, months, tr('date.earlierMonth'))}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {!period ? (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>{tr('bd.noPrevTitle')}</Text>
              <Text style={styles.emptyText}>
                {tr('bd.noPrevBody')}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.periodLabel}>{period.label}</Text>

              {renderSegment(TABS, tab, setTab, (k) => tr(`bd.tab.${k}`))}

              {tab === 'all' && (
                <View style={styles.statRow}>
                  <StatCard label={tr('bd.tab.income')} value={summary.totalIncome} fs={fs} />
                  <StatCard label={tr('bd.tab.expenses')} value={summary.totalExpenses} fs={fs} />
                  <StatCard
                    label={tr('hero.balance')}
                    value={summary.balance}
                    tone={summary.balance < 0 ? 'warning' : undefined}
                    fs={fs}
                  />
                </View>
              )}

              {tab === 'income' && (
                <>
                  <View style={styles.totalCard}>
                    <Text style={styles.statLabel}>{tr('bd.totalIncome')}</Text>
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
                    <Text style={styles.statLabel}>{tr('bd.totalExpenses')}</Text>
                    <Text style={[styles.totalValue, { fontSize: fs(34) }]} numberOfLines={1} adjustsFontSizeToFit>
                      {formatRand(summary.totalExpenses)}
                    </Text>
                  </View>
                  {renderExpenseBreakdown()}
                </>
              )}

              {tab === 'expenses' && patterns.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{tr('bd.pattern')}</Text>
                  {patterns.slice(0, 2).map((p) => (
                    <Text key={p.key} style={styles.patternText}>
                      {tr('bd.patternLine', { percent: p.percent, category: tr(`cat.${p.key}.title`).toLowerCase(), day: weekdays[p.dayIndex] || p.dayName })}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{tr('bd.transactions', { count: list.length })}</Text>
                {list.length === 0 ? (
                  <Text style={styles.emptyText}>{tr('bd.empty')}</Text>
                ) : (
                  list.map((t, index) => (
                    <TransactionRow
                      key={t.id}
                      t={t}
                      tr={tr}
                      months={months}
                      isLast={index === list.length - 1}
                      onEdit={isCurrent ? startEdit : undefined}
                      onDelete={isCurrent ? (item) => removeTransaction(item.id) : undefined}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <NavBar />

      <Modal visible={Boolean(editing)} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{tr('bd.editTitle', { title: editing ? editing.title : '' })}</Text>
            <Text style={styles.modalLabel}>{tr('common.amount')}</Text>
            <TextInput
              style={styles.modalInput}
              value={editing ? editing.amountText : ''}
              onChangeText={(text) => {
                setEditError('');
                setEditing((prev) => (prev ? { ...prev, amountText: text } : prev));
              }}
              keyboardType="decimal-pad"
              maxLength={12}
              autoFocus
              accessibilityLabel={tr('bd.editAmountA11y')}
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
            <Text style={styles.modalLabel}>{tr('common.note')}</Text>
            <TextInput
              style={styles.modalInput}
              value={editing ? editing.note : ''}
              onChangeText={(text) => setEditing((prev) => (prev ? { ...prev, note: text } : prev))}
              maxLength={60}
              accessibilityLabel={tr('bd.editNoteA11y')}
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
            {editError ? <Text style={styles.modalError}>{editError}</Text> : null}
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setEditing(null)}
                style={({ pressed }) => [styles.modalCancel, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.modalCancelText}>{tr('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={saveEdit}
                style={({ pressed }) => [styles.modalSave, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={tr('bd.saveChanges')}
              >
                <Text style={styles.modalSaveText}>{tr('common.save')}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  txAction: { marginLeft: 10, paddingVertical: 4, paddingHorizontal: 8, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  txActionDelete: { borderColor: theme.colors.warning },
  txActionText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 12 },
  patternText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 15, marginBottom: 6 },

  proofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 14,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  proofText: { flex: 1 },
  proofTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
  proofSub: { marginTop: 2, color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13 },
  proofChevron: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 28, marginLeft: 8 },

  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalCard: {
    padding: 20,
    borderRadius: theme.radius.card,
    backgroundColor: '#0A3638',
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  modalTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 20 },
  modalLabel: { marginTop: 16, marginBottom: 6, color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 16,
  },
  modalError: { marginTop: 12, color: theme.colors.warning, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  modalButtons: { flexDirection: 'row', marginTop: 20, gap: 10 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.surfaceBorder, alignItems: 'center' },
  modalCancelText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },
  modalSave: { flex: 1, paddingVertical: 14, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent, alignItems: 'center' },
  modalSaveText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
});
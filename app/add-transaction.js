import React, { useMemo, useState } from 'react';
import {
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
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { useScale } from '../hooks/useScale';
import { formatRand } from '../utils/format';
import { addMoney, parseMoney, subtractMoney } from '../utils/money';
import ScreenBackground from '../components/ScreenBackground';
import CategoryIcon from '../components/CategoryIcon';

const SOURCES = [
  { key: 'work', label: 'Work' },
  { key: 'gift', label: 'Gift' },
  { key: 'other', label: 'Other' },
];


export default function AddTransactionScreen() {
  const router = useRouter();
  const scale = useScale();
  const params = useLocalSearchParams();
  const { user, categoryRows, logIncome, payExpense } = useBudget();

  const [mode, setMode] = useState(params.type === 'income' ? 'income' : 'expense');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [source, setSource] = useState('work');
  const [categoryKey, setCategoryKey] = useState(() => {
    const wanted = Array.isArray(params.category) ? params.category[0] : params.category;
    if (wanted && categoryRows.some((row) => row.key === wanted)) return wanted;
    return categoryRows.length ? categoryRows[0].key : null;
  });
  const [error, setError] = useState('');

  // Strict parsing (utils/money.js): "1500", "1 500", "1500,50" and "R1500.50" are fine;
  // "1e308", "12e3", "0x10" and amounts above R9 999 999.99 are rejected with a clear message.
  const parsedAmount = amountText.trim() ? parseMoney(amountText) : null;
  const amount = parsedAmount && parsedAmount.ok ? parsedAmount.amount : 0;
  const amountProblem = parsedAmount && !parsedAmount.ok ? parsedAmount.error : '';
  const selectedRow = categoryRows.find((row) => row.key === categoryKey) || null;
  const isSavings = categoryKey === 'savings';
  const isIncome = mode === 'income';

  // Live heads-up so the user sees the consequence before they save.
  const preview = useMemo(() => {
    if (isIncome || !selectedRow || amount <= 0) return null;
    const after = addMoney(selectedRow.spentAmount, amount);
    if (isSavings) {
      const left = subtractMoney(selectedRow.targetAmount, after);
      return left >= 0
        ? { tone: 'info', text: `${formatRand(left)} left to reach your savings target.` }
        : { tone: 'info', text: `Target reached. That is ${formatRand(-left)} extra saved!` };
    }
    const left = subtractMoney(selectedRow.targetAmount, after);
    return left >= 0
      ? { tone: 'info', text: `${formatRand(left)} will be left in ${CATEGORY_META[categoryKey].title}.` }
      : { tone: 'warning', text: `This puts ${CATEGORY_META[categoryKey].title} ${formatRand(-left)} over target.` };
  }, [isIncome, selectedRow, amount, isSavings, categoryKey]);

  if (!user) return <Redirect href="/(auth)/login" />;

  const fs = (size) => Math.max(11, scale(size));
  const actionLabel = isIncome ? 'Add Income' : isSavings ? 'Add Savings' : 'Pay Expense';

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const onSave = () => {
    setError('');
    const result = isIncome
      ? logIncome({ amount, source, note: note.trim() })
      : payExpense({ amount, categoryKey, note: note.trim() });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable
                onPress={close}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
              <Text style={[styles.title, { fontSize: fs(26) }]}>{actionLabel}</Text>
              <View style={styles.closeButton} />
            </View>

            <View style={styles.toggle}>
              {[
                { key: 'income', label: 'Income' },
                { key: 'expense', label: 'Expense' },
              ].map((item) => {
                const active = mode === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => switchMode(item.key)}
                    style={[styles.toggleOption, active && styles.toggleOptionActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Amount</Text>
            <View style={[styles.card, styles.amountCard]}>
              <Text style={[styles.currency, { fontSize: fs(34) }]}>R</Text>
              <TextInput
                style={[styles.amountInput, { fontSize: fs(34) }]}
                value={amountText}
                onChangeText={(text) => {
                  setAmountText(text);
                  setError('');
                }}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="decimal-pad"
                autoFocus
                maxLength={12}
                accessibilityLabel="Amount in rand"
              />
            </View>

            {isIncome ? (
              <>
                <Text style={styles.label}>Where did it come from?</Text>
                <View style={styles.chipRow}>
                  {SOURCES.map((item) => {
                    const active = source === item.key;
                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => setSource(item.key)}
                        style={[styles.chip, active && styles.chipActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Which expense?</Text>
                {categoryRows.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.emptyText}>You have no expenses set up yet.</Text>
                  </View>
                ) : (
                  <View style={styles.categoryGrid}>
                    {categoryRows.map((row) => {
                      const active = categoryKey === row.key;
                      return (
                        <Pressable
                          key={row.key}
                          onPress={() => {
                            setCategoryKey(row.key);
                            setError('');
                          }}
                          style={[
                            styles.categoryTile,
                            active && styles.categoryTileActive,
                            active && row.visual.isOver && styles.categoryTileOver,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          accessibilityLabel={CATEGORY_META[row.key].title}
                        >
                          <CategoryIcon categoryKey={row.key} size={32} variant="pill" visual={row.visual} />
                          <Text style={styles.categoryText} numberOfLines={1}>
                            {CATEGORY_META[row.key].shortTitle}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            <Text style={styles.label}>Note (optional)</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder={isIncome ? 'e.g. Saturday delivery shift' : 'e.g. Taxi to town'}
                placeholderTextColor="rgba(255,255,255,0.35)"
                maxLength={60}
                accessibilityLabel="Note"
              />
            </View>

            {preview && (
              <View style={[styles.preview, preview.tone === 'warning' && styles.previewWarning]}>
                <Text style={[styles.previewText, preview.tone === 'warning' && styles.previewTextWarning]}>
                  {preview.text}
                </Text>
              </View>
            )}

            {amountProblem ? <Text style={styles.error}>{amountProblem}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={onSave}
              style={({ pressed }) => [
                styles.saveButton,
                amount <= 0 && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: amount <= 0 }}
              disabled={amount <= 0}
            >
              <Text style={styles.saveText}>
                {amount > 0 ? `${actionLabel} · ${formatRand(amount)}` : actionLabel}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 20 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  toggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  toggleOptionActive: { backgroundColor: theme.colors.accent },
  toggleText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },
  toggleTextActive: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    marginTop: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    paddingHorizontal: 16,
  },
  amountCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  currency: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, marginRight: 8 },
  amountInput: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    paddingVertical: 10,
  },
  noteInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyLight,
    fontSize: 16,
    paddingVertical: 14,
  },
  emptyText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, paddingVertical: 16 },

  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.card,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  chipText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },
  chipTextActive: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryTile: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    gap: 6,
  },
  categoryTileActive: { borderColor: theme.colors.accent, borderWidth: 2 },
  categoryTileOver: { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningSurface },
  categoryText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 13 },

  preview: {
    marginTop: 18,
    padding: 14,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  previewWarning: { backgroundColor: theme.colors.warningSurface, borderColor: theme.colors.warning },
  previewText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  previewTextWarning: { color: theme.colors.warning },

  error: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    marginTop: 14,
  },

  saveButton: {
    marginTop: 26,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.45 },
  saveText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
});
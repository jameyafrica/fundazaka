import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { useScale } from '../hooks/useScale';
import ScreenBackground from '../components/ScreenBackground';
import {
  OPERATOR_SYMBOLS,
  backspace,
  clearAll,
  equals,
  formatDisplay,
  getExpression,
  initialCalc,
  inputDigit,
  inputDot,
  percent,
  setOperator,
  toggleSign,
} from '../utils/calculator';

// kind: 'fn' (grey-teal), 'op' (operator), 'num' (digit), 'eq' (equals).
const KEYS = [
  [
    { label: 'AC', kind: 'fn', action: 'clear', a11y: 'All clear' },
    { label: '\u232B', kind: 'fn', action: 'backspace', a11y: 'Delete' },
    { label: '%', kind: 'fn', action: 'percent', a11y: 'Percent' },
    { label: OPERATOR_SYMBOLS['/'], kind: 'op', action: 'op', value: '/', a11y: 'Divide' },
  ],
  [
    { label: '7', kind: 'num', action: 'digit', value: '7' },
    { label: '8', kind: 'num', action: 'digit', value: '8' },
    { label: '9', kind: 'num', action: 'digit', value: '9' },
    { label: OPERATOR_SYMBOLS['*'], kind: 'op', action: 'op', value: '*', a11y: 'Multiply' },
  ],
  [
    { label: '4', kind: 'num', action: 'digit', value: '4' },
    { label: '5', kind: 'num', action: 'digit', value: '5' },
    { label: '6', kind: 'num', action: 'digit', value: '6' },
    { label: OPERATOR_SYMBOLS['-'], kind: 'op', action: 'op', value: '-', a11y: 'Subtract' },
  ],
  [
    { label: '1', kind: 'num', action: 'digit', value: '1' },
    { label: '2', kind: 'num', action: 'digit', value: '2' },
    { label: '3', kind: 'num', action: 'digit', value: '3' },
    { label: OPERATOR_SYMBOLS['+'], kind: 'op', action: 'op', value: '+', a11y: 'Add' },
  ],
  [
    { label: '+/\u2212', kind: 'num', action: 'sign', a11y: 'Plus or minus' },
    { label: '0', kind: 'num', action: 'digit', value: '0' },
    { label: '.', kind: 'num', action: 'dot', a11y: 'Decimal point' },
    { label: '=', kind: 'eq', action: 'equals', a11y: 'Equals' },
  ],
];

export default function CalculatorScreen() {
  const router = useRouter();
  const scale = useScale();
  const { user } = useBudget();
  const [calc, setCalc] = useState(initialCalc);

  if (!user) return <Redirect href="/(auth)/login" />;

  const press = (key) => {
    setCalc((prev) => {
      switch (key.action) {
        case 'digit': return inputDigit(prev, key.value);
        case 'dot': return inputDot(prev);
        case 'op': return setOperator(prev, key.value);
        case 'equals': return equals(prev);
        case 'sign': return toggleSign(prev);
        case 'percent': return percent(prev);
        case 'backspace': return backspace(prev);
        case 'clear': return clearAll();
        default: return prev;
      }
    });
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const keyHeight = scale(64);
  const expression = getExpression(calc);

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
          <Text style={styles.title}>Calculator</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.displayCard}>
          <Text style={styles.expression} numberOfLines={1}>
            {expression}
          </Text>
          <Text
            style={[styles.display, calc.error && styles.displayError]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Display ${formatDisplay(calc.display)}`}
          >
            {formatDisplay(calc.display)}
          </Text>
        </View>

        <View style={styles.keypad}>
          {KEYS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyRow}>
              {row.map((key) => {
                const isActiveOp = key.action === 'op' && calc.op === key.value && calc.fresh;
                return (
                  <Pressable
                    key={key.label}
                    onPress={() => press(key)}
                    accessibilityRole="button"
                    accessibilityLabel={key.a11y || key.label}
                    style={({ pressed }) => [
                      styles.key,
                      { height: keyHeight },
                      key.kind === 'fn' && styles.keyFn,
                      key.kind === 'op' && styles.keyOp,
                      key.kind === 'eq' && styles.keyEq,
                      isActiveOp && styles.keyOpActive,
                      pressed && styles.keyPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.keyText,
                        { fontSize: scale(key.kind === 'num' || key.kind === 'eq' ? 26 : 22) },
                        isActiveOp && styles.keyTextActive,
                      ]}
                    >
                      {key.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 22 },

  displayCard: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  expression: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 18,
    textAlign: 'right',
    minHeight: 24,
  },
  display: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 64,
    textAlign: 'right',
  },
  displayError: { color: theme.colors.warning },

  keypad: { gap: 10, paddingBottom: 16 },
  keyRow: { flexDirection: 'row', gap: 10 },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.card,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  keyFn: { backgroundColor: 'rgba(0, 168, 150, 0.28)', borderColor: theme.colors.surfaceBorder },
  keyOp: { backgroundColor: 'rgba(0, 180, 162, 0.45)', borderColor: theme.colors.accent },
  keyOpActive: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
  keyEq: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  keyPressed: { opacity: 0.6 },
  keyText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  keyTextActive: { color: theme.colors.background },
});

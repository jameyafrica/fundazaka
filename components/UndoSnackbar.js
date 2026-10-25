import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { formatRand } from '../utils/format';
import { CATEGORY_META } from '../constants/categories';

export const UNDO_VISIBLE_MS = 6000;

// What the snackbar says for each kind of change.
export function describeUndo(entry) {
  if (!entry || !entry.transaction) return '';
  const t = entry.transaction;
  const what =
    t.type === 'income'
      ? `${formatRand(t.amount)} income`
      : `${formatRand(t.amount)} ${CATEGORY_META[t.categoryKey] ? CATEGORY_META[t.categoryKey].title : 'expense'}`;
  if (entry.kind === 'removed') return `${what} deleted`;
  if (entry.kind === 'edited') return `Changed to ${what}`;
  return `${what} added`;
}

// One global "Undo" bar for every add, delete and edit. Sits above the nav bar, hides itself
// after a few seconds, and is rendered once in the root layout.
export default function UndoSnackbar() {
  const { undoEntry, undoLast, dismissUndo } = useBudget();

  useEffect(() => {
    if (!undoEntry) return undefined;
    const timer = setTimeout(dismissUndo, UNDO_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [undoEntry, dismissUndo]);

  if (!undoEntry) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar} accessibilityLiveRegion="polite">
        <Text style={styles.text} numberOfLines={1}>
          {describeUndo(undoEntry)}
        </Text>
        <Pressable
          onPress={undoLast}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Undo"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Undo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 50, elevation: 50 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: theme.radius.control,
    backgroundColor: '#0A3638',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  text: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  button: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent },
  buttonText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
  pressed: { opacity: 0.7 },
});

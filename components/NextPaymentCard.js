import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useT } from '../i18n/LanguageContext';
import { useScale } from '../hooks/useScale';
import { formatRand } from '../utils/format';

// Dashboard card: "Next payment, likely around Thu 29 Oct". It shows what Zak has learned about
// this person's pay rhythm (see getNextPaymentCard in utils/dashboard.js). Tapping it opens Zak.
// card.kind: 'learning' | 'upcoming' | 'today' | 'overdue'.
export default function NextPaymentCard({ card, onPress }) {
  const { t } = useT();
  const scale = useScale();
  if (!card) return null;

  const fs = (size) => Math.max(11, scale(size));
  const isOver = card.kind === 'overdue';
  const isLearning = card.kind === 'learning';

  let headline;
  if (card.kind === 'upcoming') headline = t('home.nextPay.upcoming', { date: card.date });
  else if (card.kind === 'today') headline = t('home.nextPay.today');
  else if (isOver) headline = t('home.nextPay.overdue');
  else headline = t('home.nextPay.learning', { count: card.count });

  let amounts = null;
  if (!isLearning) {
    amounts =
      card.low === card.high
        ? t('home.nextPay.usually', { amount: formatRand(card.typical) })
        : t('home.nextPay.range', { low: formatRand(card.low), high: formatRand(card.high) });
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, isOver && styles.cardOver, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('home.nextPay.a11y')}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { fontSize: fs(10) }]}>{t('home.nextPay.title')}</Text>
        {!isLearning && (
          <View style={styles.tag}>
            <Text style={[styles.tagText, { fontSize: fs(10) }]}>{t(`home.nextPay.conf.${card.confidence}`)}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.headline, { fontSize: fs(isLearning ? 13 : 16) }]}>{headline}</Text>
      {amounts ? <Text style={[styles.amounts, { fontSize: fs(12) }]}>{amounts}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  cardOver: { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningSurface },
  pressed: { opacity: 0.75 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: theme.colors.textMuted, fontFamily: 'Nunito-MediumItalic' },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold },
  headline: { marginTop: 4, color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  amounts: { marginTop: 2, color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight },
});
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { useScale } from '../hooks/useScale';
import { formatRand } from '../utils/format';
import { buildIncomeProof } from '../utils/incomeProof';
import { shareProofPdf } from '../lib/shareProofPdf';
import ScreenBackground from '../components/ScreenBackground';

const DISCLAIMER =
  'Self-declared: this is your own record from Fundazaka. It has not been verified by a bank, and each lender decides whether to accept it.';

function Stat({ label, value, fs }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { fontSize: fs(20) }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {formatRand(value)}
      </Text>
    </View>
  );
}

export default function IncomeProofScreen() {
  const router = useRouter();
  const scale = useScale();
  const { user, displayName, monthlyReports } = useBudget();
  const [shareError, setShareError] = useState('');
  const [sharing, setSharing] = useState(false);

  const proof = useMemo(() => buildIncomeProof(monthlyReports || [], new Date()), [monthlyReports]);

  if (!user) return <Redirect href="/(auth)/login" />;

  const fs = (size) => Math.max(11, scale(size));
  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/breakdown');
  };

  const onShare = async () => {
    if (sharing) return;
    setShareError('');
    setSharing(true);
    try {
      await shareProofPdf(proof, displayName);
    } catch (e) {
      console.warn('PDF share failed:', e);
      setShareError('Could not create the PDF. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  // Widest month is the full bar, so the chart shows the swing at a glance.
  const widest = proof.ok ? Math.max(...proof.months.map((m) => m.income), 1) : 1;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
            <Text style={[styles.title, { fontSize: fs(24) }]}>Proof of income</Text>
            <View style={styles.headerButton} />
          </View>

          {!proof.ok ? (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>No finished months yet</Text>
              <Text style={styles.emptyText}>
                Your summary appears after your first monthly reset, when a month is archived. Keep logging every payment.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.intro}>
                {proof.count} month{proof.count === 1 ? '' : 's'} recorded. Irregular earners rarely have payslips, so this
                shows how much you really bring in.
              </Text>

              <View style={styles.totalCard}>
                <Text style={styles.statLabel}>Average per month</Text>
                <Text style={[styles.totalValue, { fontSize: fs(34) }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatRand(proof.average)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Stat label="Lowest month" value={proof.lowest} fs={fs} />
                <Stat label="Highest month" value={proof.highest} fs={fs} />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Month by month</Text>
                {proof.months.map((m) => (
                  <View key={m.id} style={styles.monthRow}>
                    <View style={styles.monthTop}>
                      <Text style={styles.monthName}>{m.label}</Text>
                      <Text style={styles.monthAmount}>{formatRand(m.income)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.round((m.income / widest) * 100)}%` }]} />
                    </View>
                  </View>
                ))}
                <Text style={styles.workShare}>{Math.round(proof.workShare * 100)}% of this income came from work.</Text>
              </View>

              <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
              {shareError ? <Text style={styles.error}>{shareError}</Text> : null}

              <Pressable
                onPress={onShare}
                disabled={sharing}
                style={({ pressed }) => [styles.shareButton, (pressed || sharing) && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Share income summary"
                accessibilityState={{ disabled: sharing, busy: sharing }}
              >
                {sharing ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <Text style={styles.shareText}>Share as PDF</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  pressed: { opacity: 0.7 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 12 },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  intro: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 14, lineHeight: 20, marginBottom: 4 },

  totalCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  totalValue: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  statLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13, marginBottom: 4 },
  statValue: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },

  card: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
  },
  cardTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16, marginBottom: 10 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17, marginBottom: 6 },
  emptyText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 14, textAlign: 'center' },

  monthRow: { marginBottom: 14 },
  monthTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  monthName: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  monthAmount: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: theme.colors.accent },
  workShare: { marginTop: 2, color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13 },

  disclaimer: { marginTop: 16, color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13, lineHeight: 18 },
  error: { marginTop: 12, color: theme.colors.warning, fontFamily: theme.fonts.bodySemiBold, fontSize: 14 },
  shareButton: { marginTop: 20, paddingVertical: 16, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent, alignItems: 'center' },
  shareText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
});

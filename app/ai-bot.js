import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
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
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../constants/theme';
import { useScale } from '../hooks/useScale';
import { answerQuestion, getGreetingInsights } from '../utils/insights';
import ScreenBackground from '../components/ScreenBackground';
import NavBar from '../components/NavBar';

// Zak: the offline money assistant. Every answer is worked out on the phone from the
// user's own transactions (see utils/insights.js), so it uses no mobile data.
export const SUGGESTIONS = [
  'How much can I spend today?',
  'Will I go over budget?',
  'How is my income?',
  'How do I spot a scam?',
];

function buildOpeningMessage(ctx) {
  const name = ctx.displayName ? `, ${ctx.displayName}` : '';
  const insights = getGreetingInsights(ctx, new Date());
  const body = insights.length > 0 ? `\n\nHere is what I see right now:\n${insights.map((l) => `\u2022 ${l}`).join('\n')}` : '';
  return `Howzit${name}! I am Zak, your money assistant. I run on your phone, so I use no data.${body}`;
}

export default function AiBotScreen() {
  const router = useRouter();
  const fs = useScale();
  const budget = useBudget();
  const { user } = budget;
  const nextId = useRef(1);
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const ctx = useMemo(
    () => ({
      displayName: budget.displayName,
      categoryRows: budget.categoryRows || [],
      totals: budget.totals || { income: 0, expenses: 0, target: 0, balance: 0 },
      transactions: budget.transactions || [],
      monthlyReports: budget.monthlyReports || [],
      resetDay: budget.resetDay,
      cycleStartedAt: budget.cycleStartedAt,
      learning: budget.learning,
    }),
    [budget.displayName, budget.categoryRows, budget.totals, budget.transactions, budget.monthlyReports, budget.resetDay, budget.cycleStartedAt, budget.learning]
  );

  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'bot', text: buildOpeningMessage(ctx), action: null },
  ]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!user) return <Redirect href="/(auth)/login" />;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const ask = (text) => {
    const question = String(text || '').trim();
    if (!question) return;
    const answer = answerQuestion(question, ctx, new Date());
    const userId = `m${nextId.current++}`;
    const botId = `m${nextId.current++}`;
    setMessages((prev) => [
      ...prev,
      { id: userId, from: 'user', text: question, action: null },
      { id: botId, from: 'bot', text: answer.text, action: answer.action },
    ]);
    setDraft('');
  };

  const canSend = draft.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { fontSize: fs(22) }]}>Zak</Text>
            <Text style={[styles.subtitle, { fontSize: fs(12) }]}>Your money assistant {'\u00B7'} works offline</Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current && scrollRef.current.scrollToEnd({ animated: true })}
          >
            {messages.map((m) => (
              <View key={m.id} style={[styles.row, m.from === 'user' ? styles.rowUser : styles.rowBot]}>
                <View style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text style={[styles.bubbleText, { fontSize: fs(15), lineHeight: fs(22) }]}>{m.text}</Text>
                  {m.action ? (
                    <Pressable
                      onPress={() => router.push(m.action.route)}
                      accessibilityRole="button"
                      accessibilityLabel={m.action.label}
                      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.actionText}>{m.action.label}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chips}
            keyboardShouldPersistTaps="handled"
          >
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => ask(s)}
                accessibilityRole="button"
                accessibilityLabel={s}
                style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              >
                <Text style={[styles.chipText, { fontSize: fs(13) }]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => ask(draft)}
              placeholder="Ask Zak about your money"
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel="Message"
              returnKeyType="send"
              maxLength={200}
              style={[styles.input, { fontSize: fs(15) }]}
            />
            <Pressable
              onPress={() => ask(draft)}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send"
              accessibilityState={{ disabled: !canSend }}
              style={({ pressed }) => [styles.send, !canSend && styles.sendDisabled, pressed && styles.pressed]}
            >
              <Text style={styles.sendText}>{'\u2192'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {keyboardOpen ? null : <NavBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  pressed: { opacity: 0.75 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 12 },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  headerCenter: { alignItems: 'center' },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  subtitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight },
  messages: { paddingVertical: 8, gap: 10 },
  row: { flexDirection: 'row' },
  rowBot: { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '86%', borderRadius: theme.radius.card, paddingVertical: 12, paddingHorizontal: 16 },
  bubbleBot: { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder, borderWidth: 1, borderBottomLeftRadius: 6 },
  bubbleUser: { backgroundColor: theme.colors.accent, borderBottomRightRadius: 6 },
  bubbleText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
  chipsScroll: { flexGrow: 0, marginTop: 8 },
  chips: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemiBold,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 22, lineHeight: 26 },
});
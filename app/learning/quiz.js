import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { getCourse } from '../../constants/courses';
import { BADGES } from '../../constants/badges';
import { useScale } from '../../hooks/useScale';
import { getCurrentStreak } from '../../utils/learning';
import ScreenBackground from '../../components/ScreenBackground';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function QuizScreen() {
  const router = useRouter();
  const scale = useScale();
  const params = useLocalSearchParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const { user, learning, submitQuiz } = useBudget();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null); // option picked for the current question
  const [answers, setAnswers] = useState([]);
  const [summary, setSummary] = useState(null); // { result, newBadges } once finished

  const course = getCourse(courseId);

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!course || !course.quiz.length) return <Redirect href="/learning" />;

  const fs = (size) => Math.max(11, scale(size));
  const questions = course.quiz;
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answered = selected !== null;

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/learning/${course.id}`);
  };

  const pick = (optionIndex) => {
    if (answered) return;
    setSelected(optionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
  };

  const next = () => {
    if (!answered) return;
    if (!isLast) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    // Last question: score it once and save the result.
    const response = submitQuiz(course.id, answers);
    if (response.ok) {
      setSummary({ result: response.result, newBadges: response.newBadges || [] });
    }
  };

  const retry = () => {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setSummary(null);
  };

  const optionStyle = (optionIndex) => {
    if (!answered) return null;
    if (optionIndex === question.correctIndex) return styles.optionCorrect;
    if (optionIndex === selected) return styles.optionWrong;
    return styles.optionDimmed;
  };

  const renderResults = () => {
    const { result, newBadges } = summary;
    const badges = BADGES.filter((b) => newBadges.includes(b.id));
    const streak = getCurrentStreak(learning);
    return (
      <>
        <Text style={styles.resultEmoji}>{result.passed ? '\u{1F389}' : '\u{1F4AA}'}</Text>
        <Text style={[styles.resultScore, { fontSize: fs(48) }]}>
          {result.correct}/{result.total}
        </Text>
        <Text style={styles.resultPercent}>{result.percent}%</Text>
        <Text style={styles.resultMessage}>
          {result.passed
            ? 'Lekker! You know this stuff.'
            : 'Good try. Read the lessons again and give it another go.'}
        </Text>

        {streak > 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {'\u{1F525}'} {streak} day{streak === 1 ? '' : 's'} learning streak
            </Text>
          </View>
        ) : null}

        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeBanner}>
            <Text style={styles.badgeBannerIcon}>{badge.icon}</Text>
            <View style={styles.badgeBannerText}>
              <Text style={styles.badgeBannerTitle}>New badge: {badge.title}</Text>
              <Text style={styles.badgeBannerDesc}>{badge.description}</Text>
            </View>
          </View>
        ))}

        <Pressable onPress={retry} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} accessibilityRole="button">
          <Text style={styles.primaryText}>Try again</Text>
        </Pressable>
        <Pressable onPress={exit} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button">
          <Text style={styles.secondaryText}>Back to course</Text>
        </Pressable>
      </>
    );
  };

  const renderQuestion = () => (
    <>
      <Text style={styles.counter}>
        Question {index + 1} of {questions.length}
      </Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(((index + (answered ? 1 : 0)) / questions.length) * 100)}%` },
          ]}
        />
      </View>

      <Text style={[styles.prompt, { fontSize: fs(22), lineHeight: fs(30) }]}>{question.prompt}</Text>

      {question.options.map((option, optionIndex) => (
        <Pressable
          key={optionIndex}
          onPress={() => pick(optionIndex)}
          disabled={answered}
          style={({ pressed }) => [styles.option, optionStyle(optionIndex), pressed && !answered && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Option ${LETTERS[optionIndex]}, ${option}`}
          accessibilityState={{ selected: selected === optionIndex, disabled: answered }}
        >
          <Text style={styles.optionLetter}>{LETTERS[optionIndex]}</Text>
          <Text style={styles.optionText}>{option}</Text>
        </Pressable>
      ))}

      {answered ? (
        <View style={[styles.feedback, selected === question.correctIndex ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackTitle}>
            {selected === question.correctIndex ? 'Correct!' : 'Not quite.'}
          </Text>
          <Text style={styles.feedbackText}>{question.explanation}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={next}
        disabled={!answered}
        style={({ pressed }) => [styles.primaryButton, !answered && styles.buttonDisabled, pressed && answered && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !answered }}
      >
        <Text style={styles.primaryText}>{isLast ? 'See results' : 'Next question'}</Text>
      </Pressable>
    </>
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable
              onPress={exit}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close quiz"
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>{'\u2715'}</Text>
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {course.title} quiz
            </Text>
            <View style={styles.headerButton} />
          </View>

          {summary ? renderResults() : renderQuestion()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  pressed: { opacity: 0.75 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 16 },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 20 },
  headerTitle: { flex: 1, textAlign: 'center', color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },

  counter: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 14, marginBottom: 8 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden', marginBottom: 24 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: theme.colors.accent },
  prompt: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, marginBottom: 20 },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionCorrect: { backgroundColor: 'rgba(0, 180, 162, 0.4)', borderColor: theme.colors.accent, borderWidth: 2 },
  optionWrong: { backgroundColor: theme.colors.warningSurface, borderColor: theme.colors.warning, borderWidth: 2 },
  optionDimmed: { opacity: 0.45 },
  optionLetter: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 16, width: 22 },
  optionText: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },

  feedback: { borderRadius: theme.radius.card, padding: 14, marginTop: 6, marginBottom: 16, borderWidth: 1 },
  feedbackCorrect: { backgroundColor: 'rgba(0, 180, 162, 0.2)', borderColor: theme.colors.accent },
  feedbackWrong: { backgroundColor: theme.colors.warningSurface, borderColor: theme.colors.warning },
  feedbackTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16, marginBottom: 4 },
  feedbackText: { color: theme.colors.text, fontFamily: theme.fonts.bodyLight, fontSize: 15, lineHeight: 22 },

  primaryButton: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  primaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
  secondaryButton: { marginTop: 12, borderColor: theme.colors.surfaceBorder, borderWidth: 1, borderRadius: theme.radius.pill, paddingVertical: 14, alignItems: 'center' },
  secondaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },

  resultEmoji: { fontSize: 56, textAlign: 'center', marginTop: 8 },
  resultScore: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, textAlign: 'center', marginTop: 8 },
  resultPercent: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 20, textAlign: 'center' },
  resultMessage: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 20 },
  infoCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder, borderWidth: 1, borderRadius: theme.radius.card, padding: 14, marginBottom: 12, alignItems: 'center' },
  infoText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  badgeBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0, 180, 162, 0.3)', borderColor: theme.colors.accent, borderWidth: 1, borderRadius: theme.radius.card, padding: 14, marginBottom: 12 },
  badgeBannerIcon: { fontSize: 32 },
  badgeBannerText: { flex: 1 },
  badgeBannerTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  badgeBannerDesc: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13, marginTop: 2 },
});

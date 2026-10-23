import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { COURSES } from '../../constants/courses';
import { BADGES } from '../../constants/badges';
import { useScale } from '../../hooks/useScale';
import {
  getCourseProgress,
  getCurrentStreak,
  getNextLesson,
  hasLearnedToday,
} from '../../utils/learning';
import ScreenBackground from '../../components/ScreenBackground';
import NavBar from '../../components/NavBar';
import { CourseIcon, StreakIcon } from '../../components/LearningIcons';

function courseAction(progress) {
  if (progress.complete) return 'Review';
  if (progress.done > 0) return 'Continue';
  return 'Start';
}

export default function LearningHubScreen() {
  const router = useRouter();
  const scale = useScale();
  const { user, learning } = useBudget();

  if (!user) return <Redirect href="/(auth)/login" />;

  const fs = (size) => Math.max(11, scale(size));
  const streak = getCurrentStreak(learning);
  const learnedToday = hasLearnedToday(learning);
  const earned = new Set(learning.badges);

  const streakMessage = learnedToday
    ? 'Nice work today. Come back tomorrow to keep it going.'
    : streak > 0
      ? 'Learn something today to keep your streak alive.'
      : 'Finish a lesson today to start your streak.';

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

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
            <Text style={[styles.title, { fontSize: fs(24) }]}>Learn</Text>
            <View style={styles.headerButton} />
          </View>
          <Text style={styles.subtitle}>Short lessons that work offline. No data needed.</Text>

          <View style={styles.streakCard}>
            <View style={styles.iconBox}>
              <StreakIcon size={48} active={streak > 0} />
            </View>
            <View style={styles.streakText}>
              <Text style={[styles.streakNumber, { fontSize: fs(30) }]}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </Text>
              <Text style={styles.streakMessage}>{streakMessage}</Text>
              {learning.bestStreak > 0 ? (
                <Text style={styles.streakBest}>Best streak: {learning.bestStreak}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map((badge) => {
              const has = earned.has(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeTile, !has && styles.badgeLocked]}
                  accessible
                  accessibilityLabel={`${badge.title}. ${has ? 'Earned' : 'Locked'}. ${badge.description}`}
                >
                  <Text style={styles.badgeIcon}>{has ? badge.icon : '\u{1F512}'}</Text>
                  <Text style={styles.badgeTitle} numberOfLines={1}>
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {badge.description}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Courses</Text>
          {COURSES.map((course) => {
            const progress = getCourseProgress(learning, course);
            const next = getNextLesson(learning, course);
            const quiz = learning.quizScores[course.id];
            return (
              <Pressable
                key={course.id}
                onPress={() => router.push(`/learning/${course.id}`)}
                style={({ pressed }) => [styles.courseCard, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`${course.title}. ${progress.done} of ${progress.total} lessons done.`}
              >
                <View style={styles.courseTop}>
                  <View style={styles.iconBox}>
                    <CourseIcon courseId={course.id} fallback={course.icon} size={48} />
                  </View>
                  <View style={styles.courseText}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseTagline}>{course.tagline}</Text>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${Math.round(progress.fraction * 100)}%` }]}
                  />
                </View>
                <View style={styles.courseBottom}>
                  <Text style={styles.courseMeta}>
                    {progress.done}/{progress.total} lessons
                    {quiz ? ` \u00B7 Quiz best ${quiz.bestPercent}%` : ''}
                  </Text>
                  <Text style={styles.courseAction}>
                    {courseAction(progress)}
                    {next && progress.done > 0 ? ': ' + next.title : ''}
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
  pressed: { opacity: 0.75 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyLight,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 18,
    gap: 16,
  },
  iconBox: { width: 56, alignItems: 'center', justifyContent: 'center' },
  streakText: { flex: 1 },
  streakNumber: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold },
  streakMessage: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 14, marginTop: 2 },
  streakBest: { color: theme.colors.accent, fontFamily: theme.fonts.bodySemiBold, fontSize: 13, marginTop: 6 },

  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeTile: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  badgeLocked: { opacity: 0.45 },
  badgeIcon: { fontSize: 28, marginBottom: 6 },
  badgeTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 12, textAlign: 'center' },
  badgeDesc: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyLight,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },

  courseCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 16,
    marginBottom: 12,
  },
  courseTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  courseText: { flex: 1 },
  courseTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
  courseTagline: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13, marginTop: 2 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: theme.colors.accent },
  courseBottom: { marginTop: 10, gap: 2 },
  courseMeta: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13 },
  courseAction: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
});

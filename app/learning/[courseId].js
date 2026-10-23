import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useBudget } from '../../context/BudgetContext';
import { theme } from '../../constants/theme';
import { getCourse } from '../../constants/courses';
import { BADGES } from '../../constants/badges';
import { useScale } from '../../hooks/useScale';
import {
  getCourseProgress,
  getCurrentStreak,
  getReadMinutes,
  isLessonDone,
} from '../../utils/learning';
import ScreenBackground from '../../components/ScreenBackground';
import { CourseIcon } from '../../components/LearningIcons';

export default function CourseScreen() {
  const router = useRouter();
  const scale = useScale();
  const params = useLocalSearchParams();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const { user, learning, completeLesson } = useBudget();
  const scrollRef = useRef(null);

  const [openLessonId, setOpenLessonId] = useState(null); // null = lesson list
  const [newBadgeIds, setNewBadgeIds] = useState([]);

  const course = getCourse(courseId);

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!course) return <Redirect href="/learning" />;

  const fs = (size) => Math.max(11, scale(size));
  const progress = getCourseProgress(learning, course);
  const quizScore = learning.quizScores[course.id];
  const lessonIndex = course.lessons.findIndex((l) => l.id === openLessonId);
  const lesson = lessonIndex >= 0 ? course.lessons[lessonIndex] : null;
  const nextLesson = lesson ? course.lessons[lessonIndex + 1] || null : null;
  const lessonDone = lesson ? isLessonDone(learning, course.id, lesson.id) : false;

  const scrollTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  };

  const openLesson = (id) => {
    setNewBadgeIds([]);
    setOpenLessonId(id);
    scrollTop();
  };

  const backToList = () => {
    setNewBadgeIds([]);
    setOpenLessonId(null);
    scrollTop();
  };

  const goBack = () => {
    if (lesson) {
      backToList();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/learning');
    }
  };

  const markRead = () => {
    const result = completeLesson(course.id, lesson.id);
    if (result.ok) setNewBadgeIds(result.newBadges || []);
  };

  const goQuiz = () => router.push(`/learning/quiz?courseId=${course.id}`);

  const newBadges = BADGES.filter((b) => newBadgeIds.includes(b.id));

  const renderList = () => (
    <>
      <View style={styles.courseHeader}>
        <View style={styles.courseIconBox}>
          <CourseIcon courseId={course.id} fallback={course.icon} size={56} />
        </View>
        <Text style={[styles.courseTitle, { fontSize: fs(24) }]}>{course.title}</Text>
        <Text style={styles.courseTagline}>{course.tagline}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.round(progress.fraction * 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {progress.done} of {progress.total} lessons done
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Lessons</Text>
      {course.lessons.map((l, index) => {
        const done = isLessonDone(learning, course.id, l.id);
        return (
          <Pressable
            key={l.id}
            onPress={() => openLesson(l.id)}
            style={({ pressed }) => [styles.lessonRow, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Lesson ${index + 1}, ${l.title}, ${getReadMinutes(l)} minute read${done ? ', done' : ''}`}
          >
            <View style={[styles.lessonNumber, done && styles.lessonNumberDone]}>
              <Text style={styles.lessonNumberText}>{done ? '\u2713' : index + 1}</Text>
            </View>
            <View style={styles.lessonText}>
              <Text style={styles.lessonTitle}>{l.title}</Text>
              <Text style={styles.lessonMeta}>{getReadMinutes(l)} min read</Text>
            </View>
            <Text style={styles.chevron}>{'\u203A'}</Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={goQuiz}
        style={({ pressed }) => [styles.quizCard, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Take the quiz"
      >
        <View style={styles.quizText}>
          <Text style={styles.quizTitle}>Take the quiz</Text>
          <Text style={styles.quizMeta}>
            {course.quiz.length} questions
            {quizScore ? ` \u00B7 Best ${quizScore.bestPercent}%` : ''}
          </Text>
        </View>
        <Text style={styles.quizGo}>Go</Text>
      </Pressable>
    </>
  );

  const renderReader = () => (
    <>
      <View style={styles.readTimePill}>
        <Text style={styles.readTimeText}>{getReadMinutes(lesson)} min read</Text>
      </View>
      <Text style={[styles.lessonHeading, { fontSize: fs(26) }]}>{lesson.title}</Text>

      {lesson.body.map((paragraph, index) => (
        <Text key={index} style={[styles.paragraph, { fontSize: fs(17), lineHeight: fs(26) }]}>
          {paragraph}
        </Text>
      ))}

      {lesson.tip ? (
        <View style={styles.tipBox}>
          <Text style={styles.tipLabel}>Remember</Text>
          <Text style={styles.tipText}>{lesson.tip}</Text>
        </View>
      ) : null}

      {newBadges.map((badge) => (
        <View key={badge.id} style={styles.badgeBanner}>
          <Text style={styles.badgeBannerIcon}>{badge.icon}</Text>
          <View style={styles.badgeBannerText}>
            <Text style={styles.badgeBannerTitle}>New badge: {badge.title}</Text>
            <Text style={styles.badgeBannerDesc}>{badge.description}</Text>
          </View>
        </View>
      ))}

      {!lessonDone ? (
        <Pressable
          onPress={markRead}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>Mark as read</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.doneText}>
            Lesson done{getCurrentStreak(learning) > 0 ? ` \u00B7 ${getCurrentStreak(learning)} day streak` : ''}
          </Text>
          {nextLesson ? (
            <Pressable
              onPress={() => openLesson(nextLesson.id)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>Next lesson</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={goQuiz}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>Take the quiz</Text>
            </Pressable>
          )}
        </>
      )}

      <Pressable
        onPress={backToList}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>Back to lessons</Text>
      </Pressable>
    </>
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              onPress={goBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Text style={styles.headerIcon}>{'\u2039'}</Text>
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {course.title}
            </Text>
            <View style={styles.headerButton} />
          </View>

          {lesson ? renderReader() : renderList()}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 34, lineHeight: 36 },
  headerTitle: { flex: 1, textAlign: 'center', color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 15 },

  courseHeader: { alignItems: 'center', paddingVertical: 8 },
  courseIconBox: { marginBottom: 8 },
  courseTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, textAlign: 'center' },
  courseTagline: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyLight,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  barTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4, backgroundColor: theme.colors.accent },
  progressText: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13, marginTop: 8 },

  sectionTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 18, marginTop: 20, marginBottom: 12 },

  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  lessonNumberDone: { backgroundColor: theme.colors.accent },
  lessonNumberText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  lessonText: { flex: 1 },
  lessonTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },
  lessonMeta: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13, marginTop: 2 },
  chevron: { color: theme.colors.textMuted, fontSize: 26 },

  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 162, 0.35)',
    borderColor: theme.colors.accent,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 16,
    marginTop: 10,
  },
  quizText: { flex: 1 },
  quizTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
  quizMeta: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 13, marginTop: 2 },
  quizGo: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16 },

  readTimePill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  readTimeText: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  lessonHeading: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, marginBottom: 16 },
  paragraph: { color: theme.colors.text, fontFamily: theme.fonts.bodyLight, marginBottom: 16 },

  tipBox: {
    backgroundColor: theme.colors.surface,
    borderLeftColor: theme.colors.accent,
    borderLeftWidth: 4,
    borderRadius: theme.radius.control,
    padding: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  tipLabel: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 12, marginBottom: 4 },
  tipText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },

  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 180, 162, 0.3)',
    borderColor: theme.colors.accent,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    padding: 14,
    marginBottom: 14,
  },
  badgeBannerIcon: { fontSize: 32 },
  badgeBannerText: { flex: 1 },
  badgeBannerTitle: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  badgeBannerDesc: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodyLight, fontSize: 13, marginTop: 2 },

  doneText: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 15, textAlign: 'center', marginBottom: 12 },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 17 },
  secondaryButton: {
    marginTop: 12,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemiBold, fontSize: 16 },
});
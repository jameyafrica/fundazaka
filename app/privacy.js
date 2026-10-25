import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { PRIVACY_CONTACT_EMAIL, PRIVACY_NOTICE, PRIVACY_UPDATED } from '../constants/privacy';
import ScreenBackground from '../components/ScreenBackground';
import { useT } from '../i18n/LanguageContext';

// The notice is bundled English text, so it opens instantly and works offline. It is reachable
// without being signed in, because people read it before they create an account.
export default function PrivacyScreen() {
  const router = useRouter();
  const { t } = useT();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.back')}>
            <Text style={styles.back}>{t('common.back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('privacy.title')}</Text>
          <Text style={styles.updated}>{`Last updated: ${PRIVACY_UPDATED}`}</Text>

          {PRIVACY_NOTICE.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.heading}>{section.heading}</Text>
              {section.paragraphs.map((paragraph) => (
                <Text key={paragraph} style={styles.body}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}

          {PRIVACY_CONTACT_EMAIL !== '' && (
            <View style={styles.section}>
              <Text style={styles.heading}>Contact us</Text>
              <Text style={styles.body}>{`Questions, or want to use your rights? Write to ${PRIVACY_CONTACT_EMAIL}.`}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl * 2 },
  back: { color: theme.colors.accent, fontFamily: theme.fonts.bodyBold, fontSize: 16 },
  title: { marginTop: theme.spacing.md, color: theme.colors.text, fontFamily: theme.fonts.bodyLight, fontSize: 36 },
  updated: { marginTop: theme.spacing.xs, color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 12 },
  section: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  heading: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 16, marginBottom: theme.spacing.sm },
  body: { color: theme.colors.textMuted, fontFamily: theme.fonts.bodySemiBold, fontSize: 14, lineHeight: 21, marginBottom: theme.spacing.sm },
});
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useT } from '../i18n/LanguageContext';

// compact: shows one pill ("Language: isiZulu") that opens the list. Used on the login screen.
// full: the list is always open. Used in Settings.
export default function LanguagePicker({ compact = false }) {
  const { lang, setLang, languages, t } = useT();
  const [open, setOpen] = useState(!compact);
  const current = languages.find((l) => l.code === lang) || languages[0];

  const choose = (code) => {
    setLang(code);
    if (compact) setOpen(false);
  };

  return (
    <View>
      {compact && (
        <Pressable
          onPress={() => setOpen((v) => !v)}
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`${t('lang.label')}: ${current.name}`}
        >
          <Text style={styles.toggleText}>
            {t('lang.label')}: {current.name} {open ? '▴' : '▾'}
          </Text>
        </Pressable>
      )}
      {open && (
        <View style={[styles.list, compact && styles.listCompact]}>
          {languages.map((l) => {
            const on = l.code === lang;
            return (
              <Pressable
                key={l.code}
                onPress={() => choose(l.code)}
                style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={l.name}
              >
                <Text style={styles.chipText}>{l.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  toggleText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  list: { flexDirection: 'row', flexWrap: 'wrap', padding: theme.spacing.sm },
  listCompact: { paddingHorizontal: 0 },
  chip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipOn: { borderWidth: 2, borderColor: theme.colors.accent, backgroundColor: 'rgba(0, 180, 162, 0.3)' },
  chipText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 14 },
  pressed: { opacity: 0.75 },
});

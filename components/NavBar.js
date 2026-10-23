import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { theme } from '../constants/theme';

import SettingsIcon from './icons/DashboardIconSettingsNavLeft46';
import HomeIcon from './icons/DashboardIconHomeNavRight46';
import IncomeIcon from './icons/DashboardIconArrowDownCardIncome46';
import ExpenseIcon from './icons/DashboardIconArrowDownCardExpenses46';

export const NAV_HEIGHT = 64;

// Bottom navigation: Settings | Add (menu above) | Dashboard.
// onHomePress: what the Dashboard icon does when you are already on the dashboard.
export default function NavBar({ onHomePress }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const onHome = pathname === '/home';
  const onSettings = pathname === '/settings';

  const go = (href) => {
    setMenuOpen(false);
    router.push(href);
  };

  const pressHome = () => {
    if (onHome) {
      if (onHomePress) onHomePress();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const pressSettings = () => {
    if (!onSettings) router.push('/settings');
  };

  return (
    <>
      <View style={[styles.bar, { height: NAV_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
        <Pressable
          style={styles.slot}
          onPress={pressSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <SettingsIcon width={28} height={28} />
          {onSettings && <View style={styles.activeDot} />}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Add income or expense"
        >
          <Text style={styles.addText}>+</Text>
        </Pressable>

        <Pressable
          style={styles.slot}
          onPress={pressHome}
          accessibilityRole="button"
          accessibilityLabel="Dashboard"
        >
          <HomeIcon width={28} height={28} />
          {onHome && <View style={styles.activeDot} />}
        </Pressable>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { bottom: insets.bottom + NAV_HEIGHT + 12 }]}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={() => go('/add-transaction?type=income')}
            >
              <IncomeIcon width={28} height={28} />
              <Text style={styles.menuText}>Add Income</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={() => go('/add-transaction?type=expense')}
            >
              <ExpenseIcon width={28} height={28} />
              <Text style={styles.menuText}>Pay Expense</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    backgroundColor: 'rgba(4, 31, 33, 0.92)',
  },
  slot: { width: 72, height: NAV_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  activeDot: { position: 'absolute', bottom: 8, width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.accent },
  addButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
  },
  addText: { color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 30, lineHeight: 34 },
  pressed: { opacity: 0.75 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  menu: {
    position: 'absolute',
    alignSelf: 'center',
    minWidth: 220,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.backgroundAlt,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: theme.spacing.lg },
  menuText: { marginLeft: theme.spacing.md, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 },
  menuDivider: { height: 1, marginHorizontal: theme.spacing.md, backgroundColor: theme.colors.surfaceBorder },
});

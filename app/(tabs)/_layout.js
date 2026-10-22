import { Stack } from 'expo-router';
import { theme } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}

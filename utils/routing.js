// Pure helper: decides which screen the user belongs on right now.
// Order matters: sign in -> onboarding -> tour -> pending monthly reset -> dashboard.
export function getNextRoute({ user, onboardingCompleted, tourCompleted, resetPending }) {
  if (!user) return '/(auth)/login';
  if (!onboardingCompleted) return '/(auth)/onboarding-expenses';
  if (!tourCompleted) return '/(auth)/onboarding-tour';
  if (resetPending) return '/(auth)/onboarding-expenses?mode=reset';
  return '/(tabs)/home';
}
// App lock logic. Pure: the phone's authentication module is injected, so Jest can fake it.

export const LOCK_GRACE_MS = 30000; // coming back within 30 seconds does not ask again

// Wraps expo-local-authentication. A phone counts as able to lock the app when it has any screen
// lock set up (fingerprint, face, PIN, pattern or password).
export function createAppLockService(auth) {
  async function isAvailable() {
    try {
      const level = await auth.getEnrolledLevelAsync();
      return Number(level) > 0; // SecurityLevel.NONE is 0
    } catch (e) {
      return false;
    }
  }

  // Asks the person to prove it is them. The phone's PIN or pattern is accepted as a fallback.
  async function authenticate({ promptMessage, cancelLabel } = {}) {
    try {
      const result = await auth.authenticateAsync({ promptMessage, cancelLabel, disableDeviceFallback: false });
      return { ok: Boolean(result && result.success === true) };
    } catch (e) {
      return { ok: false };
    }
  }

  return { isAvailable, authenticate };
}

// The lock screen shows only after the saved data has loaded, for a signed-in person who turned
// App lock on, until they have unlocked during this visit.
export function isLocked({ hydrated, enabled, hasUser, unlocked }) {
  return Boolean(hydrated && enabled && hasUser && !unlocked);
}

// True when the app was in the background for at least the grace period.
export function shouldRelock({ backgroundedAt, now, graceMs = LOCK_GRACE_MS }) {
  if (typeof backgroundedAt !== 'number' || typeof now !== 'number') return false;
  return now - backgroundedAt >= graceMs;
}
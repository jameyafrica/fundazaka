// Who owns the data stored on this phone. Pure, so the rules can be tested.

// Demo Mode data belongs to this fixed owner. It must never be treated as a real account,
// and it must never be synced to the server.
export const GUEST_OWNER = 'guest';

export function hasLocalData(state) {
  return Boolean(
    state.onboardingCompleted ||
      (state.categories && state.categories.length > 0) ||
      (state.transactions && state.transactions.length > 0)
  );
}

// True when it is safe to send this phone's data to the server for the given state.
export function isSyncable(state) {
  return Boolean(state.user && !state.isGuest && state.ownerId && state.ownerId !== GUEST_OWNER);
}

// When someone signs in, decide whether the data already on the phone is theirs.
// Only keep it if it was saved under the same account id. Data with no owner (older app versions)
// or demo data is thrown away rather than handed to whoever signs in next.
export function ownsLocalData(prev, userId) {
  if (prev.ownerId) return prev.ownerId === userId;
  return !hasLocalData(prev);
}

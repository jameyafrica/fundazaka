// Sign-up and login input rules. Pure, so they can be tested without Supabase.

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72; // bcrypt (used by many auth backends) ignores anything past 72 bytes

const COMMON_PASSWORDS = [
  'password', 'password1', 'passw0rd', '12345678', '123456789', '1234567890', '11111111',
  'qwertyui', 'qwerty123', 'iloveyou', 'abc12345', 'letmein1', 'welcome1', 'fundazaka',
];

export function checkEmail(email) {
  const value = String(email || '').trim();
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

// Only used when CREATING an account. Login never applies these, so people with older,
// shorter passwords can still get in.
export function checkNewPassword(password, email = '') {
  const value = String(password || '');
  if (value.length < MIN_PASSWORD_LENGTH) return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (value.length > MAX_PASSWORD_LENGTH) return `Your password can be at most ${MAX_PASSWORD_LENGTH} characters.`;
  const lower = value.toLowerCase();
  if (COMMON_PASSWORDS.includes(lower) || /^(.)\1+$/.test(value)) {
    return 'That password is too easy to guess. Please choose a different one.';
  }
  const local = String(email || '').split('@')[0].toLowerCase();
  if (local.length >= 4 && lower.includes(local)) {
    return 'Your password should not contain your email name.';
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Use a mix of letters and numbers in your password.';
  }
  return null;
}

// Turns a raw auth error into a message that is useful but does not leak details.
export function friendlyAuthError(error) {
  const msg = String((error && error.message) || error || '').toLowerCase();
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'No connection. Check your data or Wi-Fi and try again.';
  }
  if (msg.includes('invalid login')) return 'Wrong email or password.';
  // Deliberately vague: saying "that email is registered" would let anyone test which emails have accounts.
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'We could not create that account. Try logging in, or use a different email.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (msg.includes('password') && (msg.includes('least') || msg.includes('short') || msg.includes('characters'))) {
    return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('easy') || msg.includes('pwned') || msg.includes('leaked'))) {
    return 'That password is too easy to guess. Please choose a different one.';
  }
  return 'Something went wrong. Please try again.';
}

import { GUEST_OWNER, hasLocalData, isSyncable, ownsLocalData } from '../lib/session.js';
import { buildDemoState } from '../utils/budgetActions.js';
import { checkEmail, checkNewPassword, friendlyAuthError } from '../utils/validation.js';
import { makeId } from '../utils/ids.js';

describe('local data ownership (audit finding 6)', () => {
  const demo = buildDemoState(new Date(2026, 9, 22, 12));

  test('demo data is owned by the guest owner', () => {
    expect(demo.ownerId).toBe(GUEST_OWNER);
    expect(demo.isGuest).toBe(true);
  });

  test('demo data is NOT carried into a real account', () => {
    expect(ownsLocalData(demo, 'real-user-123')).toBe(false);
  });

  test('legacy data with no owner is not handed to the next user', () => {
    expect(ownsLocalData({ ownerId: null, onboardingCompleted: true, categories: [], transactions: [] }, 'u1')).toBe(false);
    expect(ownsLocalData({ ownerId: null, onboardingCompleted: false, categories: [], transactions: [{ id: 'x' }] }, 'u1')).toBe(false);
  });

  test('a brand-new empty phone can be claimed', () => {
    expect(ownsLocalData({ ownerId: null, onboardingCompleted: false, categories: [], transactions: [] }, 'u1')).toBe(true);
  });

  test('the same account keeps its data; a different account does not', () => {
    expect(ownsLocalData({ ownerId: 'u1' }, 'u1')).toBe(true);
    expect(ownsLocalData({ ownerId: 'u1' }, 'u2')).toBe(false);
  });

  test('guest state is never syncable, real accounts are', () => {
    expect(isSyncable(demo)).toBe(false);
    expect(isSyncable({ user: { id: 'guest' }, isGuest: false, ownerId: 'guest' })).toBe(false);
    expect(isSyncable({ user: { id: 'u1' }, isGuest: false, ownerId: 'u1' })).toBe(true);
    expect(isSyncable({ user: null, isGuest: false, ownerId: 'u1' })).toBe(false);
  });

  test('hasLocalData notices onboarding, categories and transactions', () => {
    expect(hasLocalData({ onboardingCompleted: true })).toBe(true);
    expect(hasLocalData({ categories: [{}] })).toBe(true);
    expect(hasLocalData({ transactions: [], categories: [] })).toBe(false);
  });
});

describe('sign-up password rules (audit finding 5)', () => {
  test('needs at least 8 characters', () => {
    expect(checkNewPassword('abc123')).toMatch(/at least 8/);
    expect(checkNewPassword('abcd1234')).toBeNull();
  });

  test('rejects common, repeated and email-based passwords', () => {
    expect(checkNewPassword('password')).toMatch(/easy to guess/);
    expect(checkNewPassword('12345678')).toMatch(/easy to guess/);
    expect(checkNewPassword('aaaaaaaa')).toMatch(/easy to guess/);
    expect(checkNewPassword('thandi2026x', 'thandi@example.com')).toMatch(/email/);
  });

  test('needs letters and numbers', () => {
    expect(checkNewPassword('onlyletters')).toMatch(/letters and numbers/);
    expect(checkNewPassword('93847261')).toMatch(/letters and numbers/);
  });

  test('caps the length', () => {
    expect(checkNewPassword('a1'.repeat(40))).toMatch(/at most/);
  });

  test('email check', () => {
    expect(checkEmail('thandi@example.com')).toBeNull();
    expect(checkEmail('nope')).toMatch(/valid email/);
    expect(checkEmail('a@b')).toMatch(/valid email/);
    expect(checkEmail(`${'a'.repeat(250)}@x.co`)).toMatch(/valid email/);
  });
});

describe('auth error messages', () => {
  test('wrong login is generic', () => {
    expect(friendlyAuthError({ message: 'Invalid login credentials' })).toBe('Wrong email or password.');
  });

  test('does not reveal that an email is registered', () => {
    const msg = friendlyAuthError({ message: 'User already registered' });
    expect(msg).not.toMatch(/already/i);
    expect(msg).not.toMatch(/has an account/i);
  });

  test('only talks about password length when the error is about length', () => {
    expect(friendlyAuthError({ message: 'Password should be at least 8 characters' })).toMatch(/at least 8/);
    expect(friendlyAuthError({ message: 'Invalid password format' })).toBe('Something went wrong. Please try again.');
  });

  test('network and rate limit errors', () => {
    expect(friendlyAuthError({ message: 'Network request failed' })).toMatch(/No connection/);
    expect(friendlyAuthError({ message: 'email rate limit exceeded' })).toMatch(/Too many/);
  });
});

describe('ids', () => {
  test('are unique, uuid-shaped and not derived from the clock', () => {
    const ids = new Set(Array.from({ length: 500 }, () => makeId()));
    expect(ids.size).toBe(500);
    [...ids].slice(0, 5).forEach((id) => expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  });
});
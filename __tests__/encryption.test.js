import { randomBytes } from 'crypto';
import { createAesCtrCipher } from '../utils/cipher';
import { createEncryptedStore } from '../utils/encryptedStore';

const cipher = createAesCtrCipher({ randomBytes: (n) => new Uint8Array(randomBytes(n)) });

function makeMemory() {
  const data = new Map();
  return {
    data,
    getItem: async (k) => (data.has(k) ? data.get(k) : null),
    setItem: async (k, v) => void data.set(k, v),
    removeItem: async (k) => void data.delete(k),
  };
}

function makeVault() {
  const keys = new Map();
  return {
    keys,
    get: async (k) => (keys.has(k) ? keys.get(k) : null),
    set: async (k, v) => void keys.set(k, v),
    remove: async (k) => void keys.delete(k),
  };
}

describe('cipher', () => {
  test('round-trips text including unicode', () => {
    const key = cipher.generateKey();
    const text = JSON.stringify({ rand: 'R1 250,50', name: 'Thandiwe ✓ Ndlovu' });
    expect(cipher.decrypt(key, cipher.encrypt(key, text))).toBe(text);
  });

  test('uses a fresh IV so the same text never encrypts the same way twice', () => {
    const key = cipher.generateKey();
    expect(cipher.encrypt(key, 'hello')).not.toBe(cipher.encrypt(key, 'hello'));
  });

  test('does not leave the plain text readable', () => {
    const key = cipher.generateKey();
    const payload = cipher.encrypt(key, 'salary 12345');
    expect(payload).not.toContain('salary');
  });

  test('wrong key is rejected', () => {
    const payload = cipher.encrypt(cipher.generateKey(), 'secret');
    expect(() => cipher.decrypt(cipher.generateKey(), payload)).toThrow();
  });

  test('bad keys and bad payloads are rejected', () => {
    const key = cipher.generateKey();
    expect(() => cipher.encrypt('abcd', 'x')).toThrow();
    expect(() => cipher.decrypt(key, 'zz')).toThrow();
    expect(() => cipher.decrypt(key, '00')).toThrow();
    expect(() => cipher.decrypt(key, '')).toThrow();
  });

  test('generates 256-bit keys and needs a random source', () => {
    expect(cipher.generateKey()).toMatch(/^[0-9a-f]{64}$/);
    expect(() => createAesCtrCipher({})).toThrow();
  });
});

describe('encrypted store', () => {
  function setup(options = {}) {
    const backend = makeMemory();
    const keyStore = makeVault();
    const store = createEncryptedStore({ backend, keyStore, cipher, ...options });
    return { backend, keyStore, store };
  }

  test('saves ciphertext, reads plain text back', async () => {
    const { backend, store } = setup();
    await store.setItem('state', '{"balance":100}');
    expect(backend.data.get('state')).toMatch(/^enc1:/);
    expect(backend.data.get('state')).not.toContain('balance');
    expect(await store.getItem('state')).toBe('{"balance":100}');
  });

  test('returns null for missing items', async () => {
    const { store } = setup();
    expect(await store.getItem('nothing')).toBeNull();
  });

  test('keeps one key per name across many writes', async () => {
    const { keyStore, store } = setup();
    await store.setItem('state', 'one');
    const first = [...keyStore.keys.values()][0];
    await store.setItem('state', 'two');
    expect([...keyStore.keys.values()]).toEqual([first]);
    expect(await store.getItem('state')).toBe('two');
  });

  test('concurrent first writes create a single key and the last write wins', async () => {
    const { keyStore, store } = setup();
    await Promise.all([store.setItem('state', 'a'), store.setItem('state', 'b'), store.setItem('state', 'c')]);
    expect(keyStore.keys.size).toBe(1);
    expect(await store.getItem('state')).toBe('c');
  });

  test('treats data as empty when the key is lost', async () => {
    const { keyStore, store } = setup();
    await store.setItem('state', 'secret');
    keyStore.keys.clear();
    expect(await store.getItem('state')).toBeNull();
  });

  test('treats tampered data as empty', async () => {
    const { backend, store } = setup();
    await store.setItem('state', 'secret');
    backend.data.set('state', 'enc1:' + 'ab'.repeat(40));
    expect(await store.getItem('state')).toBeNull();
    backend.data.set('state', 'enc1:not-hex');
    expect(await store.getItem('state')).toBeNull();
  });

  test('refuses plain text by default', async () => {
    const { backend, store } = setup();
    backend.data.set('state', '{"old":true}');
    expect(await store.getItem('state')).toBeNull();
  });

  test('acceptPlaintext upgrades an old plain-text value in place', async () => {
    const { backend, store } = setup({ acceptPlaintext: true });
    backend.data.set('session', '{"token":"abc"}');
    expect(await store.getItem('session')).toBe('{"token":"abc"}');
    expect(backend.data.get('session')).toMatch(/^enc1:/);
    expect(await store.getItem('session')).toBe('{"token":"abc"}');
  });

  test('never writes plain text when the key vault fails', async () => {
    const { backend, keyStore, store } = setup();
    keyStore.get = async () => {
      throw new Error('vault locked');
    };
    await expect(store.setItem('state', 'secret')).rejects.toThrow('vault locked');
    expect(backend.data.size).toBe(0);
    await expect(store.setItem('state', 'secret')).rejects.toThrow();
  });

  test('removeItem deletes the data and its key', async () => {
    const { backend, keyStore, store } = setup();
    await store.setItem('state', 'secret');
    await store.removeItem('state');
    expect(backend.data.size).toBe(0);
    expect(keyStore.keys.size).toBe(0);
  });

  test('migrates a legacy plain-text value and deletes the old copy', async () => {
    const { backend, store } = setup();
    backend.data.set('old_state', '{"balance":5}');
    expect(await store.migrateLegacy('old_state', 'new_state')).toBe(true);
    expect(backend.data.has('old_state')).toBe(false);
    expect(backend.data.get('new_state')).toMatch(/^enc1:/);
    expect(await store.getItem('new_state')).toBe('{"balance":5}');
  });

  test('migration never overwrites newer encrypted data and still removes the old copy', async () => {
    const { backend, store } = setup();
    await store.setItem('new_state', 'current');
    backend.data.set('old_state', 'stale');
    expect(await store.migrateLegacy('old_state', 'new_state')).toBe(false);
    expect(backend.data.has('old_state')).toBe(false);
    expect(await store.getItem('new_state')).toBe('current');
  });

  test('migration with nothing to move does nothing', async () => {
    const { store } = setup();
    expect(await store.migrateLegacy('old_state', 'new_state')).toBe(false);
  });

  test('keeps the old copy if the new one cannot be verified', async () => {
    const { backend, store } = setup();
    backend.data.set('old_state', 'precious');
    const realSet = backend.setItem;
    backend.setItem = async (k, v) => realSet(k, k === 'new_state' ? 'enc1:' + 'cd'.repeat(40) : v);
    expect(await store.migrateLegacy('old_state', 'new_state')).toBe(false);
    expect(backend.data.get('old_state')).toBe('precious');
  });
});
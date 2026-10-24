import { randomBytes } from 'crypto';
import { createAesCtrCipher } from '../utils/cipher';
import { createEncryptedStore } from '../utils/encryptedStore';
import { eraseLocalData, getAuthStorageKeys } from '../utils/deleteData';

function memoryBackend() {
  const data = new Map();
  return {
    data,
    getItem: async (k) => (data.has(k) ? data.get(k) : null),
    setItem: async (k, v) => void data.set(k, v),
    removeItem: async (k) => void data.delete(k),
  };
}

describe('getAuthStorageKeys', () => {
  test('builds the keys supabase-js uses for a project url', () => {
    expect(getAuthStorageKeys('https://abcdefgh.supabase.co')).toEqual([
      'sb-abcdefgh-auth-token',
      'sb-abcdefgh-auth-token-user',
      'sb-abcdefgh-auth-token-code-verifier',
    ]);
  });

  test('returns nothing for missing or invalid urls', () => {
    [undefined, null, '', 'not a url', 42].forEach((url) => expect(getAuthStorageKeys(url)).toEqual([]));
  });
});

describe('eraseLocalData', () => {
  test('removes every key from every storage', async () => {
    const a = memoryBackend();
    const b = memoryBackend();
    await a.setItem('one', '1');
    await a.setItem('two', '2');
    await b.setItem('three', '3');
    const result = await eraseLocalData({
      targets: [{ storage: a, keys: ['one', 'two'] }, { storage: b, keys: ['three'] }],
    });
    expect(result).toEqual({ ok: true, failed: [], signedOutOnServer: true });
    expect(a.data.size).toBe(0);
    expect(b.data.size).toBe(0);
  });

  test('keeps erasing and reports the keys that failed', async () => {
    const a = memoryBackend();
    await a.setItem('one', '1');
    await a.setItem('three', '3');
    const flaky = { ...a, removeItem: async (k) => { if (k === 'two') throw new Error('disk error'); return a.removeItem(k); } };
    const result = await eraseLocalData({ targets: [{ storage: flaky, keys: ['one', 'two', 'three'] }] });
    expect(result.ok).toBe(false);
    expect(result.failed).toEqual(['two']);
    expect(a.data.size).toBe(0);
  });

  test('signs out before erasing', async () => {
    const order = [];
    const storage = { removeItem: async () => void order.push('erase') };
    await eraseLocalData({
      targets: [{ storage, keys: ['k'] }],
      signOut: async () => void order.push('signOut'),
    });
    expect(order).toEqual(['signOut', 'erase']);
  });

  test('being offline never stops the erase', async () => {
    const a = memoryBackend();
    await a.setItem('k', 'v');
    const failing = await eraseLocalData({
      targets: [{ storage: a, keys: ['k'] }],
      signOut: async () => { throw new Error('Network request failed'); },
    });
    expect(failing).toEqual({ ok: true, failed: [], signedOutOnServer: false });
    expect(a.data.size).toBe(0);

    await a.setItem('k', 'v');
    const errorResult = await eraseLocalData({
      targets: [{ storage: a, keys: ['k'] }],
      signOut: async () => ({ error: new Error('offline') }),
    });
    expect(errorResult.signedOutOnServer).toBe(false);
    expect(a.data.size).toBe(0);
  });

  test('a sign out that hangs is abandoned after the timeout', async () => {
    const a = memoryBackend();
    await a.setItem('k', 'v');
    const result = await eraseLocalData({
      targets: [{ storage: a, keys: ['k'] }],
      signOut: () => new Promise(() => {}),
      signOutTimeoutMs: 20,
    });
    expect(result.ok).toBe(true);
    expect(result.signedOutOnServer).toBe(false);
    expect(a.data.size).toBe(0);
  });

  test('handles missing targets, keys and sign out', async () => {
    expect(await eraseLocalData({})).toEqual({ ok: true, failed: [], signedOutOnServer: true });
    expect(await eraseLocalData({ targets: [{ storage: memoryBackend() }] })).toMatchObject({ ok: true });
  });

  test('with the encrypted store, both the data and its encryption key are gone', async () => {
    const backend = memoryBackend();
    const vault = new Map();
    const keyStore = {
      get: async (k) => (vault.has(k) ? vault.get(k) : null),
      set: async (k, v) => void vault.set(k, v),
      remove: async (k) => void vault.delete(k),
    };
    const cipher = createAesCtrCipher({ randomBytes: (n) => new Uint8Array(randomBytes(n)) });
    const store = createEncryptedStore({ backend, keyStore, cipher });
    await store.setItem('fundazaka_state_v2', '{"balance":1}');
    expect(backend.data.size).toBe(1);
    expect(vault.size).toBe(1);

    const result = await eraseLocalData({ targets: [{ storage: store, keys: ['fundazaka_state_v2', 'fundazaka_state'] }] });
    expect(result.ok).toBe(true);
    expect(backend.data.size).toBe(0);
    expect(vault.size).toBe(0);
    expect(await store.getItem('fundazaka_state_v2')).toBeNull();
  });
});
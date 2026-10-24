// Encrypted key-value store. Pure logic: the storage backend, the key vault and
// the cipher are injected, so Jest can run it with in-memory fakes.
//
//   backend : { getItem, setItem, removeItem }   (AsyncStorage on the phone)
//   keyStore: { get(name), set(name, value), remove(name) }  (SecureStore)
//   cipher  : { generateKey(), encrypt(keyHex, text), decrypt(keyHex, payload) }
//
// One persistent key per storage name; a fresh IV for every write. The key is
// only ever created when none exists, so data and key cannot get out of step.
// If the key vault fails we throw and never fall back to plain text.

const PREFIX = 'enc1:';

function vaultName(name) {
  return `fz.key.${String(name).replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

export function createEncryptedStore({ backend, keyStore, cipher, acceptPlaintext = false }) {
  // Every operation runs one after another, so rapid state changes are written in order
  // and two first-time writes can never create two different keys.
  let queue = Promise.resolve();
  function enqueue(task) {
    const run = queue.then(task, task);
    queue = run.catch(() => {});
    return run;
  }

  async function getOrCreateKey(name) {
    const existing = await keyStore.get(vaultName(name));
    if (existing) return existing;
    const created = cipher.generateKey();
    await keyStore.set(vaultName(name), created);
    return created;
  }

  async function write(name, value) {
    const keyHex = await getOrCreateKey(name);
    await backend.setItem(name, PREFIX + cipher.encrypt(keyHex, value));
  }

  async function read(name) {
    const stored = await backend.getItem(name);
    if (stored === null || stored === undefined) return null;
    if (!stored.startsWith(PREFIX)) {
      // Plain text left by an older app version. Only accepted where allowed (auth session).
      if (!acceptPlaintext) return null;
      await write(name, stored);
      return stored;
    }
    const keyHex = await keyStore.get(vaultName(name));
    if (!keyHex) return null; // key lost (e.g. reinstall): the data cannot be read
    try {
      return cipher.decrypt(keyHex, stored.slice(PREFIX.length));
    } catch (e) {
      return null; // wrong key or tampered data is treated as "nothing saved"
    }
  }

  async function erase(name) {
    await backend.removeItem(name);
    await keyStore.remove(vaultName(name));
  }

  // Moves a plain-text value saved under an old name into the encrypted store,
  // then deletes the old copy. The old copy is only deleted after the new one reads back correctly.
  async function moveLegacy(legacyName, name) {
    const current = await backend.getItem(name);
    if (current !== null && current !== undefined) {
      await backend.removeItem(legacyName);
      return false;
    }
    const legacy = await backend.getItem(legacyName);
    if (legacy === null || legacy === undefined) return false;
    await write(name, legacy);
    const check = await read(name);
    if (check !== legacy) return false;
    await backend.removeItem(legacyName);
    return true;
  }

  return {
    getItem: (name) => enqueue(() => read(name)),
    setItem: (name, value) => enqueue(() => write(name, value)),
    removeItem: (name) => enqueue(() => erase(name)),
    migrateLegacy: (legacyName, name) => enqueue(() => moveLegacy(legacyName, name)),
  };
}
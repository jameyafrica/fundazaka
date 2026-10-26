// Runs before every Jest test file.
// AsyncStorage needs a native module, so tests use the official in-memory mock.
   process.env.EXPO_PUBLIC_RESET_ON_LAUNCH = 'false';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// The real encrypted storage needs the phone's Keychain. In tests we keep the real cipher and store
// logic, but use node's crypto for random numbers and an in-memory key vault.
jest.mock('./lib/encryptedStorage', () => {
  const nodeCrypto = require('crypto');
  const asyncStorageModule = require('@react-native-async-storage/async-storage');
  const backend = asyncStorageModule.default || asyncStorageModule;
  const { createAesCtrCipher } = require('./utils/cipher');
  const { createEncryptedStore } = require('./utils/encryptedStore');
  const vault = new Map();
  const keyStore = {
    get: async (name) => (vault.has(name) ? vault.get(name) : null),
    set: async (name, value) => void vault.set(name, value),
    remove: async (name) => void vault.delete(name),
  };
  const cipher = createAesCtrCipher({ randomBytes: (n) => new Uint8Array(nodeCrypto.randomBytes(n)) });
  return {
    stateStorage: createEncryptedStore({ backend, keyStore, cipher }),
    authStorage: createEncryptedStore({ backend, keyStore, cipher, acceptPlaintext: true }),
  };
});

// The phone's fingerprint / face / PIN check does not exist in Jest. Tests can change these mocks.
jest.mock('./lib/appLock', () => ({
  appLockService: {
    isAvailable: jest.fn(async () => true),
    authenticate: jest.fn(async () => ({ ok: true })),
  },
}));

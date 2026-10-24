import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createAesCtrCipher } from '../utils/cipher';
import { createEncryptedStore } from '../utils/encryptedStore';

// Real phone wiring: AsyncStorage holds the encrypted data, the Keychain / Android
// Keystore (via SecureStore) holds the AES key. The key never leaves this device.
function randomBytes(count) {
  const bytes = new Uint8Array(count);
  global.crypto.getRandomValues(bytes);
  return bytes;
}

const vaultOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

const keyStore = {
  get: (name) => SecureStore.getItemAsync(name, vaultOptions),
  set: (name, value) => SecureStore.setItemAsync(name, value, vaultOptions),
  remove: (name) => SecureStore.deleteItemAsync(name, vaultOptions),
};

const cipher = createAesCtrCipher({ randomBytes });

// App data (budget state).
export const stateStorage = createEncryptedStore({ backend: AsyncStorage, keyStore, cipher });

// Supabase login session. acceptPlaintext keeps existing users signed in the first time
// the app opens after this update, then re-saves their session encrypted.
export const authStorage = createEncryptedStore({
  backend: AsyncStorage,
  keyStore,
  cipher,
  acceptPlaintext: true,
});
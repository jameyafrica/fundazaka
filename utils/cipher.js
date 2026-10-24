import aesjs from 'aes-js';

// AES-256-CTR with a fresh random 16-byte IV for every encryption.
// Output format (hex): <32 hex chars of IV><ciphertext>.
// A 4-byte marker is encrypted in front of the text so that a wrong key is
// detected instead of silently producing garbage.
const MARKER = 'FZK1';
const KEY_BYTES = 32;
const IV_BYTES = 16;
const HEX = /^[0-9a-f]+$/i;

function toHex(bytes) {
  return aesjs.utils.hex.fromBytes(bytes);
}

function fromHex(text) {
  if (typeof text !== 'string' || text.length === 0 || text.length % 2 !== 0 || !HEX.test(text)) {
    throw new Error('Invalid hex data');
  }
  return aesjs.utils.hex.toBytes(text);
}

// randomBytes(n) must return n cryptographically secure random bytes (Uint8Array).
export function createAesCtrCipher({ randomBytes }) {
  if (typeof randomBytes !== 'function') {
    throw new Error('A secure randomBytes function is required');
  }

  function generateKey() {
    return toHex(randomBytes(KEY_BYTES));
  }

  function keyToBytes(keyHex) {
    const key = fromHex(keyHex);
    if (key.length !== KEY_BYTES) throw new Error('Invalid key length');
    return key;
  }

  function encrypt(keyHex, text) {
    const key = keyToBytes(keyHex);
    const iv = Uint8Array.from(randomBytes(IV_BYTES));
    if (iv.length !== IV_BYTES) throw new Error('Invalid IV length');
    const plain = aesjs.utils.utf8.toBytes(MARKER + String(text));
    const ctr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(iv));
    return toHex(iv) + toHex(ctr.encrypt(plain));
  }

  function decrypt(keyHex, payload) {
    const key = keyToBytes(keyHex);
    const data = fromHex(payload);
    if (data.length <= IV_BYTES) throw new Error('Payload too short');
    const iv = data.slice(0, IV_BYTES);
    const ctr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(iv));
    const text = aesjs.utils.utf8.fromBytes(ctr.decrypt(data.slice(IV_BYTES)));
    if (!text.startsWith(MARKER)) throw new Error('Wrong key or corrupted data');
    return text.slice(MARKER.length);
  }

  return { generateKey, encrypt, decrypt };
}
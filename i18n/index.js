// Pure translation helpers (no React, no storage, no network), so they are easy to unit test.
import en from './locales/en';
import af from './locales/af';
import zu from './locales/zu';
import xh from './locales/xh';
import st from './locales/st';

export const DEFAULT_LANGUAGE = 'en';

// All 11 official languages. `ready` languages have a translation file and show in the picker.
// To add a language: create i18n/locales/<code>.js, import it below, add it to LOCALES,
// and set ready: true.
export const LANGUAGES = [
  { code: 'en', name: 'English', ready: true },
  { code: 'af', name: 'Afrikaans', ready: true },
  { code: 'zu', name: 'isiZulu', ready: true },
  { code: 'xh', name: 'isiXhosa', ready: true },
  { code: 'st', name: 'Sesotho', ready: true },
  { code: 'tn', name: 'Setswana', ready: false },
  { code: 'nso', name: 'Sepedi', ready: false },
  { code: 'ss', name: 'siSwati', ready: false },
  { code: 've', name: 'Tshivenda', ready: false },
  { code: 'ts', name: 'Xitsonga', ready: false },
  { code: 'nr', name: 'isiNdebele', ready: false },
];

export const LOCALES = { en, af, zu, xh, st };

export function isSupported(code) {
  return Object.prototype.hasOwnProperty.call(LOCALES, code);
}

// "Day {day}" + { day: 5 } -> "Day 5". A placeholder with no value is left as written.
export function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}

function lookup(lang, key) {
  const table = LOCALES[lang];
  if (table && table[key] !== undefined) return table[key];
  return en[key]; // a missing translation falls back to English, never to a blank
}

export function translate(lang, key, params) {
  const value = lookup(lang, key);
  if (typeof value !== 'string') return key; // unknown key: show the key so it is easy to spot
  return interpolate(value, params);
}

// For keys whose value is a list (greetings, motivation lines).
export function translateList(lang, key) {
  const value = lookup(lang, key);
  return Array.isArray(value) ? value : [];
}

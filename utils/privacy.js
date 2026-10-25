import { PRIVACY_VERSION } from '../constants/privacy';

// The record kept when someone accepts the privacy notice.
export function buildConsentRecord(now = new Date()) {
  return { version: PRIVACY_VERSION, acceptedAt: now.toISOString() };
}

// Splits text like "I accept the [Privacy Notice]" around the bracketed link words, so every
// language can put the link wherever its grammar needs it. Text with no brackets has no link.
export function splitLinkText(text) {
  const value = String(text);
  const match = /\[([^\]]+)\]/.exec(value);
  if (!match) return { before: value, link: '', after: '' };
  return {
    before: value.slice(0, match.index),
    link: match[1],
    after: value.slice(match.index + match[0].length),
  };
}
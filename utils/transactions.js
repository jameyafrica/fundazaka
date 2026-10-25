// Pure helpers for correcting the current cycle's transactions: remove, put back, edit.
// No React, no storage, so they are easy to unit test.
import { coerceAmount, cleanText } from './money.js';

// Removes one entry. Returns { list, removed, index }; removed is null when the id is not found.
export function removeTransactionById(list, id) {
  const index = (list || []).findIndex((t) => t && t.id === id);
  if (index === -1) return { list: list || [], removed: null, index: -1 };
  return { list: [...list.slice(0, index), ...list.slice(index + 1)], removed: list[index], index };
}

// Puts a removed entry back where it was (clamped to the list). Does nothing if its id is already there.
export function restoreTransaction(list, transaction, index) {
  const current = list || [];
  if (!transaction || current.some((t) => t.id === transaction.id)) return current;
  const at = Number.isInteger(index) ? Math.min(Math.max(index, 0), current.length) : current.length;
  return [...current.slice(0, at), transaction, ...current.slice(at)];
}

// Changes the amount and/or note of one entry, with the same strict money rules as a new entry.
// Returns { ok: true, list, before, after } or { ok: false, error }.
export function editTransactionById(list, id, changes = {}) {
  const index = (list || []).findIndex((t) => t && t.id === id);
  if (index === -1) return { ok: false, error: 'That entry no longer exists.' };
  const before = list[index];
  const after = { ...before };
  if (changes.amount !== undefined) {
    const parsed = coerceAmount(changes.amount);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    after.amount = parsed.amount;
  }
  if (changes.note !== undefined) after.note = cleanText(changes.note);
  return { ok: true, list: [...list.slice(0, index), after, ...list.slice(index + 1)], before, after };
}

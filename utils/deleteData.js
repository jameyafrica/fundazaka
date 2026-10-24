// "Delete my data": erases everything this app keeps on the phone. Pure: the storages and the
// sign-out call are injected, so it can be tested with fakes.

const SIGN_OUT_TIMEOUT_MS = 4000;

// supabase-js saves the login under sb-<project>-auth-token (plus two helper keys).
// Returns every key the login can live under, or [] when the URL is missing or invalid.
export function getAuthStorageKeys(supabaseUrl) {
  if (!supabaseUrl) return [];
  try {
    const project = new URL(supabaseUrl).hostname.split('.')[0];
    if (!project) return [];
    const key = `sb-${project}-auth-token`;
    return [key, `${key}-user`, `${key}-code-verifier`];
  } catch (e) {
    return [];
  }
}

// Gives up waiting after `ms`, so a bad network can never freeze the delete button.
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

// targets: [{ storage, keys }]  (storage has removeItem(key))
// signOut: optional async function that ends the login on the server. It is best effort:
// being offline must never stop the data on the phone from being erased.
// Returns { ok, failed, signedOutOnServer }. ok is true only if every key was erased.
export async function eraseLocalData({ targets = [], signOut = null, signOutTimeoutMs = SIGN_OUT_TIMEOUT_MS }) {
  let signedOutOnServer = true;
  if (typeof signOut === 'function') {
    try {
      const result = await withTimeout(signOut(), signOutTimeoutMs);
      if (result && result.error) signedOutOnServer = false;
    } catch (e) {
      signedOutOnServer = false;
    }
  }

  const failed = [];
  for (const { storage, keys } of targets) {
    for (const key of keys || []) {
      try {
        await storage.removeItem(key);
      } catch (e) {
        failed.push(key);
      }
    }
  }
  return { ok: failed.length === 0, failed, signedOutOnServer };
}
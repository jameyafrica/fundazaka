import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LANGUAGE, LANGUAGES, isSupported, translate, translateList } from './index';

// Kept apart from the budget state on purpose: signing out or switching account must not
// reset the language.
const STORAGE_KEY = 'fundazaka_language';

function buildValue(lang, setLang, ready) {
  return {
    lang,
    ready,
    setLang,
    languages: LANGUAGES.filter((l) => l.ready),
    t: (key, params) => translate(lang, key, params),
    tList: (key) => translateList(lang, key),
  };
}

// Without a provider (for example in tests) everything simply works in English.
const LanguageContext = createContext(buildValue(DEFAULT_LANGUAGE, () => {}, true));

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && saved && isSupported(saved)) setLangState(saved);
      })
      .catch((e) => console.error('Failed to load language', e))
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback((code) => {
    if (!isSupported(code)) return;
    setLangState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch((e) => console.error('Failed to save language', e));
  }, []);

  const value = useMemo(() => buildValue(lang, setLang, ready), [lang, setLang, ready]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
  return useContext(LanguageContext);
}

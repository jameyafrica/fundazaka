import en from '../i18n/locales/en';
import af from '../i18n/locales/af';
import zu from '../i18n/locales/zu';
import xh from '../i18n/locales/xh';
import st from '../i18n/locales/st';
import { LANGUAGES, interpolate, isSupported, translate, translateList } from '../i18n';

const OTHERS = { af, zu, xh, st };
const placeholders = (text) => (String(text).match(/\{\w+\}/g) || []).sort().join(',');
const asList = (value) => (Array.isArray(value) ? value : [value]);

describe('translation files', () => {
  Object.entries(OTHERS).forEach(([code, table]) => {
    it(`${code} has every English key and no extras`, () => {
      const missing = Object.keys(en).filter((k) => !(k in table));
      const extra = Object.keys(table).filter((k) => !(k in en));
      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });

    it(`${code} keeps the same {placeholders} as English`, () => {
      const wrong = Object.keys(en).filter((key) => {
        const english = asList(en[key]).map(placeholders);
        const other = asList(table[key] || []).map(placeholders);
        return key in table && !other.every((p) => english.includes(p));
      });
      expect(wrong).toEqual([]);
    });

    it(`${code} has no empty text and lists are not empty`, () => {
      Object.entries(table).forEach(([key, value]) => {
        const items = asList(value);
        expect(items.length).toBeGreaterThan(0);
        items.forEach((item) => expect(String(item).trim()).not.toBe(''));
      });
    });
  });
});

describe('translate', () => {
  it('returns the text in the chosen language', () => {
    expect(translate('zu', 'login.logIn')).toBe(zu['login.logIn']);
    expect(translate('af', 'login.logIn')).toBe('Teken in');
  });

  it('fills in placeholders', () => {
    expect(translate('en', 'settings.resetDay', { day: 15 })).toBe('Day 15 of the month');
    expect(translate('af', 'ob.note', { min: 3, max: 5 })).toBe('Minimum 3, maksimum 5.');
  });

  it('falls back to English for an unknown language and to the key for an unknown key', () => {
    expect(translate('xx', 'login.logIn')).toBe('Log in');
    expect(translate('en', 'no.such.key')).toBe('no.such.key');
  });

  it('leaves a placeholder alone when no value is given', () => {
    expect(interpolate('Hi {name}', {})).toBe('Hi {name}');
    expect(interpolate('Hi {name}')).toBe('Hi {name}');
  });

  it('returns lists for greetings and motivation, in the chosen language', () => {
    expect(translateList('xh', 'greetings').length).toBeGreaterThan(0);
    expect(translateList('en', 'motivation.over').length).toBeGreaterThan(0);
    expect(translateList('en', 'login.logIn')).toEqual([]);
  });
});

describe('language list', () => {
  it('lists all 11 official languages and only offers ready ones', () => {
    expect(LANGUAGES).toHaveLength(11);
    LANGUAGES.filter((l) => l.ready).forEach((l) => expect(isSupported(l.code)).toBe(true));
    LANGUAGES.filter((l) => !l.ready).forEach((l) => expect(isSupported(l.code)).toBe(false));
  });
});

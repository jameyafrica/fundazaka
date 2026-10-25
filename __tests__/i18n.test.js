import en from '../i18n/locales/en';
import af from '../i18n/locales/af';
import zu from '../i18n/locales/zu';
import xh from '../i18n/locales/xh';
import st from '../i18n/locales/st';
import { LANGUAGES, interpolate, isSupported, translate, translateList } from '../i18n';
import { COURSES } from '../constants/courses';
import { BADGES } from '../constants/badges';
import { localizeCourse, localizeCourses } from '../i18n/localizeContent';
import { localizeError } from '../i18n/errors';
import { AMOUNT_ZERO_ERROR } from '../utils/money';

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

describe('translated lessons and quizzes', () => {
  ['af', 'zu', 'xh', 'st'].forEach((code) => {
    const localized = localizeCourses(COURSES, code);

    it(`${code}: every course, lesson and question is translated, with the same shape as English`, () => {
      COURSES.forEach((course, ci) => {
        const local = localized[ci];
        expect(local.id).toBe(course.id);
        expect(local.title).not.toBe(course.title);
        expect(local.tagline).not.toBe(course.tagline);
        expect(local.lessons).toHaveLength(course.lessons.length);
        course.lessons.forEach((lesson, li) => {
          const l = local.lessons[li];
          expect(l.id).toBe(lesson.id);
          expect(l.title).not.toBe(lesson.title);
          expect(l.body).toHaveLength(lesson.body.length);
          l.body.forEach((p, i) => expect(p).not.toBe(lesson.body[i]));
          expect(l.tip).toBeTruthy();
          expect(l.tip).not.toBe(lesson.tip);
        });
        expect(local.quiz).toHaveLength(course.quiz.length);
        course.quiz.forEach((q, qi) => {
          const lq = local.quiz[qi];
          expect(lq.id).toBe(q.id);
          expect(lq.correctIndex).toBe(q.correctIndex); // the answer key never moves
          expect(lq.options).toHaveLength(q.options.length);
          expect(lq.prompt).not.toBe(q.prompt);
          expect(lq.explanation).not.toBe(q.explanation);
        });
      });
    });

    it(`${code}: keeps the Rand amounts from the English lessons`, () => {
      const amounts = (text) => (String(text).match(/R\s?\d[\d ]*/g) || []).map((a) => a.replace(/\s/g, '')).sort().join(',');
      COURSES.forEach((course, ci) => {
        course.quiz.forEach((q, qi) => {
          expect(amounts(localized[ci].quiz[qi].options.join(' '))).toBe(amounts(q.options.join(' ')));
        });
      });
    });
  });

  it('falls back to English for English, an unknown language or an unknown course', () => {
    expect(localizeCourse(COURSES[0], 'en')).toBe(COURSES[0]);
    expect(localizeCourse(COURSES[0], 'tn')).toBe(COURSES[0]);
    const unknown = { id: 'new-course', title: 'New', tagline: 'T', lessons: [], quiz: [] };
    expect(localizeCourse(unknown, 'af')).toBe(unknown);
    expect(localizeCourse(null, 'af')).toBeNull();
  });
});

describe('badges, dates and errors', () => {
  it('every badge has a title and description in every language', () => {
    ['en', 'af', 'zu', 'xh', 'st'].forEach((code) => {
      BADGES.forEach((badge) => {
        expect(translate(code, `badge.${badge.id}.title`)).not.toBe(`badge.${badge.id}.title`);
        expect(translate(code, `badge.${badge.id}.desc`)).not.toBe(`badge.${badge.id}.desc`);
      });
    });
    BADGES.forEach((badge) => {
      expect(translate('en', `badge.${badge.id}.title`)).toBe(badge.title);
      expect(translate('en', `badge.${badge.id}.desc`)).toBe(badge.description);
    });
  });

  it('has 12 months and 7 weekdays in every language', () => {
    ['en', 'af', 'zu', 'xh', 'st'].forEach((code) => {
      expect(translateList(code, 'date.months')).toHaveLength(12);
      expect(translateList(code, 'date.weekdays')).toHaveLength(7);
    });
  });

  it('translates the known error messages and leaves unknown ones alone', () => {
    const t = (key, params) => translate('af', key, params);
    expect(localizeError(t, AMOUNT_ZERO_ERROR)).toBe('Voer asseblief \'n bedrag groter as R0 in.');
    expect(localizeError(t, 'Something else')).toBe('Something else');
  });
});

// Swaps the English lesson and quiz text for the chosen language, keeping ids, order and the
// correct-answer indexes exactly as in constants/courses.js. Progress, streaks and scoring all use
// those ids, so switching language never touches saved learning data.
// A missing course, lesson or question (or one with a different number of paragraphs/options) falls
// back to English instead of breaking.
import af from './courses/af';
import zu from './courses/zu';
import xh from './courses/xh';
import st from './courses/st';

const TABLES = { af, zu, xh, st };

export function localizeCourse(course, lang) {
  if (!course) return course;
  const table = TABLES[lang];
  const tc = table && table[course.id];
  if (!tc) return course;
  return {
    ...course,
    title: tc.title || course.title,
    tagline: tc.tagline || course.tagline,
    lessons: course.lessons.map((lesson) => {
      const tl = tc.lessons && tc.lessons[lesson.id];
      if (!tl) return lesson;
      const sameBody = Array.isArray(tl.body) && tl.body.length === lesson.body.length;
      return {
        ...lesson,
        title: tl.title || lesson.title,
        body: sameBody ? tl.body : lesson.body,
        tip: lesson.tip ? tl.tip || lesson.tip : lesson.tip,
      };
    }),
    quiz: course.quiz.map((question) => {
      const tq = tc.quiz && tc.quiz[question.id];
      if (!tq || !Array.isArray(tq.options) || tq.options.length !== question.options.length) return question;
      return {
        ...question,
        prompt: tq.prompt || question.prompt,
        options: tq.options,
        explanation: tq.explanation || question.explanation,
      };
    }),
  };
}

export function localizeCourses(courses, lang) {
  return courses.map((course) => localizeCourse(course, lang));
}

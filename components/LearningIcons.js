import React from 'react';
import { Text, View } from 'react-native';

// The only file that knows which SVG belongs to which course.
// If Metro says "Unable to resolve module", fix the file name in the import below:
// run  ls components/icons | grep -i -E "learning|streak"  to see the real names.
import BudgetingIcon from './icons/LearningPathwaysIconBudgeting10170'; // learning-pathways-icon-budgeting101-70%.svg
import SavingIcon from './icons/LearningPathwaysIconSavingTopLeft70'; // learning-pathways-icon-saving-top-left-70%.svg
import WiseCreditIcon from './icons/LearningPathwaysIconWiseCredit70'; // learning-pathways-icon-wise-credit-70%.svg
import ScamIcon from './icons/LearningPathwaysIconSmartScamTopLeft70'; // learning-pathways-icon-smart-scam-top-left-70%.svg
import StreaksIcon from './icons/Streaks'; // streaks.svg

// Keys are the course ids in constants/courses.js.
const COURSE_ICONS = {
  'budgeting-101': BudgetingIcon,
  'saving-matters': SavingIcon,
  'wise-credit': WiseCreditIcon,
  'scam-awareness': ScamIcon,
};

// Shows the course's SVG. A course with no SVG yet falls back to its emoji from constants/courses.js.
export function CourseIcon({ courseId, fallback = '', size = 48 }) {
  const Icon = COURSE_ICONS[courseId];
  if (Icon) return <Icon width={size} height={size} />;
  return <Text style={{ fontSize: Math.round(size * 0.75) }}>{fallback}</Text>;
}

// The flame on the Learn screen. Dimmed until the user has a streak going.
export function StreakIcon({ size = 48, active = true }) {
  return (
    <View style={{ opacity: active ? 1 : 0.45 }}>
      <StreaksIcon width={size} height={size} />
    </View>
  );
}
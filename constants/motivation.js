// Bundled motivation lines for the dashboard hero (offline, no network).
export const MOTIVATION = {
  default: [
    'Every rand you track is a rand you control.',
    'Small steps, big Zak-Buckz.',
    'Irregular income? Regular habits win.',
    'Awe! One rand at a time.',
  ],
  reached: [
    'Target reached. Lekker!',
    'You nailed it. Time to celebrate (cheaply).',
    'Full marks for this one!',
  ],
  over: [
    "Easy does it. Let's rein it in.",
    "Over target. Shap shap, you can still fix next month.",
    'Eish, that one ran away. Check your breakdown.',
  ],
  savings: [
    'Future you says thank you.',
    'Every rand saved is a little safety net.',
    'Saving is the loudest quiet win.',
  ],
};

// seed is a fixed random number per screen visit, so the line does not flicker.
export function pickMotivation(kind, seed) {
  const list = MOTIVATION[kind] || MOTIVATION.default;
  return list[Math.abs(seed) % list.length];
}

// Bundled tour copy (no network needed).
export const TOUR_STEPS = [
  {
    id: 'zaks',
    title: 'Meet your Zak-Buckz',
    body:
      'Zaks are the money that comes in, whenever it comes in. Your Target is what you plan to spend this month, and your Balance shows how much is still left to put in.',
  },
  {
    id: 'pills',
    title: 'Your expense pills',
    body:
      'Tap a pill to see that expense. The closer you get to your target, the brighter it glows. Go past it and it turns orange. Savings never turns orange, because saving more is always a win.',
  },
  {
    id: 'money',
    title: 'Income in, expenses out',
    body:
      "Money doesn't always arrive on payday, and that's okay. Log income as Work, Gift or Other whenever it lands, and pay expenses against the category they belong to.",
  },
  {
    id: 'toolkit',
    title: 'Your toolkit',
    body: 'Three helpers sit on your dashboard. Tap one to find out what it does.',
  },
  {
    id: 'learn',
    title: 'Learn as you go',
    body:
      'Short lessons on budgeting, saving, credit and spotting scams. Read, take the quiz, keep your daily streak going and collect badges.',
  },
];

export const TOOLKIT = {
  ai: {
    title: 'AI Bot',
    text:
      'Meet Zak, your money assistant. Ask how much you can spend today or whether you will go over budget, and Zak works it out from your own numbers. It runs fully offline, so it uses no data.',
  },
  breakdown: {
    title: 'Breakdown',
    text: 'See every rand in and out, and compare this month with the months before.',
  },
  calculator: { title: 'Calculator', text: 'A quick calculator for those on-the-spot sums.' },
};

export const COURSE_NAMES = ['Budgeting 101', 'Saving Matters', 'Wise Credit', 'Smart Scam Awareness'];

// Example amounts for the interactive pills (each target is R1 000).
export const SAMPLE_PILLS = [
  { key: 'rent', spent: 1000, target: 1000 },
  { key: 'transport', spent: 1200, target: 1000 },
  { key: 'debit', spent: 450, target: 1000 },
  { key: 'groceries', spent: 700, target: 1000 },
  { key: 'savings', spent: 1500, target: 1000 },
];
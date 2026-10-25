// Privacy notice shown at sign-up and in Settings. Plain-language POPIA notice, bundled in the app
// so it works offline. Change PRIVACY_VERSION whenever the wording changes in a way that matters.

export const PRIVACY_VERSION = '2026-10-24';
export const PRIVACY_UPDATED = '24 October 2026';

// The email address people can write to about their information. Set this to a mailbox the team
// reads before the demo. While it is empty, the notice leaves the contact paragraph out.
export const PRIVACY_CONTACT_EMAIL = '';

export const PRIVACY_NOTICE = [
  {
    heading: 'Who we are',
    paragraphs: [
      'Fundazaka is a budgeting and money-learning app for people with irregular income. It is a prototype built by students of WeThinkCode_ for the FNB App of the Year hackathon.',
      'It is not an FNB product, and FNB does not receive your information through this app. The Fundazaka team is the "responsible party" for your information under the Protection of Personal Information Act (POPIA).',
    ],
  },
  {
    heading: 'What we collect and why',
    paragraphs: [
      'When you create an account: your email address, your password and, if you give it, your first name. We use these only to create and protect your login.',
      'As you use the app: the income and expenses you log, your targets, your monthly reset day, your monthly reports, your learning progress, your language choice, and a record that you accepted this notice. We use these only to run the features you see in the app.',
      'We do not ask for your bank account or card numbers, or your ID number. Please do not type them into notes.',
    ],
  },
  {
    heading: 'Where your information is kept',
    paragraphs: [
      'Your budget information is saved only on your phone, in encrypted form. The key is kept in your phone\'s secure storage. Fundazaka does not upload your income, expenses, targets, reports or learning progress to any server.',
      'The Zak assistant works out its answers on your phone and sends nothing out.',
      'Your email address, first name, password and the date you accepted this notice are handled by our login provider, Supabase, which processes them for us so that you can sign in. Your password is sent over a secure connection and is not stored in the app.',
    ],
  },
  {
    heading: 'Sharing',
    paragraphs: [
      'We do not sell your information, use it for advertising, or share it with anyone, except Supabase as described above, or where the law requires it.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'On your phone, until you delete it. You can erase everything on your phone at any time in Settings, using Delete my data.',
      'Your login account stays until you ask us to delete it.',
    ],
  },
  {
    heading: 'Keeping it safe',
    paragraphs: [
      'The data on your phone is encrypted. You can switch on App lock in Settings, so the app asks for your fingerprint, face or phone PIN when you open it. Keep your phone\'s own screen lock on and your password private.',
      'No system is perfectly secure. If we learn that your information was accessed without permission, we will tell you and the Information Regulator, as the law requires.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'Under POPIA you may ask to see the information we hold about you, ask us to correct or delete it, object to how it is used, and withdraw your consent.',
      'Most of your information is on your phone, where you can see and change it in the app, or delete it in Settings. For what is held in your login account, contact us.',
      'You may also complain to the Information Regulator (South Africa): inforegulator.org.za.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: ['Fundazaka is meant for people aged 18 and over.'],
  },
  {
    heading: 'Changes',
    paragraphs: ['If this notice changes, we will update the date at the top.'],
  },
];

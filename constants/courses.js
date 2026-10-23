// Bundled learning content. Everything here ships inside the app so the hub
// works fully offline and uses no mobile data.
//
// Shape:
//   course: { id, title, tagline, icon, lessons: [lesson], quiz: [question] }
//   lesson: { id, title, body: [paragraph], tip? }
//   question: { id, prompt, options: [string], correctIndex, explanation }
// Read time is calculated from the text (see getReadMinutes in utils/learning.js),
// so it can never go out of date when the wording changes.

export const COURSES = [
  {
    id: 'budgeting-101',
    title: 'Budgeting 101',
    tagline: 'Budget when your money does not arrive on the 25th',
    icon: '\u{1F4B0}',
    lessons: [
      {
        id: 'b101-1',
        title: 'Why irregular income needs a different budget',
        body: [
          'Most budgeting advice assumes one salary on one day. If you drive for an e-hailing app, do piece jobs, tutor, sell at the market or get help from family, your money arrives in lumps. A fixed monthly plan breaks the first slow week.',
          'Start by tracking money when it lands, not on a date. Every rand you log, from a R50 tip to a R2 000 payment, is part of your real picture.',
          'Then budget around your lowest normal month, not your best one. If a good month brings in R9 000 but a tough one brings R5 000, plan for R5 000. Anything above that is a bonus you can put towards savings or a goal.',
        ],
        tip: 'Log every rand the day it lands, even small amounts.',
      },
      {
        id: 'b101-2',
        title: 'Needs first: the order of spending',
        body: [
          'When money arrives, spend in this order: a place to stay, getting to work, debit orders you cannot skip (like your phone or insurance), food, then savings, then wants.',
          'This is why Fundazaka lets you pick between three and five expenses and give each a monthly target. Each target is a promise to yourself about how much that part of life gets.',
          'If one category runs out early, take from a want, not from rent or transport. Cutting rent money to fund takeaways is how small problems become big ones.',
        ],
        tip: 'Rent and transport to earn come before everything else.',
      },
      {
        id: 'b101-3',
        title: 'Small spends add up',
        body: [
          'R35 does not feel like much. But R35 a day for 30 days is R1 050, which is more than many people save in a whole month.',
          'Log a purchase right after you pay, while you still remember it. Waiting until the end of the day means forgetting the airtime, the cooldrink and the extra taxi.',
          'When a category turns orange and shows Over, that is not failure. It is an early signal that tells you to slow down or move money, while there is still time in the month to fix it.',
        ],
        tip: 'Orange means adjust, not give up.',
      },
    ],
    quiz: [
      {
        id: 'b101-q1',
        prompt: 'With irregular income, which month should you build your budget around?',
        options: ['Your best month ever', 'Your lowest normal month', 'Only the month you are in', 'You should not budget at all'],
        correctIndex: 1,
        explanation: 'Planning around your lowest normal month means a slow month will not break the plan. Anything extra is a bonus.',
      },
      {
        id: 'b101-q2',
        prompt: 'About how much is R35 spent every day for 30 days?',
        options: ['R350', 'R1 050', 'R3 500', 'R105'],
        correctIndex: 1,
        explanation: '35 x 30 = R1 050. Small daily spends add up fast.',
      },
      {
        id: 'b101-q3',
        prompt: 'When new money arrives, what should be covered first?',
        options: ['Wants like takeaways', 'Gifts for friends', 'Needs like rent and transport to earn', 'Nothing until the month ends'],
        correctIndex: 2,
        explanation: 'Needs come first. If you cannot get to work or keep a roof over your head, nothing else works.',
      },
      {
        id: 'b101-q4',
        prompt: 'A category turns orange and shows Over. What does that mean?',
        options: ['You have failed at budgeting', 'It is a signal to adjust early', 'You must delete the category', 'Nothing, ignore it'],
        correctIndex: 1,
        explanation: 'Over is a heads-up. You can still slow down or move money before the month ends.',
      },
    ],
  },
  {
    id: 'saving-matters',
    title: 'Saving Matters',
    tagline: 'Small, steady savings that survive slow months',
    icon: '\u{1F437}',
    lessons: [
      {
        id: 'sm-1',
        title: 'Pay yourself first',
        body: [
          'Most people save what is left over, and usually nothing is left. Paying yourself first flips this: the moment money arrives, you move a slice to savings before you spend anything.',
          'With irregular income, use a percentage instead of a fixed amount. If you save 10% of every payment, a R2 000 job puts R200 away and a R500 tip puts R50 away. It grows when you earn more and shrinks gently when you earn less.',
          'Small and regular beats big and rare. Ten small deposits you actually make are worth more than one big plan you never start.',
        ],
        tip: 'Pick a percentage you will not miss, then stick to it.',
      },
      {
        id: 'sm-2',
        title: 'Build your emergency buffer',
        body: [
          'An emergency buffer is money for the unexpected: a broken phone, a sick relative, a week with no work. Without one, a small problem becomes a loan.',
          'Start tiny. Aim for one week of your essential costs first, then grow it to a month, then three months. People with irregular income benefit from a bigger buffer because slow weeks are normal for them.',
          'Keep it separate from your everyday money so you do not spend it by accident, but somewhere you can reach it when it is a real emergency.',
        ],
        tip: 'First goal: one week of essential costs.',
      },
      {
        id: 'sm-3',
        title: 'Stokvels and saving smart',
        body: [
          'A stokvel is a group of people who save together. Members contribute regularly and either take turns receiving the pot or save towards a shared goal like groceries or burial costs. The group keeps you disciplined, and that is powerful.',
          'The risk is trust. Before you join, make sure there are clear written rules, you know who looks after the money, and every contribution and payout is recorded where members can see it.',
          'Wherever you save, compare fees and interest. Interest earns interest over time, so starting early matters, even with small amounts.',
        ],
        tip: 'Ask who holds the money and where the rules are written down.',
      },
    ],
    quiz: [
      {
        id: 'sm-q1',
        prompt: 'You save 10% of every payment. How much do you save from a R2 000 job?',
        options: ['R20', 'R100', 'R200', 'R2 000'],
        correctIndex: 2,
        explanation: '10% of R2 000 is R200.',
      },
      {
        id: 'sm-q2',
        prompt: 'What is a good first goal for an emergency buffer?',
        options: ['One year of income', 'One week of essential costs', 'Whatever is left at month end', 'R1 000 000'],
        correctIndex: 1,
        explanation: 'One week of essentials is reachable quickly and still protects you from many small emergencies.',
      },
      {
        id: 'sm-q3',
        prompt: 'Before joining a stokvel, what should you check?',
        options: ['That it has a catchy name', 'That the rules are written and you know who looks after the money', 'That your friends are in it', 'That it asks for your PIN'],
        correctIndex: 1,
        explanation: 'Clear written rules and open record keeping protect every member.',
      },
      {
        id: 'sm-q4',
        prompt: 'In Fundazaka, what happens if you save more than your savings target?',
        options: ['It turns orange and shows Over', 'You are locked out of savings', 'Nothing bad. It is a win and never shows Over', 'The extra is deleted'],
        correctIndex: 2,
        explanation: 'Saving past your target is good news, so Savings never shows the orange Over warning.',
      },
    ],
  },
  {
    id: 'wise-credit',
    title: 'Wise Credit',
    tagline: 'Borrow carefully and know what it really costs',
    icon: '\u{1F4B3}',
    lessons: [
      {
        id: 'wc-1',
        title: 'What credit really costs',
        body: [
          'Borrowing is not free. You pay back what you borrowed plus interest and fees, and the rate you are shown can hide how much that really adds up to.',
          'Watch out for rates quoted per month. Borrowing at 5% a month sounds small, but over a year that is at least 60% before any fees.',
          'The best question to ask any lender is simple: how many rand will I pay back in total, including interest and fees? If they will not answer clearly, walk away.',
        ],
        tip: 'Always ask for the total rand amount you will repay.',
      },
      {
        id: 'wc-2',
        title: 'Registered lenders and mashonisas',
        body: [
          'In South Africa, businesses that lend money must be registered with the National Credit Regulator (NCR). You can check a lender on the NCR website before you sign anything.',
          'Unregistered lenders, often called mashonisas, can look helpful when you are desperate, but they often charge far too much and use pressure to collect.',
          'A big red flag is a lender who asks you to hand over your bank card, PIN or ID as security. A registered lender will not ask for that. Never give anyone your PIN.',
        ],
        tip: 'Check the lender is registered with the NCR first.',
      },
      {
        id: 'wc-3',
        title: 'Your credit record and debit order dates',
        body: [
          'Credit bureaus keep a record of how you handle credit. Paying on time builds a good record, which can help you get fairer deals later. You can ask for a free credit report once every 12 months from each registered credit bureau.',
          'Store accounts and buy-now-pay-later look easy, but they still charge interest or fees if you miss payments. Treat them like any other loan.',
          'With irregular income, the date a debit order leaves your account matters. Choose a date after the time you usually get paid, and keep a small buffer so a failed debit order does not cost you fees.',
        ],
        tip: 'Match debit order dates to when your money usually lands.',
      },
    ],
    quiz: [
      {
        id: 'wc-q1',
        prompt: 'What is the best question to ask a lender?',
        options: ['How fast can I get the money?', 'How many rand will I repay in total, including interest and fees?', 'Do you have a nice office?', 'Can I borrow more next month?'],
        correctIndex: 1,
        explanation: 'The total repayable amount shows the real cost, whatever the rate sounds like.',
      },
      {
        id: 'wc-q2',
        prompt: 'About how much interest is borrowing at 5% a month over a year?',
        options: ['5%', '12%', 'At least 60%', 'Under 1%'],
        correctIndex: 2,
        explanation: '5% a month for 12 months is at least 60% a year, before fees.',
      },
      {
        id: 'wc-q3',
        prompt: 'Which of these is a big red flag from a lender?',
        options: ['They show you their NCR registration', 'They give you the total repayable amount', 'They ask for your bank card and PIN as security', 'They give you time to read the contract'],
        correctIndex: 2,
        explanation: 'Nobody legitimate needs your card and PIN. Never hand them over.',
      },
      {
        id: 'wc-q4',
        prompt: 'How can you check that a lender is legitimate?',
        options: ['Ask a friend', 'Check they are registered with the National Credit Regulator', 'Look at their WhatsApp profile picture', 'See how many adverts they post'],
        correctIndex: 1,
        explanation: 'Registered credit providers appear with the National Credit Regulator.',
      },
    ],
  },
  {
    id: 'scam-awareness',
    title: 'Smart Scam Awareness',
    tagline: 'Spot the trick before it costs you',
    icon: '\u{1F6E1}\uFE0F',
    lessons: [
      {
        id: 'sa-1',
        title: 'How scams work: rush and reward',
        body: [
          'Almost every scam uses one of two tricks. The first is rush: act now, your account will be closed, this offer ends today. The second is reward: you have won, guaranteed returns, a job that pays a lot for little work.',
          'Both aim to stop you thinking. Real banks, employers and shops do not mind if you take time to check.',
          'Whenever something makes your heart race, stop. Pause, verify through an official channel, and only then act.',
        ],
        tip: 'Pause. Verify. Then act.',
      },
      {
        id: 'sa-2',
        title: 'Protect your PIN, OTP and card',
        body: [
          'Never share your PIN, one-time PIN (OTP), CVV or banking password with anyone, even if they say they are from your bank. Real bank staff will never ask you for them.',
          'If a call or SMS feels wrong, hang up. Call the number on the back of your card or open your bank\'s official app yourself. Do not tap links in messages. Type the website address or use the app.',
          'If your phone suddenly loses signal for no reason, or you get messages about a SIM change you did not ask for, contact your mobile provider and your bank straight away. It can be a sign of a SIM swap.',
        ],
        tip: 'Your bank will never ask for your PIN or OTP.',
      },
      {
        id: 'sa-3',
        title: 'Scams to watch for, and what to do',
        body: [
          'Fake job adverts ask you to pay a fee to apply or to get started. Real employers do not charge you to hire you. Fake loan offers ask for an admin fee before they release money that never arrives.',
          'When selling online, a buyer may send a screenshot as proof of payment. A screenshot is not money. Check that the money is really in your account before you hand over anything.',
          '"You have won" messages, fake grant or SASSA messages, and investments that promise fast, guaranteed returns are all classic traps. If you think you were scammed, stop all contact, do not send more money, tell your bank immediately and report it to the police. Then tell family and friends so they stay safe.',
        ],
        tip: 'A screenshot is not payment. Check your account.',
      },
    ],
    quiz: [
      {
        id: 'sa-q1',
        prompt: 'Someone says they are from your bank and asks for the OTP you just received. What do you do?',
        options: ['Give it so they can help', 'Hang up and call the number on the back of your card', 'Send it by WhatsApp instead', 'Give only the first three digits'],
        correctIndex: 1,
        explanation: 'Banks never ask for your OTP. Hang up and call your bank on its official number.',
      },
      {
        id: 'sa-q2',
        prompt: 'A buyer sends a screenshot showing they paid you. What should you do before handing over the item?',
        options: ['Hand it over, the screenshot is proof', 'Check the money is actually in your account', 'Ask them to pay twice', 'Send the item to be safe'],
        correctIndex: 1,
        explanation: 'Screenshots can be faked. Only the money in your account counts.',
      },
      {
        id: 'sa-q3',
        prompt: 'A job advert says you must pay a R300 fee to start. What is this?',
        options: ['A normal training fee', 'A red flag for a scam', 'A sign the job is exclusive', 'A tax requirement'],
        correctIndex: 1,
        explanation: 'Real employers do not charge you to hire you.',
      },
      {
        id: 'sa-q4',
        prompt: 'Your phone suddenly loses signal for no reason and you get a SIM-change message you did not ask for. What now?',
        options: ['Wait a day to see what happens', 'Contact your mobile provider and your bank straight away', 'Click the link in the message', 'Post about it on social media'],
        correctIndex: 1,
        explanation: 'This can be a SIM swap. Acting quickly can stop criminals reaching your accounts.',
      },
    ],
  },
];

export function getCourse(courseId) {
  return COURSES.find((course) => course.id === courseId) || null;
}

<div align="center">

# funda**zaka**

### Budgeting and money confidence for people whose income doesn't arrive on the 25th.

[![Expo](https://img.shields.io/badge/Expo-SDK%2058-041F21?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-00B4A2?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-0A3638?style=for-the-badge&logo=supabase&logoColor=00B4A2)](https://supabase.com)
[![Offline First](https://img.shields.io/badge/Offline-First-F97316?style=for-the-badge)](#-offline-first-by-design)
[![Languages](https://img.shields.io/badge/Languages-5%20of%2011-00B4A2?style=for-the-badge)](#-languages)
[![License](https://img.shields.io/badge/License-MIT-041F21?style=for-the-badge)](#-license)

**Built by team _Ship Happens_ (WeThinkCode\_, Cape Town) for the FNB hackathon**
*Financial Inclusion and Money Confidence challenge*

</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Features](#-features)
- [How the Money Logic Works](#-how-the-money-logic-works)
- [Offline-First by Design](#-offline-first-by-design)
- [Privacy and Security](#-privacy-and-security)
- [Languages](#-languages)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🎯 The Problem

Most budgeting apps assume a fixed monthly salary. In South Africa, millions of people earn through gig work, side hustles, stipends, piece jobs and gifts. Their income arrives in unpredictable amounts at unpredictable times, so a salary-shaped budget breaks in the first week. Mobile data is also expensive, which makes cloud-heavy apps a poor fit.

## 💡 The Solution

**Fundazaka** ("funda" means *learn*, "zaka" means *save*) is a budgeting and financial-literacy app built from the ground up for **irregular income**:

- Log income **whenever it arrives**, in any amount, tagged by source.
- Set **3 to 5 monthly targets** that match real life: rent, transport, debit orders, groceries and savings.
- Get **plain-language guidance** from an offline assistant that works out what is safe to spend from your own numbers.
- **Learn as you go** with bite-sized courses, quizzes and scam-awareness lessons, all bundled in the app.

Everything runs on the phone. No data bundle needed after install.

---

## ✨ Features

### 💰 Budgeting for irregular income

| Feature | What it does |
| --- | --- |
| **Zak-Buckz** | Your running total of income logged. Updates the moment money arrives or leaves. |
| **Income sources** | Tag every payment as `work`, `gift` or `other`. |
| **Category targets** | Choose 3 to 5 of `rent`, `transport`, `debit`, `groceries`, `savings`, then set a Rand target for each. |
| **Over-budget alerts** | Go past a target and the hero card and icon switch to an orange warning with the exact amount over. |
| **Savings exception** | Savings never trigger the warning. Overshooting a savings goal is good news. The action button reads **Add Savings** instead of **Pay Expense**. |
| **Custom reset day** | Pick any day from 1 to 30. In February, days 29 and 30 fall back to the last day of the month. |
| **Monthly archive** | On reset day (or the next time the app opens), totals are archived into a monthly report, spending resets and you review your targets. |
| **Undo** | Remove or edit a transaction and undo it straight away. |

### 🧠 Zak Insights (offline, on-device)

Zak is the in-app assistant. It uses rule-based forecasting over your own transactions and archived months. It is not machine learning and it makes no network calls.

- **Safe-to-spend today**: how much you can spend and still stay on track.
- **Over-budget forecast**: whether your current pace will break a target.
- **Windfall detection**: spots a payment much larger than usual and suggests a safe split, including a share for savings.
- **Suggested targets at reset**: proposes smaller targets when they add up to more than a cautious month of income.
- **Hero-card forecast**: a pace-based projection on the dashboard.
- **Weekday spending pattern**: shows which days you tend to spend the most.
- **Income outlook and next payment**: a view of how steady your income has been and when you usually get paid.

### 🧾 Proof of income

Gig workers are often asked for proof of income by landlords, lenders and retailers. Fundazaka builds a **shareable PDF summary** of your logged income from your own records.

### 🎓 Gamified learning hub

Four bundled courses with lessons, quizzes, daily streaks and badges:

1. **Budgeting 101**
2. **Saving Matters**
3. **Wise Credit**
4. **Smart Scam Awareness**

### 🛠 Everyday tools

- **Calculator** with a full keypad.
- **Breakdown report** with `All`, `Income` and `Expenses` filters, plus a toggle between the current month and archived months.
- **Interactive onboarding tour** and rotating South African welcome greetings.
- **Demo Mode**: one tap loads realistic South African irregular-income data, no sign-up needed.

---

## 🧮 How the Money Logic Works

```
ratio = spentAmount / targetAmount
```

| Rule | Behaviour |
| --- | --- |
| **Opacity tiers** | The category icon and progress indicator scale through `30%`, `41%`, `45%`, `46%`, `60%`, `80%` and `100%` as `ratio` rises. |
| **Over state** | `spentAmount > targetAmount` on any category except `savings` switches to the orange theme. The label changes from **Balance** to **Over**. |
| **Savings** | Never enters the Over state. Icon stays at `80%`. |
| **Onboarding limit** | Fewer than 3 or more than 5 categories blocks progress with a clear message. |
| **February fallback** | Reset day `29` or `30` becomes the last day of February (`28`, or `29` in a leap year). |
| **Missed reset** | If the app was closed on reset day, the reset runs the next time it opens. |

All of this lives in small, pure, tested functions in `utils/` (`budgetMath.js`, `resetDate.js`, `money.js` and others), separate from the UI.

---

## 📶 Offline-First by Design

Target users have limited mobile data, so the app is built to need none.

- **Bundled content**: courses, lessons, quizzes, greetings, badges and translations ship inside the app (`constants/`, `i18n/`).
- **Local state**: all budget data is stored on the device.
- **Offline assistant**: Zak Insights is pure JavaScript. No API calls, no data cost.
- **Resilient launch**: if the network is slow or down, the app keeps you signed in and opens normally.
- **Splash skipped after first launch**, so repeat opens are quick.

---

## 🔐 Privacy and Security

Money information is personal. Fundazaka is designed so that **your budget data stays on your phone**.

- **Encrypted at rest**: budget data is encrypted with AES-256-CTR (a fresh random IV for every write) before it reaches storage.
- **Key in hardware-backed storage**: the encryption key is held in the iOS Keychain or Android Keystore through `expo-secure-store`, set to this device only. It never leaves the phone.
- **App lock**: optional biometric lock with `expo-local-authentication`.
- **Supabase is used for authentication only**: email and password login. Your income and expenses are not uploaded.
- **Delete my data**: one action in Settings erases local data and stored login tokens.
- **POPIA notice**: a plain-language privacy notice is shown at sign-up and in Settings.
- **No sensitive identifiers**: the app never asks for bank account numbers, card numbers or ID numbers.
- **Error boundary**: a crash shows a friendly recovery screen instead of a blank app.

> **Note:** Fundazaka is a hackathon prototype built by WeThinkCode\_ students. It is **not an FNB product**, and FNB does not receive information through this app.

---

## 🌍 Languages

Fundazaka is being localised across South Africa's official languages, with a bundled `i18n/` layer and no extra dependencies.

| Language | Code | Status |
| --- | --- | --- |
| English | `en` | ✅ Complete |
| Afrikaans | `af` | ✅ Included |
| isiZulu | `zu` | ✅ Included |
| isiXhosa | `xh` | ✅ Included |
| Sesotho | `st` | ✅ Included |
| Remaining 6 official languages | | 🗺 Planned |

The language choice is stored separately from budget data, so it survives sign-out. Translations are drafts and are **awaiting native-speaker review**. Corrections are very welcome (see [Contributing](#-contributing)).

---

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React Native 0.88 with **Expo SDK 58** |
| Routing | **Expo Router** (file-based, `app/`) |
| Language | JavaScript |
| Auth | Supabase (`@supabase/supabase-js`) |
| Local storage | AsyncStorage with AES-256-CTR encryption (`aes-js`) and `expo-secure-store` |
| Animation and gestures | `react-native-reanimated`, `react-native-gesture-handler` |
| Graphics | `react-native-svg` (icons and illustrations only) |
| Gradients | `expo-linear-gradient` |
| Security | `expo-local-authentication` |
| Documents | `expo-print`, `expo-sharing`, `expo-file-system` |
| Testing | Jest, `jest-expo`, React Native Testing Library |
| Build | EAS Build |

**Design system:** deep FNB-inspired teal background (`#041F21` to `#0A3638`), translucent glass cards, accent teal `#00B4A2`, alert orange `#F97316`. Logo set in **Advent Pro**, UI text in **Nunito**.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or newer
- npm
- The [Expo Go](https://expo.dev/go) app, or an Android emulator / iOS simulator
- A free [Supabase](https://supabase.com) project (optional, since Demo Mode works without one)

### 1. Clone and install

```bash
git clone https://github.com/jameyafrica/fundazaka.git
cd fundazaka
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key
```

> ⚠️ **Only ever use the publishable (anon) key here.** `EXPO_PUBLIC_` variables are baked into the app bundle and are visible to anyone who has the app. **Never** put a Supabase *secret* or *service role* key in this project. `.env` is git-ignored.

In your Supabase dashboard, go to **Authentication → Sign In / Providers → Email** and turn **Confirm email** off so sign-up logs people in instantly.

No keys? The app still runs. Use **Quick Demo Login** on the login screen.

### 3. Run

```bash
npx expo start -c
```

Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

For biometric prompts such as Face ID, use a development build:

```bash
npx expo run:android   # or: npx expo run:ios
```

### 4. Build an installable Android APK

```bash
npx eas-cli@latest build --profile preview --platform android
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` for the `preview` profile in `eas.json` or as EAS environment variables.

---

## 🗂 Project Structure

```
fundazaka/
├── app/                      # Expo Router screens (file-based routing)
│   ├── _layout.js            # Root layout: providers, fonts, error boundary
│   ├── index.js              # Opening + welcome screens, smart redirect
│   ├── (auth)/               # login, onboarding-expenses, onboarding-tour
│   ├── (tabs)/home.js        # Dashboard: hero card, pills, actions
│   ├── add-transaction.js    # Log income or pay an expense
│   ├── ai-bot.js             # Zak, the offline assistant
│   ├── breakdown.js          # Income / expense reports, monthly archive
│   ├── calculator.js
│   ├── income-proof.js       # Shareable proof-of-income PDF
│   ├── settings.js · privacy.js
│   └── learning/             # Hub, course reader, quiz
├── components/               # Shared UI and SVG icon components
├── constants/                # Bundled content: courses, badges, greetings, theme
├── context/BudgetContext.js  # Single source of truth for app state
├── i18n/                     # Locales (en, af, zu, xh, st) and translated courses
├── lib/                      # Supabase client, encrypted storage, app lock, sharing
├── utils/                    # Pure domain logic (budget math, reset dates, insights)
├── hooks/                    # useScale and other hooks
├── scripts/                  # Quick logic and screen check scripts
└── __tests__/                # Jest unit and component tests
```

**Architecture in one line:** screens are thin and state-driven. Everything that matters to the money lives in `utils/` as pure functions, is exposed to screens through `useBudget()`, and is covered by tests.

---

## 🧪 Testing

```bash
npm test              # run the full Jest suite
npm run test:watch    # watch mode
node scripts/check-logic.mjs   # quick sanity check of the core logic
```

The suite covers the domain rules and the main screens, including:

- budget maths, opacity tiers and the over-budget and savings rules
- reset dates, the February fallback and monthly archiving
- onboarding category limits and validation
- transactions, undo, windfall detection and target suggestions
- insights, forecasting and weekday patterns
- encryption, app lock, data deletion and state sanitising
- i18n and localised screens
- learning hub and quizzes

---

## 🗺 Roadmap

- [ ] Finish the remaining 6 official languages and get native-speaker review
- [ ] Opt-in, encrypted cloud backup so data survives a lost phone
- [ ] Local reminders for upcoming debit orders and reset day
- [ ] Export and share reports as CSV
- [ ] Bank-linked income detection through an FNB integration
- [ ] Accessibility audit (screen readers, font scaling, contrast)

---

## 🤝 Contributing

1. Create a feature branch from `main`, for example `feat/your-feature`.
2. Keep domain logic in `utils/` as pure functions and add a test in `__tests__/`.
3. Run `npm test` before opening a pull request.
4. Open a PR for review. Nothing goes straight to `main`.

**Security reminder:** never commit `.env` files or any secret keys. If you find a vulnerability, please contact the team privately instead of opening a public issue.

---

## 👥 Team

**Ship Happens**, students of **WeThinkCode\_**, Cape Town, South Africa 🇿🇦

Built for the FNB hackathon, *Financial Inclusion and Money Confidence* challenge.

---

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">

**Your wallet says howzit!** 👋

*Made with ❤️ in Cape Town*

</div>
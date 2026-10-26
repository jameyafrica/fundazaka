<div align="center">

<img src="docs/banner.svg" alt="Fundazaka: budgeting and money confidence for irregular income" width="100%">

<br>

[![Expo](https://img.shields.io/badge/Expo-SDK%2058-00B4A2?style=for-the-badge&logo=expo&logoColor=white&labelColor=041F21)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-00B4A2?style=for-the-badge&logo=react&logoColor=white&labelColor=041F21)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-00B4A2?style=for-the-badge&logo=supabase&logoColor=white&labelColor=041F21)](https://supabase.com)
[![Offline First](https://img.shields.io/badge/Offline-First-F97316?style=for-the-badge&labelColor=041F21)](#-offline-first-by-design)
[![Languages](https://img.shields.io/badge/Languages-5%20of%2011-00B4A2?style=for-the-badge&labelColor=041F21)](#-languages)
[![License](https://img.shields.io/badge/License-MIT-00B4A2?style=for-the-badge&labelColor=041F21)](#-license)

**Built by team _Ship Happens_ · WeThinkCode\_ · Cape Town 🇿🇦**
*FNB hackathon · Financial Inclusion and Money Confidence challenge*

[The Problem](#-the-problem) · [Features](#-features) · [Money Logic](#-how-the-money-logic-works) · [Privacy](#-privacy-and-security) · [Get Started](#-getting-started) · [Roadmap](#-roadmap)

</div>

<img src="docs/divider.svg" width="100%" alt="">

## 🎯 The Problem

Most budgeting apps assume a fixed monthly salary. In South Africa, millions of people earn through gig work, side hustles, stipends, piece jobs and gifts. Their income arrives in unpredictable amounts at unpredictable times, so a salary-shaped budget breaks in the first week. Mobile data is also expensive, which makes cloud-heavy apps a poor fit.

## 💡 The Solution

**Fundazaka** (*funda* means learn, *zaka* means save) is a budgeting and financial-literacy app built from the ground up for **irregular income**.

<table>
  <tr>
    <td width="25%" align="center"><h3>💸</h3><b>Log income when it lands</b><br><sub>Any amount, tagged work, gift or other.</sub></td>
    <td width="25%" align="center"><h3>🎯</h3><b>3 to 5 real targets</b><br><sub>Rent, transport, debit orders, groceries, savings.</sub></td>
    <td width="25%" align="center"><h3>🧠</h3><b>Zak, your offline guide</b><br><sub>Works out what is safe to spend from your own numbers.</sub></td>
    <td width="25%" align="center"><h3>🎓</h3><b>Learn as you go</b><br><sub>Courses, quizzes and scam awareness, all bundled.</sub></td>
  </tr>
</table>

> [!NOTE]
> Everything runs on the phone. After install, Fundazaka needs no mobile data.

<img src="docs/divider.svg" width="100%" alt="">

## ✨ Features

### 💰 Budgeting for irregular income

| | Feature | What it does |
| :-: | --- | --- |
| 🪙 | **Zak-Buckz** | Your running total of income logged. Updates the moment money arrives or leaves. |
| 🏷 | **Income sources** | Tag every payment as `work`, `gift` or `other`. |
| 📂 | **Category targets** | Choose 3 to 5 of `rent`, `transport`, `debit`, `groceries`, `savings`, then set a Rand target for each. |
| 🟠 | **Over-budget alerts** | Go past a target and the hero card and icon turn orange, showing exactly how much you are over. |
| 🌱 | **Savings exception** | Savings never trigger the warning, because overshooting a savings goal is good news. The button reads **Add Savings** instead of **Pay Expense**. |
| 📅 | **Custom reset day** | Pick any day from 1 to 30. In February, 29 and 30 fall back to the last day of the month. |
| 🗄 | **Monthly archive** | On reset day (or the next time you open the app), totals are archived into a report and you review your targets. |
| ↩️ | **Undo** | Remove or edit a transaction, then undo it straight away. |

### 🧠 Zak Insights (offline, on-device)

Zak is the in-app assistant. It uses rule-based forecasting over your own transactions and archived months. It is not machine learning, and it makes no network calls.

<table>
  <tr>
    <td width="50%" valign="top">

**🔮 Predict**
- **Safe-to-spend today** that keeps you on track
- **Over-budget forecast** from your current pace
- **Hero-card forecast** right on the dashboard
- **Weekday spending pattern** showing your costliest days

</td>
    <td width="50%" valign="top">

**🛟 Protect**
- **Windfall detection** that spots an unusually big payment and suggests a safe split
- **Suggested targets** at reset when they add up to more than a cautious month of income
- **Income outlook** and **next payment** estimates

</td>
  </tr>
</table>

### 🧾 Proof of income

Gig workers are often asked for proof of income by landlords, lenders and retailers. Fundazaka builds a **shareable PDF summary** of your logged income from your own records.

### 🎓 Gamified learning hub

| 📘 Budgeting 101 | 🐖 Saving Matters | 💳 Wise Credit | 🛡 Smart Scam Awareness |
| :-: | :-: | :-: | :-: |
| Plan irregular income | Pay yourself first | Know what credit costs | Spot the tricks |

Lessons, quizzes, daily streaks and badges, all bundled in the app.

### 🛠 Everyday tools

- 🧮 **Calculator** with a full keypad
- 📊 **Breakdown report** with `All`, `Income` and `Expenses` filters, and a toggle between the current month and archived months
- 🧭 **Interactive tour** and rotating South African welcome greetings
- 🚀 **Demo Mode**: one tap loads realistic irregular-income data, no sign-up needed

<img src="docs/divider.svg" width="100%" alt="">

## 🧮 How the Money Logic Works

<div align="center">
<img src="docs/opacity-tiers.svg" alt="Opacity tiers from 30 to 100 percent, then the orange Over state" width="85%">
</div>

<br>

| Rule | Behaviour |
| --- | --- |
| **Opacity tiers** | The category icon and progress indicator scale through `30%`, `41%`, `45%`, `46%`, `60%`, `80%` and `100%` as the ratio rises. |
| **Over state** | `spentAmount > targetAmount` on any category except `savings` switches to the orange theme, and the label changes from **Balance** to **Over**. |
| **Savings** | Never enters the Over state. The icon stays at `80%`. |
| **Onboarding limit** | Fewer than 3 or more than 5 categories blocks progress with a clear message. |
| **February fallback** | Reset day `29` or `30` becomes the last day of February (`28`, or `29` in a leap year). |
| **Missed reset** | If the app was closed on reset day, the reset runs the next time it opens. |

All of this lives in small, pure, tested functions in `utils/` (`budgetMath.js`, `resetDate.js`, `money.js` and others), separate from the UI.

<img src="docs/divider.svg" width="100%" alt="">

## 📶 Offline-First by Design

Target users have limited mobile data, so the app is built to need none.

- 📦 **Bundled content**: courses, lessons, quizzes, greetings, badges and translations ship inside the app
- 💾 **Local state**: all budget data is stored on the device
- 🧠 **Offline assistant**: Zak Insights is pure JavaScript, with no API calls and no data cost
- 🛟 **Resilient launch**: on a slow or missing network, the app keeps you signed in and opens normally
- ⚡ **Splash skipped after first launch**, so repeat opens are quick

## 🔐 Privacy and Security

Money information is personal, so Fundazaka is designed to keep **your budget data on your phone**.

| | |
| --- | --- |
| 🔒 **Encrypted at rest** | AES-256-CTR with a fresh random IV for every write, applied before data reaches storage. |
| 🗝 **Hardware-backed key** | The key lives in the iOS Keychain or Android Keystore via `expo-secure-store`, this device only. It never leaves the phone. |
| 👆 **App lock** | Optional biometric lock with `expo-local-authentication`. |
| 🪪 **Auth only** | Supabase handles email and password login. Your income and expenses are not uploaded. |
| 🗑 **Delete my data** | One action in Settings erases local data and stored login tokens. |
| 📜 **POPIA notice** | A plain-language privacy notice at sign-up and in Settings. |
| 🚫 **No sensitive IDs** | The app never asks for bank account, card or ID numbers. |
| 🧯 **Error boundary** | A crash shows a friendly recovery screen, not a blank app. |

> [!IMPORTANT]
> Fundazaka is a hackathon prototype built by WeThinkCode\_ students. It is **not an FNB product**, and FNB does not receive information through this app.

## 🌍 Languages

Fundazaka is being localised across South Africa's official languages, using a bundled `i18n/` layer with no extra dependencies.

| Language | Code | Status |
| --- | :-: | --- |
| English | `en` | ✅ Complete |
| Afrikaans | `af` | ✅ Included |
| isiZulu | `zu` | ✅ Included |
| isiXhosa | `xh` | ✅ Included |
| Sesotho | `st` | ✅ Included |
| Remaining 6 official languages | | 🗺 Planned |

The language choice is stored separately from budget data, so it survives sign-out.

> [!NOTE]
> Translations are drafts and are **awaiting native-speaker review**. Corrections are very welcome.

<img src="docs/divider.svg" width="100%" alt="">

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | React Native 0.88 with **Expo SDK 58** |
| **Routing** | **Expo Router** (file-based, `app/`) |
| **Language** | JavaScript |
| **Auth** | Supabase (`@supabase/supabase-js`) |
| **Local storage** | AsyncStorage, AES-256-CTR (`aes-js`), `expo-secure-store` |
| **Motion** | `react-native-reanimated`, `react-native-gesture-handler` |
| **Graphics** | `react-native-svg` (icons and illustrations only), `expo-linear-gradient` |
| **Security** | `expo-local-authentication` |
| **Documents** | `expo-print`, `expo-sharing`, `expo-file-system` |
| **Testing** | Jest, `jest-expo`, React Native Testing Library |
| **Build** | EAS Build |

### 🎨 Design system

| Token | Value |
| --- | --- |
| Background | ![#041F21](https://img.shields.io/badge/%23041F21-041F21?style=flat-square) to ![#0A3638](https://img.shields.io/badge/%230A3638-0A3638?style=flat-square) deep teal gradient |
| Accent teal | ![#00B4A2](https://img.shields.io/badge/%2300B4A2-00B4A2?style=flat-square) |
| Over-budget orange | ![#F97316](https://img.shields.io/badge/%23F97316-F97316?style=flat-square) |
| Cards | Translucent teal glass, `borderRadius: 20` |
| Type | **Advent Pro** for the logo, **Nunito** for the interface |

<img src="docs/divider.svg" width="100%" alt="">

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or newer, and npm
- The [Expo Go](https://expo.dev/go) app, or an Android emulator or iOS simulator
- A free [Supabase](https://supabase.com) project (optional, since Demo Mode works without one)

### 1. Clone and install

```bash
git clone https://github.com/jameyafrica/fundazaka.git
cd fundazaka
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key
```

> [!WARNING]
> **Only use the publishable (anon) key here.** `EXPO_PUBLIC_` variables are baked into the app bundle and visible to anyone who has the app. **Never** put a Supabase *secret* or *service role* key in this project. `.env` is git-ignored.

In the Supabase dashboard, go to **Authentication → Sign In / Providers → Email** and turn **Confirm email** off so sign-up logs people in instantly.

No keys? The app still runs. Tap **Quick Demo Login** on the login screen.

### 3. Run

```bash
npx expo start -c
```

Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go. For biometric prompts such as Face ID, use a development build:

```bash
npx expo run:android   # or: npx expo run:ios
```

### 4. Build an installable Android APK

```bash
npx eas-cli@latest build --profile preview --platform android
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` for the `preview` profile in `eas.json`, or as EAS environment variables.

<details>
<summary><b>🗂 Project structure</b></summary>

<br>

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
├── docs/                     # README graphics
└── __tests__/                # Jest unit and component tests
```

**Architecture in one line:** screens are thin and state-driven. Everything that matters to the money lives in `utils/` as pure functions, is exposed through `useBudget()`, and is covered by tests.

</details>

<details>
<summary><b>🧪 Testing</b></summary>

<br>

```bash
npm test                       # run the full Jest suite
npm run test:watch             # watch mode
node scripts/check-logic.mjs   # quick sanity check of the core logic
```

The suite covers:

- budget maths, opacity tiers, and the over-budget and savings rules
- reset dates, the February fallback and monthly archiving
- onboarding category limits and validation
- transactions, undo, windfall detection and target suggestions
- insights, forecasting and weekday patterns
- encryption, app lock, data deletion and state sanitising
- i18n and localised screens
- the learning hub and quizzes

</details>

<img src="docs/divider.svg" width="100%" alt="">

## 🗺 Roadmap

- [ ] Finish the remaining 6 official languages and get native-speaker review
- [ ] Opt-in, encrypted cloud backup so data survives a lost phone
- [ ] Local reminders for upcoming debit orders and reset day
- [ ] Export and share reports as CSV
- [ ] Bank-linked income detection through an FNB integration
- [ ] Accessibility audit (screen readers, font scaling, contrast)

## 🤝 Contributing

1. Create a feature branch from `main`, for example `feat/your-feature`.
2. Keep domain logic in `utils/` as pure functions and add a test in `__tests__/`.
3. Run `npm test` before opening a pull request.
4. Open a PR for review. Nothing goes straight to `main`.

> [!CAUTION]
> Never commit `.env` files or secret keys. If you find a vulnerability, please contact the team privately instead of opening a public issue.

## 👥 Team

**Ship Happens** · students of **WeThinkCode\_**, Cape Town, South Africa 🇿🇦
Built for the FNB hackathon, *Financial Inclusion and Money Confidence* challenge.

## 📄 License

Released under the [MIT License](LICENSE).

<br>

<div align="center">

<img src="docs/divider.svg" width="100%" alt="">

**Your wallet says howzit!** 👋

<sub>Made with ❤️ in Cape Town</sub>

</div>

# 💳 Finote — Personal Finance Tracker

> Catat keuanganmu dengan mudah dan cerdas. Manage income, expenses, savings, and daily notes in one beautiful dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/finote)

---

## ✨ Features

### 📊 Dashboard
- Real-time financial summary (balance, income, expenses, savings)
- 6-month trend area chart + expense pie chart by category
- **Financial Health Score** (0–100) with 5-dimension breakdown
- **Smart Insights** — automatic analysis of spending trends, savings progress, income changes
- Recent activity feed

### 💸 Income Management
- Add, edit, delete income entries
- Category tagging + notes
- Filter by month

### 💳 Expense Tracking
- Full CRUD for expenses
- 6 built-in categories: Makan, Transportasi, Hiburan, Pendidikan, Belanja, Lainnya
- Monthly filter + card/table views

### 🐷 Savings Goals
- Create savings targets with custom amounts and colors
- Track progress with animated bars
- Deposit/withdraw from goals

### 📝 Memos
- Daily financial notes with rich text
- Pin important memos

### 📈 Statistics
- Monthly breakdown charts
- Category comparison
- Income vs expense trends

### 🏆 Achievements (Gamification)
- 16 achievements across 4 categories (Pencatatan, Tabungan, Kebiasaan, Kesehatan Finansial)
- 4 rarity tiers: Common, Rare, Epic, Legendary
- XP + Level system (5 levels)
- Real-time unlock notifications

### 💡 Smart Insights
- 14 automatic insight types (spending spikes, savings progress, balance trends, projections)
- Severity-based sorting (Warning → Negative → Positive → Tips)
- Dedicated `/insights` page

### 📱 Progressive Web App
- Installable on Android, iOS, and Desktop
- Offline support via Workbox service worker
- 26 precached assets for instant load
- Native install prompt
- Update notification system

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | TailwindCSS 3 + CSS Custom Properties |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL + Auth) |
| Charts | Recharts 3 |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Notifications | react-hot-toast |
| Date | date-fns 4 |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/finote.git
cd finote

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run the database schema
# Open Supabase SQL Editor and run supabase_schema.sql

# 5. Start development server
npm run dev
```

### Build for production

```bash
npm run build
npm run preview   # Preview production build locally
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.
> Only the `VITE_` prefix is required — Vite only exposes variables with this prefix to the browser.

### Getting your Supabase credentials

1. Go to [supabase.com](https://supabase.com) → Your Project → **Settings** → **API**
2. Copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 🗄️ Database Setup

Run the SQL schema in your Supabase project:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Paste and run the contents of `supabase_schema.sql`

This creates the following tables with Row Level Security (RLS) enabled:
- `transactions` — income and expense records
- `savings_goals` — savings targets and progress
- `memos` — daily notes

### Supabase Authentication Setup

1. Go to **Authentication** → **Providers** → Enable **Email**
2. Optional: Disable **Confirm email** for faster testing (Settings → Auth → Email Confirmations)
3. Set **Site URL** to your production domain (e.g. `https://finote.vercel.app`)
4. Add your domain to **Redirect URLs**

---

## 🌐 Deployment Guide

### Deploy to Vercel (Recommended)

#### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Add environment variables in **Settings** → **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

> The `vercel.json` in the project root handles SPA routing, caching headers, and the correct MIME type for `manifest.webmanifest`.

#### Option C: Deploy manually

```bash
npm run build
# Upload the /dist folder to any static host
```

### Other Platforms

| Platform | Notes |
|---|---|
| **Netlify** | Add `_redirects` file: `/* /index.html 200` |
| **GitHub Pages** | Set base URL in vite.config.js; use 404.html redirect trick |
| **Cloudflare Pages** | Works out-of-the-box; add env vars in dashboard |

---

## 📱 PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the **"Install Finote"** banner that appears
3. Or tap menu (⋮) → **Add to Home Screen**

### iOS (Safari)
1. Open the app in Safari
2. Tap the **Share** button (⬆️)
3. Select **Add to Home Screen**
4. Tap **Add**

### Desktop (Chrome/Edge)
1. Click the **install icon** (⊕) in the address bar
2. Or click the **"Install Finote"** banner

---

## 📂 Project Structure

```
finote/
├── public/                 # Static assets & PWA icons
│   ├── favicon.svg
│   ├── pwa-192.png
│   ├── pwa-512.png
│   └── maskable-icon-512x512.png
├── src/
│   ├── components/
│   │   ├── achievements/   # Achievement card UI
│   │   ├── common/         # Layout, sidebar, modals, forms
│   │   ├── dashboard/      # HealthScore, SmartInsights, MonthlyReport
│   │   └── pwa/            # Install prompt, update prompt, offline banner
│   ├── contexts/           # AuthContext, ThemeContext
│   ├── hooks/              # useTransactions, useSavings, useMemos, useAchievements
│   ├── lib/                # supabase.js client
│   ├── pages/              # Dashboard, Income, Expenses, Savings, Memos, Statistics, Achievements, Insights
│   ├── router/             # ProtectedRoute
│   ├── utils/              # formatCurrency, dateHelpers, categories, financialInsights
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           # Design system (CSS custom properties)
├── .env.example            # Environment variable template
├── vercel.json             # Vercel deployment config
├── vite.config.js          # Vite + PWA + code splitting
└── supabase_schema.sql     # Database schema
```

---

## 🔧 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🛡️ Security Notes

- All Supabase tables use **Row Level Security (RLS)** — users can only access their own data
- The `VITE_SUPABASE_ANON_KEY` is a **public anon key** — safe to include in frontend code
- Never use your Supabase **service_role** key in frontend code
- Environment variables with `VITE_` prefix are embedded into the build — don't put secret keys here

---

## 📄 License

MIT © 2025 Finote

# 🏠 Dorm Solution — Web Application (`/web`)

High-performance, modern React 19 web application for the **Dorm Solution (11/38 Home)** management ecosystem. Designed for instant dashboard display, seamless background synchronization, offline data resilience, and responsive desktop/mobile workflows for dormitory Managers and Members.

**Live Production Web App:** [https://dorm-solution.vercel.app](https://dorm-solution.vercel.app)

---

## ⚡ Instant Loading with Client-Side Persistent Caching

To eliminate long loading times (such as 40–50 second backend cold starts on Render), the web application implements **Client-Side Persistent Caching** using **IndexedDB** and **TanStack Query Persist Client**.

```
                   ┌──────────────────────────────────────────────┐
                   │               Browser Opens                  │
                   │    (Auth restored synchronously from local)  │
                   └──────────────────────┬───────────────────────┘
                                          │
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │          Hydrate from IndexedDB              │
                   │      Key: "dorm_query_cache_{userId}"        │
                   └──────────────────────┬───────────────────────┘
                                          │
                                          ▼
            ┌────────────────────────────────────────────────────────────┐
            │ Instant Render: Cached stats, cards, meal plans, & notices │
            │               (0s delay, NO blocking spinners)             │
            └─────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │       Background Revalidation (API)          │
                   │        (Render backend + Redis cache)        │
                   └──────────────┬───────────────────────────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
          [Network Success]             [Network Offline / Slow]
          - Update React UI             - Keep cached data on screen
          - Persist to IndexedDB        - Show subtle sync status pill
```

### Key Highlights:
- **Instant Display (0 ms):** Previously fetched stats, expenses, meals, and notices appear immediately when reopening the site or switching tabs.
- **Stale-While-Revalidate:** Displays cached data instantly, fetches fresh updates in the background, and seamlessly re-renders the UI when new data arrives.
- **IndexedDB Multi-Megabyte Storage:** Avoids the 5MB quota and synchronous blocking of `localStorage` by utilizing asynchronous IndexedDB via `idb-keyval`.
- **User Data Isolation:** Storage keys are strictly scoped per authenticated user (`dorm_query_cache_${userId}`). Manager and member data are completely separated.
- **Automatic Cache Purging on Logout:** Logging out immediately removes the user's IndexedDB store and purges in-memory query caches, preventing data leakage between users sharing a device.
- **Non-Intrusive Sync Indicator:** A status pill in the top header indicates `Syncing...`, `Offline (Cached)`, or `Up to date` without ever blocking the UI with full-page spinners.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React 19** | Latest concurrent React framework |
| **Vite (v8)** | High-speed frontend build tool and dev server |
| **TanStack React Query (v5)** | Server-state management, caching, and background refetching |
| **@tanstack/react-query-persist-client** | Official query persistence engine |
| **idb-keyval** | Lightweight, asynchronous Promise-based IndexedDB storage |
| **Tailwind CSS (v4) & HeroUI** | Modern utility-first styling and accessible UI components |
| **Framer Motion (v12)** | Fluid micro-interactions, layout transitions, and animations |
| **Recharts (v3)** | Interactive data visualization and financial trend charts |
| **Firebase Auth (v12)** | Client-side Google OAuth popup authentication |
| **Socket.IO Client** | Real-time notifications and synchronized updates |
| **Lucide React** | Clean, consistent icon set |

---

## ✨ Key Features

### 👑 Manager Portal (`/manager`)
- **Manager Dashboard:** Real-time summary cards (total members, occupied rooms, grocery & common expenses, dynamic meal rate, net balance after deduction).
- **Meal Management:** Daily meal tracking (Lunch/Dinner), bulk entry modal, and month-long breakdown grid.
- **Expense Recording:** Log and categorize expenses into **Grocery** (affects meal rate) and **Common Costs** (divided among active members).
- **Billing & Carry-Forward Balances:** Automated balance carry-forward, payment approval, and member debt/credit tracking.
- **Bazaar / Market Team:** Assign rotating market duties, inspect upcoming dates, and track purchase histories.
- **Member Directory:** Resident approval, room assignments, active/pending status toggling.
- **Room Management:** Room configurations, capacities, and occupant allocations.
- **Notices & Complaints:** Publish dorm-wide notices and track member complaint resolutions.

### 👤 Member Portal (`/dashboard`)
- **Personal Dashboard:** Personal meal consumption counts, food cost, common cost share, total payable, and net balance.
- **My Meals:** Personal daily lunch/dinner logs and upcoming weekly meal menu.
- **Market Duty:** Check upcoming personal bazaar assignments and duty partners.
- **Payment History:** Log payments with transaction IDs and track verification status.
- **Complaints & Feedback:** Submit maintenance or service complaints directly to the manager.
- **Dorm Notices:** Read high-priority announcements and dormitory rules.

### 🌟 Shared Ecosystem Highlights
- **AI Chat Widget:** Floating assistant widget communicating with the backend's n8n AI webhook.
- **Live Dhaka Digital Clock:** Accurate real-time time display formatted for Bangladesh Standard Time (BST).
- **Audio Sound Effects:** Subtle acoustic feedback toggled via the SoundContext audio switch.
- **GTA6 / Dark Theme:** Custom high-contrast dark theme with animated mascots and responsive navigation.

---

## 📂 Project Directory Structure

```text
web/
├── src/
│   ├── components/
│   │   ├── layout/               # Header, Sidebar, QuickAccessPanel, UserDropdown, ChatWidget
│   │   ├── shared/               # StatCard, CommunitySummary, WeeklyMealPlan, SyncStatusIndicator, Clock
│   │   └── ui/                   # LoadingSpinner, buttons, modals, input elements
│   ├── config/
│   │   ├── axios.js              # Axios instance with auth interceptors
│   │   ├── firebase.js           # Firebase Auth client setup
│   │   ├── queryClient.js        # Global TanStack QueryClient with offlineFirst
│   │   └── queryPersister.js     # User-isolated IndexedDB persister & dehydrate filter
│   ├── contexts/
│   │   ├── AuthContext.jsx       # Auth session, Google login, and logout cache cleanup
│   │   ├── ThemeContext.jsx      # Dark/light theme management
│   │   ├── SoundContext.jsx      # Audio effects toggle
│   │   └── LampIntroContext.jsx  # Welcome animation session state
│   ├── features/                 # Modular feature hooks (market schedules, etc.)
│   ├── pages/
│   │   ├── auth/                 # LoginPage, RegisterPage, PendingPage
│   │   ├── manager/              # ManagerDashboard, MealsPage, ExpensesPage, MembersPage, etc.
│   │   ├── member/               # MemberDashboard, MyMealsPage, MyBillsPage, etc.
│   │   └── shared/               # NotificationsPage, ProfilePage, UnauthorizedPage
│   ├── routes/
│   │   ├── index.jsx             # React Router routing configuration
│   │   └── ProtectedRoute.jsx    # Role-based route guard
│   ├── utils/                    # Constants, formatters, calculations
│   ├── App.jsx                   # Root application container & toast setup
│   └── main.jsx                  # Entry point with PersistQueryClientProvider
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔧 Environment Variables (`.env`)

Create a `.env` file in the `/web` directory:

```env
# ─── Backend API URL ───────────────────────────────────────
VITE_API_URL=http://localhost:5000/api

# ─── Firebase Web Client Configuration ─────────────────────
# (From Firebase Console -> Project Settings -> General -> Your Apps)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=our-home-dhaka.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=our-home-dhaka
VITE_FIREBASE_STORAGE_BUCKET=our-home-dhaka.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=963460781921
VITE_FIREBASE_APP_ID=1:963460781921:web:7562590e5e4921ba6a5720
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📜 License
This project is licensed under the MIT License.

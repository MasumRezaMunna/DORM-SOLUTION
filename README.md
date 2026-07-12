# 4/67 Home Dormitory Management System 🏠

A comprehensive, full-stack web application designed to manage dormitory activities efficiently. This platform simplifies daily operations, from meal tracking to expense management and member communications, with role-based access for Managers and Members.

**Live Demo:** [https://dorm-solution.vercel.app](https://dorm-solution.vercel.app)

---

## ✨ Key Features

### For Managers
- **Dashboard Overview:** At-a-glance view of total active members, monthly expenses, outstanding bills, and daily meal counts.
- **Meal Management:** Advanced tracking of daily meals (Lunch/Dinner). Includes bulk entry options and a detailed daily breakdown table for the entire month.
- **Financial Tracking:** Record and categorize expenses (e.g., Grocery, Utility, Maintenance). Generate monthly financial summaries and calculate meal rates dynamically based on grocery expenses.
- **Billing & Payments:** Generate monthly bills for members, track payment status, and manage balances (overpaid or due).
- **Member Management:** Add, edit, or deactivate members. Assign rooms and track individual balances.
- **Notices & Communication:** Publish notices for all members and manage resident complaints.

### For Members
- **Personal Dashboard:** View current month's meal summary, total bill, and personal payment status.
- **Meal Requests:** Check personal meal logs and upcoming schedules.
- **Community:** View public notices and submit maintenance/service complaints directly to the manager.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [HeroUI](https://heroui.com/)
- **State Management & Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Forms & Validation:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Authentication:** Firebase Auth
- **Real-time:** Socket.io-client

### Backend (`/server`)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Firebase Admin SDK & JSON Web Tokens (JWT)
- **Real-time:** Socket.io
- **Security:** Helmet, Express Rate Limit, CORS

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account (Atlas or local instance)
- Firebase project setup (for authentication)

### 1. Clone the repository
```bash
git clone https://github.com/MasumRezaMunna/DORM-SOLUTION.git
cd Home
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and configure the following:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory with your Firebase config and API URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
Start the frontend app:
```bash
npm run dev
```

### 4. Development Database Strategy
To avoid altering production data while testing, a `copy_db.js` script is provided in the `server` folder. It duplicates your production MongoDB database into a new `dev_dorm` database. You can run `node copy_db.js` and then point your `MONGODB_URI` to `dev_dorm`.

---

## 📂 Folder Structure

```text
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components (Manager, Member views)
│   │   ├── routes/         # Application routing setup
│   │   └── utils/          # Helper functions, constants
│   └── package.json
└── server/                 # Express Backend
    ├── src/
    │   ├── controllers/    # Request handlers
    │   ├── middlewares/    # Custom middlewares (Auth, Roles)
    │   ├── models/         # Mongoose schemas
    │   ├── routes/         # Express routes
    │   └── utils/          # API response builders, error handlers
    ├── server.js           # Server entry point
    └── package.json
```

---

## 📜 License
This project is licensed under the MIT License.

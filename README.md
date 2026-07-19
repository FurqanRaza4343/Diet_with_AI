# 🥗 VitaAI — AI-Powered Nutrition & Diet Planner

> **Live:** [https://vita-ai.insforge.site](https://vita-ai.insforge.site)

VitaAI is a full-featured, AI-powered nutrition and diet planning application. Built with **React 19**, **Tailwind CSS**, and **InsForge** backend, it provides personalized meal plans, food analysis via image/text/voice, health tracking, grocery lists, and an intelligent AI assistant — all with real-time data and zero mock responses.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Meal Planner** | Generate daily/weekly meal plans based on diet type, cuisine, allergies, activity level, cooking time, budget, and excluded ingredients |
| **Smart Food Scanner** | Analyze food via camera, image upload, or text — Mistral AI returns calories, protein, carbs, fat, fiber, sugar, health score, ingredients, warnings, and recommendations |
| **Voice Input & TTS** | Speak your meals in 9 languages; AI responds with spoken summaries |
| **Health Tracking** | Log weight, water intake, calories, steps, sleep, mood — view progress on charts |
| **Grocery Lists** | Auto-generate from weekly meal plans with check-off and category sorting |
| **Meal History** | Favorites, search, detailed macro breakdown per meal |
| **Weekly Meal Plans** | 7-day schedules with day-by-day meal details and weekly nutrition summary |
| **AI Chat Assistant** | Floating chatbot for nutrition questions, tips, and recommendations |
| **Admin Panel** | User management, food database CRUD, platform oversight |
| **Auth** | Email/password, Google OAuth, GitHub OAuth — secure session management |

---

## 🧠 AI Integration

VitaAI uses **Mistral AI** (`mistral-large-latest`, `mistral-ocr-latest`) running in **InsForge Edge Functions** for all AI features:

- **Image analysis** — OCR extracts image description → food validation → nutritional analysis
- **Meal plan generation** — Personalized plans respecting cuisine, diet type, allergies, macros
- **Chat assistant** — Context-aware nutrition advice
- **Text food analysis** — Quick nutrition lookup by food name

> All AI calls hit real Mistral API endpoints — no mock data or hardcoded responses.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v3, Framer Motion |
| **State** | React Query (TanStack Query), React Context |
| **Routing** | React Router v7 |
| **Backend** | InsForge (PostgreSQL, Auth, Storage, Edge Functions) |
| **AI** | Mistral AI via InsForge Edge Functions |
| **Auth** | InsForge Auth — email/password, Google, GitHub |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Chart.js + react-chartjs-2, Recharts |
| **Icons** | Lucide React, React Icons |
| **HTTP** | Axios |
| **Deployment** | InsForge Deployments (Subhosting) |

---

## 📁 Project Structure

```
src/
├── lib/
│   └── insforge.js              # InsForge SDK client config
├── services/                     # API service modules
│   ├── authService.js            # Auth operations
│   ├── nutritionService.js       # Food scanning & analysis
│   ├── mealService.js            # Meal plan CRUD
│   ├── healthService.js          # Health tracking
│   ├── groceryService.js         # Grocery lists
│   └── adminService.js           # Admin operations
├── context/
│   └── AuthContext.jsx           # Auth state management
├── hooks/                        # Custom React hooks
│   └── useAuth.js
├── components/
│   ├── common/                   # Reusable UI (Button, Card, Modal, etc.)
│   ├── layout/                   # Navbar, Sidebar, MainLayout
│   ├── nutrition/                # Nutrition-specific components
│   └── camera/                   # WebRTC camera viewfinder
├── pages/
│   ├── public/                   # Landing, Login, Register, ForgotPassword
│   ├── user/                     # Dashboard, FoodScanner, AIPlanner, WeeklyPlanner,
│   │                             # Chat, HealthTracking, GroceryList, Profile
│   └── admin/                    # Admin Dashboard, Users, Food Database
└── styles/                       # Tailwind + custom glassmorphism theme

edge-functions/                   # InsForge Deno edge functions
├── analyze-image.ts              # Food image + text analysis (Mistral OCR + LLM)
├── generate-meal-plan.ts         # Meal plan generation (Mistral)
├── ai-chat.ts                    # AI chat assistant (Mistral)
├── analyze-food.ts               # Text-only food analysis
├── delete-account.ts             # Account deletion
└── update-user-role.ts           # Admin role management

migrations/                       # SQL migrations
├── 20260715124232_create-profiles.sql
├── 20260715124320_create-weekly-plans.sql
├── 20260715124325_create-health-logs.sql
├── 20260715124330_create-grocery-lists.sql
├── 20260715124335_create-nutrition-analyses.sql
├── 20260715124340_create-food-database.sql
├── 20260715124447_create-meal-plans-v3.sql
└── 20260718133425_expand-profiles.sql
```

---

## 🗄️ Database

7 tables with Row-Level Security (RLS):

| Table | Description |
|-------|-------------|
| `profiles` | User profiles extending `auth.users` |
| `meal_plans` | Daily AI-generated meal plans |
| `weekly_plans` | 7-day weekly meal schedules |
| `health_logs` | Daily health metrics (weight, water, steps, sleep, mood) |
| `grocery_lists` | Shopping lists with check-off items |
| `nutrition_analyses` | History of AI food analyses |
| `food_database` | Admin-managed food reference data |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **InsForge CLI** (`npx @insforge/cli`)
- **InsForge project** (create at [insforge.dev](https://insforge.dev))

### Setup

```bash
# 1. Clone & install
git clone https://github.com/FurqanRaza4343/Diet_with_AI.git
cd Diet_with_AI
npm install

# 2. Link to your InsForge project
npx @insforge/cli link

# 3. Apply database migrations
npx @insforge/cli db migrations up --all

# 4. Set up Mistral AI key
npx @insforge/cli secrets set MISTRAL_API_KEY your_mistral_key_here

# 5. Create storage bucket for food images
npx @insforge/cli storage create-bucket food-images --public

# 6. Create .env file (see below) and start dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_INSFORGE_URL=https://your-project.region.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key
```

Find these values with:
```bash
npx @insforge/cli secrets get INSFORGE_BASE_URL
npx @insforge/cli secrets get ANON_KEY
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

### Deploy

```bash
# Deploy edge functions
npx @insforge/cli functions deploy analyze-image --file edge-functions/analyze-image.ts
npx @insforge/cli functions deploy generate-meal-plan --file edge-functions/generate-meal-plan.ts
npx @insforge/cli functions deploy ai-chat --file edge-functions/ai-chat.ts
npx @insforge/cli functions deploy analyze-food --file edge-functions/analyze-food.ts
npx @insforge/cli functions deploy delete-account --file edge-functions/delete-account.ts
npx @insforge/cli functions deploy update-user-role --file edge-functions/update-user-role.ts

# Deploy frontend
npx @insforge/cli deployments deploy
```

---

## 🔐 Auth & OAuth

- **Email/Password** — Built-in, configurable password policy
- **Google OAuth** — Configured via InsForge Dashboard (enable in Auth → Providers → Google)
- **GitHub OAuth** — Configured via InsForge Dashboard
- All sessions managed with httpOnly refresh cookies + CSRF tokens

---

## 🌐 Deployment

VitaAI is deployed on **InsForge Subhosting** at:
- **Custom domain:** `https://vita-ai.insforge.site`
- **Default domain:** `https://pgsu6gg6.insforge.site`

Deployment config is in `insforge.toml`:

```toml
[deployments]
subdomain = "vita-ai"

[auth]
allowed_redirect_urls = ["https://vita-ai.insforge.site/auth/callback"]
require_email_verification = false
```

---

## 🧪 Features in Detail

### 🤖 AI Meal Planner
- Step-by-step wizard: Goal → Dietary Preferences → Meal Preferences
- Diet types: Balanced, Keto, Paleo, Vegan, Vegetarian, Mediterranean, Low-Carb, High-Protein, DASH, Diabetic-Friendly
- Cuisines: Italian, Mexican, Chinese, Japanese, Korean, Thai, Indian, Pakistani, American, Mediterranean, Middle Eastern, French, Spanish, African, Caribbean
- Activity levels, cooking time preference, excluded ingredients
- Detailed meal cards with macros, prep time, cooking instructions, and ingredient quantities

### 📷 Smart Food Scanner
- Live WebRTC camera viewfinder with flip
- Image upload with drag-and-drop
- Text fallback (type food name manually)
- AI detects whether image contains food (rejects non-food images)
- Returns: food name, calories, protein, carbs, fat, fiber, sugar, health score, ingredients, warnings, recommendations, voice summary
- Full scan history

### 📊 Health Tracking
- Log weight, water intake, calories, steps, sleep hours, mood
- Visual charts for progress tracking
- Daily summary with macro breakdown

### 🛒 Grocery Lists
- Auto-generated from weekly meal plans
- Categorized items with quantities
- Check-off and manage items

### 💬 AI Chat Assistant
- Floating chatbot (bottom-right corner)
- Nutrition advice, meal suggestions, general health tips
- Voice-enabled (speech recognition + TTS)

---

## 👨‍💻 Admin Panel

Restricted to users with `admin` role:
- **Dashboard** — Platform statistics
- **User Management** — View, search, manage user accounts
- **Food Database** — CRUD operations on reference food data

---

## 📄 License

This project is built for the Diet with AI platform. All rights reserved.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR for any improvements.

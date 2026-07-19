export const APP_NAME = 'DietAI';
export const APP_TAGLINE = 'Your Intelligent AI Diet Companion';

export const API = {
  INS_FORGE_URL: import.meta.env.VITE_INSFORGE_URL,
  INS_FORGE_ANON_KEY: import.meta.env.VITE_INSFORGE_ANON_KEY,
};

export const GOALS = [
  { value: 'lose-weight', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain-muscle', label: 'Gain Muscle' },
  { value: 'improve-health', label: 'Improve Health' },
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'active', label: 'Very Active' },
  { value: 'extra', label: 'Extra Active' },
];

export const BUDGETS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const MOODS = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'okay', label: '😐 Okay' },
  { value: 'stressed', label: '😰 Stressed' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'energetic', label: '⚡ Energetic' },
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ur', label: 'Urdu', flag: '🇵🇰' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
];

export const MEAL_CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export const FOOD_CATEGORIES = [
  'fruits', 'vegetables', 'grains', 'protein', 'dairy',
  'fats', 'snacks', 'beverages', 'spices', 'other',
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  NUTRITION: '/nutrition',
  PROFILE: '/profile',
  WEEKLY_PLANNER: '/weekly-planner',
  GROCERY: '/grocery',
  HEALTH_TRACKER: '/health-tracker',
  MEAL_HISTORY: '/meal-history',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_FOOD_DATABASE: '/admin/food-database',
};

export const ITEMS_PER_PAGE = 10;

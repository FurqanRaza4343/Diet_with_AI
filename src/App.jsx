import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import './App.css';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import OAuthCallbackPage from './pages/public/OAuthCallbackPage';

import DashboardPage from './pages/user/DashboardPage';
import ProfilePage from './pages/user/ProfilePage';
import NutritionPage from './pages/user/NutritionPage';
import AIPlannerPage from './pages/user/AIPlannerPage';
import FoodScannerPage from './pages/user/FoodScannerPage';
import ChatbotPage from './pages/user/ChatbotPage';
import WeeklyMealPlannerPage from './pages/user/WeeklyMealPlannerPage';
import GroceryListPage from './pages/user/GroceryListPage';
import HealthTrackerPage from './pages/user/HealthTrackerPage';
import MealHistoryPage from './pages/user/MealHistoryPage';
import SettingsPage from './pages/user/SettingsPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import FoodDatabasePage from './pages/admin/FoodDatabasePage';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/ai-planner" element={<AIPlannerPage />} />
                <Route path="/food-scanner" element={<FoodScannerPage />} />
                <Route path="/chat" element={<ChatbotPage />} />
                <Route path="/weekly-planner" element={<WeeklyMealPlannerPage />} />
                <Route path="/grocery" element={<GroceryListPage />} />
                <Route path="/health-tracker" element={<HealthTrackerPage />} />
                <Route path="/meal-history" element={<MealHistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/food-database" element={<FoodDatabasePage />} />
              </Route>
            </Route>
          </Routes>
        </AnimatePresence>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;

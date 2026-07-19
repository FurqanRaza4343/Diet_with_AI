import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { mealService } from '../../services/mealService';
import { healthService } from '../../services/healthService';
import client from '../../lib/insforge';
import { Bot, Calendar, ShoppingCart, Heart, Activity, Apple, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ mealPlans: 0, healthLogs: 0, groceryLists: 0 });
  const [loading, setLoading] = useState(true);
  const [weightData, setWeightData] = useState([]);
  const [todayCalories, setTodayCalories] = useState({ current: 0, target: 2200 });
  const [macros, setMacros] = useState({ protein: { current: 0, target: 120 }, carbs: { current: 0, target: 250 }, fats: { current: 0, target: 65 } });
  const [streak, setStreak] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mealPlans, healthLogs, groceryRes] = await Promise.all([
          mealService.getMealPlans({ limit: 100 }),
          healthService.getHealthLogs({ limit: 30 }),
          client.database.from('grocery_lists').select('*', { count: 'exact', head: true }),
        ]);
        setStats({
          mealPlans: mealPlans.data?.length || 0,
          healthLogs: healthLogs.data?.length || 0,
          groceryLists: groceryRes.count || 0,
        });

        const logs = healthLogs.data || [];
        if (logs.length > 0) {
          const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
          setWeightData(sorted.map(log => ({
            date: new Date(log.date).toLocaleDateString(),
            weight: log.weight || 0,
          })));

          const today = new Date().toISOString().split('T')[0];
          const todayLog = logs.find(l => l.date === today);
          if (todayLog) {
            setTodayCalories(prev => ({ ...prev, current: todayLog.calories || 0 }));
            const cal = todayLog.calories || 0;
            setMacros({
              protein: { current: Math.round(cal * 0.3 / 4), target: 120 },
              carbs: { current: Math.round(cal * 0.5 / 4), target: 250 },
              fats: { current: Math.round(cal * 0.2 / 9), target: 65 },
            });
          }

          const uniqueDates = [...new Set(logs.filter(l => l.weight).map(l => l.date))].sort().reverse();
          let streakCount = 0;
          const todayStr = new Date().toISOString().split('T')[0];
          if (uniqueDates.includes(todayStr)) {
            streakCount = 1;
            for (let i = 1; i < 30; i++) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const ds = d.toISOString().split('T')[0];
              if (uniqueDates.includes(ds)) streakCount++;
              else break;
            }
          }
          setStreak(streakCount);
        }

        const allMeals = mealPlans.data || [];
        const allLists = groceryRes.data || [];
        const activity = [];
        if (allMeals.length > 0) {
          const latest = allMeals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          activity.push({ icon: '🍽️', text: `Generated meal plan (${latest.meals?.length || 0} meals)`, time: timeAgo(latest.created_at) });
        }
        if (logs.length > 0) {
          const latest = logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          activity.push({ icon: '📊', text: `Logged health data (${latest.weight || 0} kg)`, time: timeAgo(latest.created_at) });
        }
        setRecentActivity(activity.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard data. Check your connection and try again.');
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const quickActions = [
    { title: 'AI Diet Planner', icon: Bot, path: '/ai-planner', color: 'bg-primary-100 text-primary-700' },
    { title: 'Weekly Planner', icon: Calendar, path: '/weekly-planner', color: 'bg-purple-100 text-purple-700' },
    { title: 'Grocery List', icon: ShoppingCart, path: '/grocery', color: 'bg-amber-100 text-amber-700' },
    { title: 'Health Tracker', icon: Heart, path: '/health-tracker', color: 'bg-rose-100 text-rose-700' },
  ];

  const statsCards = [
    { label: 'Meal Plans', value: stats.mealPlans, icon: Apple },
    { label: 'Health Logs', value: stats.healthLogs, icon: Activity },
    { label: 'Grocery Lists', value: stats.groceryLists, icon: ShoppingCart },
  ];

  const kcalPct = todayCalories.target > 0 ? Math.min(100, (todayCalories.current / todayCalories.target) * 100) : 0;
  const circumference = 2 * Math.PI * 42;

  const macroBars = [
    { name: 'Protein', current: macros.protein.current, target: macros.protein.target, color: '#22c55e' },
    { name: 'Carbs', current: macros.carbs.current, target: macros.carbs.target, color: '#f59e0b' },
    { name: 'Fats', current: macros.fats.current, target: macros.fats.target, color: '#3b82f6' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Welcome back, {user?.name || 'User'}</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Here's your health overview</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-2 text-sm font-medium text-primary-700">
            <TrendingUp size={16} />
            {streak}-day streak
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">Daily Progress</h3>
              <span className="text-sm text-on-surface-variant">Today</span>
            </div>
            {todayCalories.current === 0 && !loading ? (
              <p className="text-on-surface-variant text-sm py-4 text-center">No data logged today. <Link to="/health-tracker" className="text-primary-600 hover:underline">Add a health log</Link></p>
            ) : (
              <div className="flex items-center gap-8">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1edee" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="8"
                      strokeDasharray={`${(kcalPct / 100) * circumference} ${circumference}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-on-surface">{todayCalories.current.toLocaleString()}</span>
                    <span className="text-xs text-on-surface-variant">/ {todayCalories.target.toLocaleString()} kcal</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {macroBars.map((m) => (
                    <div key={m.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-on-surface font-medium">{m.name}</span>
                        <span className="text-on-surface-variant">{m.current}/{m.target}g</span>
                      </div>
                      <div className="h-2 bg-[#f1edee] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%`, background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {statsCards.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e5e1e3] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                  <p className="text-2xl font-bold text-on-surface mt-0.5">{loading ? '...' : stat.value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                  <stat.icon className="text-primary-600" size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {weightData.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-8">
          <h3 className="font-semibold text-on-surface mb-4">Weight Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1edee" />
                <XAxis dataKey="date" stroke="#77767d" fontSize={12} />
                <YAxis stroke="#77767d" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e1e3', borderRadius: '12px', color: '#1c1b1c' }} />
                <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path}
              className="bg-white rounded-2xl border border-[#e5e1e3] p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
                <action.icon size={22} />
              </div>
              <p className="text-sm font-medium text-on-surface">{action.title}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
        <h3 className="font-semibold text-on-surface mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center py-4">No activity yet. Start by generating a meal plan or logging health data!</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#f6f3f4] rounded-xl">
                <div className="flex items-center gap-3">
                  <span>{activity.icon}</span>
                  <span className="text-sm text-on-surface">{activity.text}</span>
                </div>
                <span className="text-xs text-on-surface-variant">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

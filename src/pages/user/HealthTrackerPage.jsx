import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { healthService } from '../../services/healthService';
import client from '../../lib/insforge';
import toast from 'react-hot-toast';
import { FaWeight, FaTint, FaFire, FaWalking, FaPlus, FaChartLine, FaBullseye, FaCalculator } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HealthTrackerPage = () => {
  const { user, setUser } = useAuth();
  const [healthLogs, setHealthLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [weightGoal, setWeightGoal] = useState(user?.weight_goal || user?.weightGoal || 70);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [formData, setFormData] = useState({
    weight: '', waterIntake: '', calories: '', steps: '', sleepHours: '', mood: 'happy',
  });

  useEffect(() => { fetchHealthData(); }, []);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const [logsResponse, statsResponse] = await Promise.all([
        healthService.getHealthLogs({ limit: 30 }),
        healthService.getHealthStats({ days: 30 }),
      ]);
      if (logsResponse.success) setHealthLogs(logsResponse.data || []);
      if (statsResponse.success) setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast.error('Failed to fetch health data');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await healthService.createHealthLog({
        weight: parseFloat(formData.weight),
        waterIntake: parseFloat(formData.waterIntake),
        calories: parseInt(formData.calories),
        steps: parseInt(formData.steps),
        sleepHours: parseFloat(formData.sleepHours),
        mood: formData.mood,
      });
      if (response.success) {
        toast.success('Health log added!');
        setFormData({ weight: '', waterIntake: '', calories: '', steps: '', sleepHours: '', mood: 'happy' });
        setShowForm(false);
        fetchHealthData();
      }
    } catch (error) {
      toast.error('Failed to add health log');
    }
  };

  const statsCards = stats ? [
    { label: 'Avg Weight', value: `${stats.avgWeight || 0} kg`, icon: FaWeight, color: 'text-primary-600' },
    { label: 'Avg Water', value: `${stats.avgWaterIntake || 0} L`, icon: FaTint, color: 'text-blue-600' },
    { label: 'Avg Calories', value: `${stats.avgCalories || 0} kcal`, icon: FaFire, color: 'text-amber-600' },
    { label: 'Avg Steps', value: `${stats.avgSteps || 0}`, icon: FaWalking, color: 'text-green-600' },
  ] : [];

  const chartData = healthLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    weight: log.weight || 0,
    waterIntake: log.water_intake || 0,
    calories: log.calories || 0,
  })).reverse();

  const latestWeight = healthLogs[0]?.weight;
  const bmi = latestWeight && user?.height ? (latestWeight / ((user.height / 100) ** 2)).toFixed(1) : null;
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Health Analytics</h1>
            <p className="text-on-surface-variant text-sm mt-1">Monitor your BMI, weight, water, and progress</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FaPlus /> Add Log
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Add Health Log</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Weight (kg)</label>
                <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="72" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Water Intake (L)</label>
                <input type="number" value={formData.waterIntake} onChange={(e) => setFormData({ ...formData, waterIntake: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="2.5" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Calories</label>
                <input type="number" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="2000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Steps</label>
                <input type="number" value={formData.steps} onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="8000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Sleep Hours</label>
                <input type="number" value={formData.sleepHours} onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="8" step="0.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Mood</label>
                <select value={formData.mood} onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                  <option value="happy">😊 Happy</option>
                  <option value="okay">😐 Okay</option>
                  <option value="stressed">😰 Stressed</option>
                  <option value="tired">😴 Tired</option>
                  <option value="energetic">⚡ Energetic</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Save Log</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.length > 0 ? (
            statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl border border-[#e5e1e3] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-on-surface-variant text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="text-xl" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-on-surface-variant">
              {loading ? 'Loading stats...' : 'No health data available. Add your first log!'}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {bmi && (
            <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
              <div className="flex items-center gap-2 mb-3">
                <FaCalculator className="text-primary-600" />
                <h3 className="font-semibold text-on-surface">BMI Calculator</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-on-surface">{bmi}</div>
                <div className={`text-sm font-medium ${bmiColor}`}>{bmiCategory}</div>
                <div className="mt-3 h-2 bg-[#f1edee] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-amber-500 to-red-500"
                    style={{ width: `${Math.min(100, ((bmi - 10) / 30) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaBullseye className="text-primary-600" />
                <h3 className="font-semibold text-on-surface">Weight Goal</h3>
              </div>
              <button onClick={() => setShowGoalInput(!showGoalInput)} className="text-xs text-primary-600 hover:text-primary-700">Edit</button>
            </div>
            {showGoalInput ? (
              <div className="flex gap-2">
                <input type="number" value={weightGoal} onChange={(e) => setWeightGoal(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-sm text-on-surface outline-none" step="0.1" />
                <button onClick={async () => {
                  setShowGoalInput(false);
                  try {
                    await client.database.from('profiles').update({ weight_goal: parseFloat(weightGoal) }).eq('id', user.id);
                    if (setUser) setUser({ ...user, weight_goal: parseFloat(weightGoal) });
                    toast.success('Weight goal updated!');
                  } catch { toast.error('Failed to save goal'); }
                }} className="bg-primary-600 text-white px-3 py-2 rounded-xl text-sm">Save</button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-on-surface">{weightGoal} kg</div>
                {latestWeight && (
                  <p className={`text-sm mt-1 ${latestWeight <= weightGoal ? 'text-green-600' : 'text-amber-600'}`}>
                    {latestWeight <= weightGoal ? '✓ On track!' : `${(latestWeight - weightGoal).toFixed(1)} kg to go`}
                  </p>
                )}
              </div>
            )}
          </div>

          {stats && (
            <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
              <div className="flex items-center gap-2 mb-3">
                <FaChartLine className="text-primary-600" />
                <h3 className="font-semibold text-on-surface">Quick Summary</h3>
              </div>
              <div className="space-y-3">
                <div><span className="text-sm text-on-surface-variant">Sleep</span><p className="font-semibold text-on-surface">{stats.avgSleepHours?.toFixed(1) || 0}h avg</p></div>
                <div className="h-px bg-[#e5e1e3]" />
                <div><span className="text-sm text-on-surface-variant">Logs this month</span><p className="font-semibold text-on-surface">{stats.totalLogs || 0} entries</p></div>
                <div className="h-px bg-[#e5e1e3]" />
                <div><span className="text-sm text-on-surface-variant">Water</span><p className="font-semibold text-on-surface">{stats.avgWaterIntake?.toFixed(1) || 0}L avg</p></div>
              </div>
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-8">
            <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <FaChartLine className="text-primary-600" /> Weight Progress
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Logs</h3>
          {healthLogs.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">No health logs yet. Start tracking your health today!</div>
          ) : (
            <div className="space-y-3">
              {healthLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-[#f6f3f4] rounded-xl">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-on-surface-variant">{new Date(log.date).toLocaleDateString()}</span>
                    {log.weight && <span className="text-sm text-on-surface">⚖️ {log.weight} kg</span>}
                    {log.waterIntake && <span className="text-sm text-on-surface">💧 {log.waterIntake} L</span>}
                    {log.calories && <span className="text-sm text-on-surface">🔥 {log.calories} kcal</span>}
                    {log.steps && <span className="text-sm text-on-surface">👣 {log.steps} steps</span>}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    log.mood === 'happy' ? 'bg-green-100 text-green-700' :
                    log.mood === 'stressed' ? 'bg-red-100 text-red-700' :
                    log.mood === 'tired' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{log.mood}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthTrackerPage;

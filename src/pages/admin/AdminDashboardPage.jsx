import React, { useState, useEffect } from 'react';
import client from '../../lib/insforge';
import { FaUsers, FaUtensils, FaChartBar } from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalMealPlans: 0, totalWeeklyPlans: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: totalUsers } = await client.database.from('profiles').select('*', { count: 'exact', head: true });
        const { count: totalMealPlans } = await client.database.from('meal_plans').select('*', { count: 'exact', head: true });
        const { count: totalWeeklyPlans } = await client.database.from('weekly_plans').select('*', { count: 'exact', head: true });
        const { data: profiles } = await client.database.from('profiles').select('id, name, created_at').limit(10).order('created_at', { ascending: false });
        setStats({ totalUsers: totalUsers || 0, totalMealPlans: totalMealPlans || 0, totalWeeklyPlans: totalWeeklyPlans || 0 });
        const { data: { users: authUsers } } = await client.auth.admin.listUsers();
        const enriched = (profiles || []).map(p => {
          const au = (authUsers || []).find(u => u.id === p.id);
          return { ...p, email: au?.email || '', role: au?.user_metadata?.role || 'user', createdAt: p.created_at };
        });
        setUsers(enriched);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-primary-600' },
    { label: 'Meal Plans', value: stats.totalMealPlans, icon: FaUtensils, color: 'text-blue-600' },
    { label: 'Weekly Plans', value: stats.totalWeeklyPlans, icon: FaChartBar, color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#e5e1e3] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-on-surface-variant text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-on-surface mt-1">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-on-surface-variant text-sm border-b border-[#e5e1e3]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#e5e1e3] last:border-0">
                    <td className="py-3 text-on-surface">{u.name || '—'}</td>
                    <td className="py-3 text-on-surface-variant">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>{u.role}</span>
                    </td>
                    <td className="py-3 text-on-surface-variant text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8 text-on-surface-variant">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

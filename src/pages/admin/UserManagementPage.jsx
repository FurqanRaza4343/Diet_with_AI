import React, { useState, useEffect } from 'react';
import client from '../../lib/insforge';
import toast from 'react-hot-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await client.database.from('profiles').select('id, name, created_at').order('created_at', { ascending: false });
      const { data: { users: authUsers } } = await client.auth.admin.listUsers();
      const enriched = (profiles || []).map(p => {
        const au = (authUsers || []).find(u => u.id === p.id);
        return { id: p.id, name: p.name || au?.user_metadata?.full_name || '', email: au?.email || '', role: au?.user_metadata?.role || 'user', createdAt: p.created_at, lastSignIn: au?.last_sign_in_at };
      });
      setUsers(enriched);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await client.auth.admin.updateUserById(userId, { user_metadata: { role: newRole } });
      if (error) throw error;
      const { error: profileError } = await client.database.from('profiles').update({ role: newRole }).eq('id', userId);
      if (profileError) throw profileError;
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-8">User Management</h1>
        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-on-surface-variant text-sm border-b border-[#e5e1e3]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">No users found</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-[#e5e1e3] last:border-0">
                      <td className="py-3 text-on-surface">{u.name || '—'}</td>
                      <td className="py-3 text-on-surface-variant">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>{u.role}</span>
                      </td>
                      <td className="py-3 text-on-surface-variant text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-center">
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="px-2 py-1.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-sm text-on-surface outline-none">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;

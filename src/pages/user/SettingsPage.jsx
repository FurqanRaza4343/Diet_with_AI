import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import client from '../../lib/insforge';
import toast from 'react-hot-toast';
import { FaLock, FaGlobe, FaSignOutAlt } from 'react-icons/fa';

const SettingsPage = () => {
  const { user, setUser, logout } = useAuth();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [settings, setSettings] = useState({
    language: user?.language || 'en',
    notifications: user?.notifications ?? true,
    emailUpdates: user?.email_updates ?? true,
  });

  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!window.confirm('All your meal plans, health logs, grocery lists, and nutrition scans will be permanently deleted. Continue?')) return;
    setDeletingAccount(true);
    try {
      const { data, error } = await client.functions.invoke('delete-account', { body: {} });
      if (error) throw error;
      toast.success('Account deleted successfully');
      logout();
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-8">Settings</h1>

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <FaLock className="text-primary-600" /> Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Current Password</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="Enter current password" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">New Password</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="Enter new password (min 6 chars)" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Confirm New Password</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="Confirm new password" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <FaLock /> {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <FaGlobe className="text-primary-600" /> Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface">Language</p>
                <p className="text-sm text-on-surface-variant">Select your preferred language</p>
              </div>
              <select name="language" value={settings.language} onChange={async (e) => {
                const val = e.target.value;
                setSettings(prev => ({ ...prev, language: val }));
                setSavingSettings(true);
                try {
                  await client.database.from('profiles').update({ language: val }).eq('id', user.id);
                  if (setUser) setUser({ ...user, language: val });
                } catch { toast.error('Failed to update language'); }
                setSavingSettings(false);
              }} className="w-[200px] px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="fr">🇫🇷 French</option>
                <option value="de">🇩🇪 German</option>
                <option value="hi">🇮🇳 Hindi</option>
                <option value="ur">🇵🇰 Urdu</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface">Push Notifications</p>
                <p className="text-sm text-on-surface-variant">Receive notifications on your device</p>
              </div>
              <button onClick={async () => {
                const val = !settings.notifications;
                setSettings(prev => ({ ...prev, notifications: val }));
                try {
                  await client.database.from('profiles').update({ notifications: val }).eq('id', user.id);
                  if (setUser) setUser({ ...user, notifications: val });
                } catch { toast.error('Failed to update notifications'); }
              }} className={`w-11 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-primary-500' : 'bg-[#e5e1e3]'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${settings.notifications ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface">Email Updates</p>
                <p className="text-sm text-on-surface-variant">Receive updates via email</p>
              </div>
              <button onClick={async () => {
                const val = !settings.emailUpdates;
                setSettings(prev => ({ ...prev, emailUpdates: val }));
                try {
                  await client.database.from('profiles').update({ email_updates: val }).eq('id', user.id);
                  if (setUser) setUser({ ...user, email_updates: val });
                } catch { toast.error('Failed to update email preferences'); }
              }} className={`w-11 h-6 rounded-full transition-colors relative ${settings.emailUpdates ? 'bg-primary-500' : 'bg-[#e5e1e3]'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${settings.emailUpdates ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <FaSignOutAlt className="text-primary-600" /> Account
          </h3>
          <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center justify-center gap-2">
            <FaSignOutAlt /> Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">⚠️ Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-on-surface">Delete Account</p>
              <p className="text-sm text-on-surface-variant">Permanently delete your account and all data</p>
            </div>
            <button onClick={handleDeleteAccount} disabled={deletingAccount} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">{deletingAccount ? 'Deleting...' : 'Delete Account'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

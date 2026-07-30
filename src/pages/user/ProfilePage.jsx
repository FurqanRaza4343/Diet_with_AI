import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaCalendar, FaVenus, FaRuler, FaWeight, FaSave } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', age: '', gender: '', height: '', weight: '',
    activityLevel: '', dietaryPreferences: [], allergies: [], fitnessGoals: '', budget: '', waterGoal: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', email: user.email || '', age: user.age || '', gender: user.gender || '',
        height: user.height || '', weight: user.weight || '', activityLevel: user.activityLevel || '',
        dietaryPreferences: user.dietaryPreferences || [], allergies: user.allergies || [],
        fitnessGoals: user.fitnessGoals || '', budget: user.budget || '', waterGoal: user.waterGoal || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleArrayChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value.split(',').map(item => item.trim()).filter(Boolean) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.updateProfile(formData);
      if (response.success) { setUser(response.user); toast.success('Profile updated successfully!'); }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-8">Profile Settings</h1>

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="email" value={formData.email} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface opacity-60 cursor-not-allowed" disabled />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Age</label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="30" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Gender</label>
                <div className="relative">
                  <FaVenus className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Height (cm)</label>
                <div className="relative">
                  <FaRuler className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="175" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Weight (kg)</label>
                <div className="relative">
                  <FaWeight className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="72" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Very Active</option>
                  <option value="extra">Extra Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Fitness Goal</label>
                <select name="fitnessGoals" value={formData.fitnessGoals} onChange={handleChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                  <option value="">Select goal</option>
                  <option value="lose-weight">Lose Weight</option>
                  <option value="maintain-weight">Maintain Weight</option>
                  <option value="gain-muscle">Gain Muscle</option>
                  <option value="improve-health">Improve Health</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Budget</label>
                <select name="budget" value={formData.budget} onChange={handleChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                  <option value="">Select budget</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Water Goal (ml)</label>
                <input type="number" name="waterGoal" value={formData.waterGoal} onChange={handleChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="2000" />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Dietary Preferences</label>
                <input type="text" name="dietaryPreferences" value={formData.dietaryPreferences.join(', ')} onChange={handleArrayChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="vegetarian, vegan, keto" />
                <p className="text-xs text-on-surface-variant mt-1">Separate with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Allergies</label>
                <input type="text" name="allergies" value={formData.allergies.join(', ')} onChange={handleArrayChange} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="nuts, dairy, gluten" />
                <p className="text-xs text-on-surface-variant mt-1">Separate with commas</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

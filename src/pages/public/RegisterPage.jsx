import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Leaf } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.register({
        name: formData.name, email: formData.email, password: formData.password,
      });
      if (response.success) {
        if (response.message) {
          toast.success(response.message);
          navigate('/login');
        } else if (response.token && response.user) {
          login(response.token, response.user);
          toast.success('Registration successful!');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      toast.error(error.message || 'Google login failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#fcf8fa]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf className="text-primary-600" size={28} />
              <span className="font-bold text-2xl text-on-surface">DietAI</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Create Account</h2>
            <p className="text-on-surface-variant mt-1">Start your health journey today</p>
          </div>

          <button onClick={handleGoogleLogin} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e5e1e3] rounded-xl text-sm font-medium text-on-surface hover:bg-[#f6f3f4] transition-all duration-300 disabled:opacity-60"
          >
            <FcGoogle className="text-2xl" />
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#e5e1e3]" />
            <span className="text-xs text-on-surface-variant">OR</span>
            <div className="flex-1 h-px bg-[#e5e1e3]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="input pl-10" placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="input pl-10" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  className="input pl-10" placeholder="Minimum 6 characters" required minLength={6} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className="input pl-10" placeholder="Confirm your password" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <FaUserPlus /> {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

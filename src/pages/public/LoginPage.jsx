import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Leaf } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        if (response.token && response.user) {
          login(response.token, response.user);
          toast.success('Login successful!');
          navigate('/dashboard');
        } else {
          toast.success('Verification email sent. Check your inbox.');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#fcf8fa]">
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
            <h2 className="text-2xl font-bold text-on-surface">Welcome Back</h2>
            <p className="text-on-surface-variant mt-1">Sign in to continue your health journey</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
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
              <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10" placeholder="••••••••" required />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-on-surface-variant">
                <input type="checkbox" className="accent-primary-600" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <FaSignInAlt /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Create one now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-aura fixed inset-0 -z-20"></div>
      <div className="orb" style={{ background: '#4ade80', width: '400px', height: '400px', top: '-100px', right: '-100px' }}></div>
      <div className="dot-grid"></div>

      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <i className="fas fa-leaf text-primary-400 text-3xl"></i>
            <span className="font-bold text-2xl gradient-text">DietAI</span>
          </div>
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="text-text-muted mt-1">
            {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-3xl text-success" />
            </div>
            <p className="text-text-secondary mb-4">
              We've sent a password reset link to <strong className="text-primary-400">{email}</strong>
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <FaPaperPlane /> {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
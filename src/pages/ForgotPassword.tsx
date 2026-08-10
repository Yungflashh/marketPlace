import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Mail, Shield, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset code sent — check your email');
      navigate('/reset-password', { state: { email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <Link to="/" className="flex items-center justify-center gap-2.5 text-gray-900 dark:text-gray-100 mb-8">
            <Logo size={20} />
            <span className="text-[17px] font-semibold tracking-tight">ShopLogs</span>
          </Link>

          <div className="text-center mb-7">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Forgot your password?</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email and we'll send a reset code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send reset code</span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500">Remember your password?</span>
            </div>
          </div>

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline">
              Back to sign in
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

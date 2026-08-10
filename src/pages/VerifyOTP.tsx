import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Mail, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';
import Logo from '../components/Logo';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const email = Cookies.get('email');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter your OTP');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('Email verified!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found, please register again.');
      navigate('/register');
      return;
    }
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2.5 text-gray-900 dark:text-gray-100 mb-8">
            <Logo size={20} />
            <span className="text-[17px] font-semibold tracking-tight">ShopLogs</span>
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Check your inbox</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{email || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-xl tracking-[0.5em] font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-200 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify email</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resending}
                className="font-medium text-gray-900 dark:text-gray-100 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 border-t-gray-700 rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend</span>
                  </>
                )}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600"
            >
              Wrong email? Register again
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

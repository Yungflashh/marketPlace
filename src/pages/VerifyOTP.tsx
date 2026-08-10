import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Mail, RotateCcw, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';
import Logo from '../components/Logo';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState<string>(() => Cookies.get('email') ?? '');
  const navigate = useNavigate();

  const persistEmail = (value: string) => {
    setEmail(value);
    if (value) Cookies.set('email', value, { expires: 1 });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter the email you signed up with');
      return;
    }
    if (!otp.trim()) {
      toast.error('Please enter your verification code');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: email.trim().toLowerCase(), otp });
      toast.success('Email verified!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Enter your email above first');
      return;
    }
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email: email.trim().toLowerCase() });
      toast.success('A new code has been sent.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Verify your email</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the 6-digit code we sent to your inbox.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => persistEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
              />
            </div>

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
                className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-xl tracking-[0.5em] font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-200 bg-white dark:bg-gray-800 focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
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
                type="button"
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
              to="/login"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              Already verified? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

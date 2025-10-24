import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, Lock, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
//   const location = useLocation();

  // get email from route state (passed after register)
  const email = Cookies.get("email");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error('Please enter your OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://marketplc-be.onrender.com/api/auth/verify-otp', { email, otp });
      toast.success('Email verified successfully!');
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
      await axios.post('https://marketplc-be.onrender.com/api/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            We’ve sent a 6-digit code to <span className="font-semibold text-indigo-600">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-gray-700 text-center tracking-widest text-lg"
              />
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Verify Email</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Didn’t receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1"
            >
              {resending ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Resend OTP</span>
                </>
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

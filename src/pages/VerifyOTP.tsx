import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Mail, RotateCcw, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { Button } from '../components/ui';

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
      await api.post('/auth/verify-otp', { email, otp });
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
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotlight flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[380px] text-center">
        <div className="mx-auto w-12 h-12 bg-gold rounded-xl flex items-center justify-center mb-6">
          <Mail className="w-5 h-5 text-canvas" />
        </div>
        <h1 className="font-display text-[28px] font-medium text-ink tracking-tight">Verify your email</h1>
        <p className="text-[15px] text-ink-faint mt-2 mb-9">
          We've sent a 6-digit code to <span className="text-ink font-medium">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="000000"
            className="w-full h-16 rounded-lg border border-hairline-strong bg-surface focus:border-gold focus:ring-2 focus:ring-gold/25 outline-none text-ink text-center tracking-[0.6em] text-2xl font-display transition-colors"
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? 'Verifying…' : 'Verify email'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <p className="text-sm text-ink-faint mt-7">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-gold hover:text-gold-strong transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {resending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                <span>Sending…</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </>
            )}
          </button>
        </p>

        <Link to="/login" className="block mt-6 text-sm text-ink-faint hover:text-ink transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default VerifyOTP;

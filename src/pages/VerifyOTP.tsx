import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Mail, RotateCcw, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';
import AuthCard from '../components/auth/AuthCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    <AuthCard
      icon={<Mail className="w-5 h-5" />}
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox."
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Email address</label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => persistEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Verification code</label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="000000"
            className="text-center text-[19px] tracking-[0.5em] font-semibold"
          />
        </div>

        <Button type="submit" loading={loading} fullWidth icon={<CheckCircle2 className="w-4 h-4" />}>
          {loading ? 'Verifying...' : 'Verify email'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[13px] text-ink-muted">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-ink hover:underline inline-flex items-center gap-1 disabled:opacity-50"
          >
            {resending ? (
              <>
                <div className="w-3 h-3 border-2 border-border border-t-ink-soft rounded-full animate-spin" />
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
        <Link to="/login" className="text-[12px] text-ink-muted hover:text-ink-soft transition-colors">
          Already verified? Sign in
        </Link>
      </div>
    </AuthCard>
  );
};

export default VerifyOTP;

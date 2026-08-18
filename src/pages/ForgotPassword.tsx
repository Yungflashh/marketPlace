import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Mail, ArrowRight } from 'lucide-react';
import AuthCard from '../components/auth/AuthCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset code"
      dividerText="Remember your password?"
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline">
          Back to sign in <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Email address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>

        <Button type="submit" loading={loading} fullWidth className="!mt-6">
          {loading ? 'Sending code...' : 'Send reset code'}
        </Button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;

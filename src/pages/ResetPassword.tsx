import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import AuthCard from '../components/auth/AuthCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: (location.state as any)?.email ?? '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength =
    formData.newPassword.length >= 10 ? 'strong' : formData.newPassword.length >= 6 ? 'medium' : 'weak';
  const strengthTone = passwordStrength === 'strong' ? 'bg-success' : passwordStrength === 'medium' ? 'bg-warning' : 'bg-error';
  const strengthText = passwordStrength === 'strong' ? 'text-success' : passwordStrength === 'medium' ? 'text-warning' : 'text-error';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      toast.success('Password reset successfully — please sign in');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Enter the code we emailed you and choose a new password"
      dividerText="Didn't receive a code?"
      footer={
        <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline">
          Request a new code <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Email address</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Reset code</label>
          <Input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required
            placeholder="6-digit code from your email"
            maxLength={6}
            className="tracking-[0.3em] text-center font-semibold"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">New password</label>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Minimum 6 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            rightSlot={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-ink-muted hover:text-ink-soft transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1">
                <div className={`h-0.5 flex-1 rounded-full ${strengthTone}`} />
                <div className={`h-0.5 flex-1 rounded-full ${passwordStrength !== 'weak' ? strengthTone : 'bg-border'}`} />
                <div className={`h-0.5 flex-1 rounded-full ${passwordStrength === 'strong' ? strengthTone : 'bg-border'}`} />
              </div>
              <p className={`text-[11px] mt-1 capitalize ${strengthText}`}>{passwordStrength} password</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Confirm new password</label>
          <Input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Re-enter your new password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightSlot={
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-ink-muted hover:text-ink-soft transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {formData.confirmPassword && (
            <p className={`text-[11px] mt-1 ${formData.newPassword === formData.confirmPassword ? 'text-success' : 'text-error'}`}>
              {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>

        <Button type="submit" loading={loading} fullWidth className="!mt-6">
          {loading ? 'Resetting password...' : 'Reset password'}
        </Button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Input, Button } from '../components/ui';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { name, email, password } = formData;
      await register({ name, email, password });
      toast.success('Registration successful!');
        navigate('/verify-otp', { state: { email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 6 ?
    (formData.password.length >= 10 ? 'strong' : 'medium') : 'weak';

  const strengthColor =
    passwordStrength === 'weak' ? 'bg-danger' : passwordStrength === 'medium' ? 'bg-warning' : 'bg-success';
  const strengthText =
    passwordStrength === 'weak' ? 'text-danger' : passwordStrength === 'medium' ? 'text-warning' : 'text-success';

  return (
    <div className="min-h-screen bg-spotlight flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-9">
          <Link to="/" className="w-11 h-11 rounded-xl bg-gold flex items-center justify-center font-display font-semibold text-canvas text-xl mb-6">
            S
          </Link>
          <h1 className="font-display text-[32px] font-medium text-ink tracking-tight">Create your account</h1>
          <p className="text-[15px] text-ink-faint mt-2">Join ShopLogs in under two minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            icon={<User />}
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            icon={<Mail />}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 characters"
              minLength={6}
              icon={<Lock />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-ink-faint hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1.5">
                  {[0, 1, 2].map((i) => {
                    const filled =
                      (passwordStrength === 'weak' && i === 0) ||
                      (passwordStrength === 'medium' && i <= 1) ||
                      passwordStrength === 'strong';
                    return <div key={i} className={`h-1 flex-1 rounded-full ${filled ? strengthColor : 'bg-hairline-strong'}`} />;
                  })}
                </div>
                <p className={`text-xs font-medium ${strengthText}`}>Password strength: {passwordStrength}</p>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
              icon={<CheckCircle2 />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-ink-faint hover:text-ink transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {formData.confirmPassword && (
              <p className={`text-xs mt-1.5 font-medium ${formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'}`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-canvas text-ink-faint">Already a member?</span>
          </div>
        </div>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-ink hover:text-gold font-semibold transition-colors group"
        >
          Sign in to your account
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="mt-10 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          <span>Your data is protected & encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Register;

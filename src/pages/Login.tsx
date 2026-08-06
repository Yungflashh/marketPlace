import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Cookies from 'js-cookie';
import { Input, Button } from '../components/ui';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
              // console.log(error.response.status);

              Cookies.set("email", formData.email)
              if(error.response.status===403){
                      navigate('/verify-otp');

              }

      toast.error(error.response?.data?.message || 'Login failed');
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotlight flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-9">
          <Link to="/" className="w-11 h-11 rounded-xl bg-gold flex items-center justify-center font-display font-semibold text-canvas text-xl mb-6">
            S
          </Link>
          <h1 className="font-display text-[32px] font-medium text-ink tracking-tight">Welcome back</h1>
          <p className="text-[15px] text-ink-faint mt-2">Sign in to continue to ShopLogs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter your password"
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
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-[13px] font-medium text-gold hover:text-gold-strong">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-canvas text-ink-faint">New to ShopLogs?</span>
          </div>
        </div>

        <Link
          to="/register"
          className="flex items-center justify-center gap-1.5 text-sm text-ink hover:text-gold font-semibold transition-colors group"
        >
          Create an account
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="mt-10 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

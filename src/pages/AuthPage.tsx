import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap, Wallet as WalletIcon } from 'lucide-react';
import Cookies from 'js-cookie';
import Logo from '../components/Logo';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified sellers', desc: 'Every log is checked before it ever hits the store' },
  { icon: WalletIcon, title: 'Wallet-funded checkout', desc: 'Pay straight from your balance, no card required' },
  { icon: Zap, title: 'Instant delivery', desc: 'Your logs are ready the moment payment clears' },
];

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' || searchParams.get('ref')
    ? 'register'
    : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const referralCode = useMemo(
    () => (searchParams.get('ref') || '').trim().toUpperCase().slice(0, 12) || undefined,
    [searchParams]
  );

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setLoginData({ ...loginData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login({ email: loginData.email, password: loginData.password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      Cookies.set('email', loginData.email);
      if (error.response?.status === 403) {
        navigate('/verify-otp');
      }
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setRegisterLoading(true);
    try {
      const { name, email, password } = registerData;
      await register({ name, email, password, referralCode });
      Cookies.set('email', email);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const passwordStrength =
    registerData.password.length >= 10 ? 'strong' : registerData.password.length >= 6 ? 'medium' : 'weak';
  const strengthTone = passwordStrength === 'strong' ? 'bg-success' : passwordStrength === 'medium' ? 'bg-warning' : 'bg-error';
  const strengthText = passwordStrength === 'strong' ? 'text-success' : passwordStrength === 'medium' ? 'text-warning' : 'text-error';

  return (
    <div className="min-h-screen bg-canvas grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-col justify-between px-14 py-12 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #14121F, #09090C)' }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, var(--vault-primary), transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--vault-accent), transparent 70%)' }} />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <Logo size={30} />
          <span className="font-display text-[19px] font-bold text-white tracking-tight">ShopLogs</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-[38px] font-extrabold text-white leading-[1.1] mb-4">
            A vault for<br />your digital logs.
          </h1>
          <p className="text-[14.5px] text-white/55 leading-relaxed mb-10">
            Browse thousands of verified logs from trusted sellers, funded straight from your wallet.
          </p>

          <div className="space-y-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[13.5px]">{f.title}</h3>
                  <p className="text-[12.5px] text-white/45 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11.5px] text-white/30">&copy; {new Date().getFullYear()} ShopLogs</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <Logo size={26} />
            <span className="font-display text-[16px] font-bold text-ink">ShopLogs</span>
          </Link>

          <div className="flex bg-surface-hover rounded-full p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors ${mode === 'login' ? 'bg-elevated text-ink shadow-[var(--shadow-vault-sm)]' : 'text-ink-muted'}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors ${mode === 'register' ? 'bg-elevated text-ink shadow-[var(--shadow-vault-sm)]' : 'text-ink-muted'}`}
            >
              Create account
            </button>
          </div>

          {mode === 'login' ? (
            <div key="login" className="animate-fade-up">
              <div className="mb-7">
                <h2 className="font-display text-[24px] font-bold text-ink mb-1.5">Welcome back</h2>
                <p className="text-[13.5px] text-ink-muted">Sign in to continue to ShopLogs</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Email address</label>
                  <Input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-medium text-ink-soft">Password</label>
                    <Link to="/forgot-password" className="text-[12px] text-ink-muted hover:text-ink transition-colors">
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    type={showLoginPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="Enter your password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightSlot={
                      <button type="button" onClick={() => setShowLoginPassword((v) => !v)} className="text-ink-muted hover:text-ink-soft transition-colors">
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>

                <label htmlFor="remember" className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    id="remember"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleLoginChange}
                    className="w-4 h-4 rounded border-border accent-[var(--vault-primary)] cursor-pointer"
                  />
                  <span className="text-[13px] text-ink-muted">Remember me for 30 days</span>
                </label>

                <Button type="submit" loading={loginLoading} fullWidth size="lg" className="!mt-6">
                  {loginLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </div>
          ) : (
            <div key="register" className="animate-fade-up">
              <div className="mb-7">
                <h2 className="font-display text-[24px] font-bold text-ink mb-1.5">Create account</h2>
                <p className="text-[13.5px] text-ink-muted">Join the vault in under a minute</p>
              </div>

              {referralCode && (
                <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-success-soft border border-success/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                    <Gift className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">You've been invited!</p>
                    <p className="text-[11.5px] text-ink-muted">
                      Sign up with code <span className="font-mono font-bold text-ink">{referralCode}</span> and you'll get an extra $5 credited on top of the welcome bonus.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Full name</label>
                  <Input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    placeholder="John Doe"
                    leftIcon={<User className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Email address</label>
                  <Input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Password</label>
                  <Input
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightSlot={
                      <button type="button" onClick={() => setShowRegisterPassword((v) => !v)} className="text-ink-muted hover:text-ink-soft transition-colors">
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  {registerData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        <div className={`h-0.5 flex-1 rounded-full ${strengthTone}`} />
                        <div className={`h-0.5 flex-1 rounded-full ${registerData.password.length >= 6 ? strengthTone : 'bg-border'}`} />
                        <div className={`h-0.5 flex-1 rounded-full ${registerData.password.length >= 10 ? strengthTone : 'bg-border'}`} />
                      </div>
                      <p className={`text-[11px] mt-1 capitalize ${strengthText}`}>{passwordStrength} password</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Confirm password</label>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Re-enter your password"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    rightSlot={
                      <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-ink-muted hover:text-ink-soft transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  {registerData.confirmPassword && (
                    <p className={`text-[11px] mt-1 ${registerData.password === registerData.confirmPassword ? 'text-success' : 'text-error'}`}>
                      {registerData.password === registerData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <Button type="submit" loading={registerLoading} fullWidth size="lg" className="!mt-6">
                  {registerLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-[11.5px] text-ink-muted leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-ink-soft hover:text-ink">Terms of Service</a> and{' '}
            <a href="#" className="text-ink-soft hover:text-ink">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

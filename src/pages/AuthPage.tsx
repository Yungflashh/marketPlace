import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';
import Logo from '../components/Logo';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
      await register({ name, email, password });
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
    registerData.password.length >= 10
      ? 'strong'
      : registerData.password.length >= 6
      ? 'medium'
      : 'weak';

  const strengthColor =
    passwordStrength === 'strong'
      ? 'bg-green-500'
      : passwordStrength === 'medium'
      ? 'bg-yellow-400'
      : 'bg-red-400';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Column - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-start px-16 py-12 relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl" />

          <div className="max-w-lg relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <Logo size={32} />
              <span className="text-2xl font-bold text-white tracking-tight">ShopLogs</span>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                  Discover.
                  <br />
                  Shop. Repeat.
                </h1>
                <p className="text-lg text-gray-300">
                  Browse thousands of premium products from verified merchants. Get quality items delivered fast.
                </p>
              </div>

              <div className="space-y-4 pt-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-white">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Trusted Sellers</h3>
                    <p className="text-sm text-gray-300">Handpicked merchants with verified ratings</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-white">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Secure Payments</h3>
                    <p className="text-sm text-gray-300">256-bit encrypted transactions</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-white">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Fast Delivery</h3>
                    <p className="text-sm text-gray-300">Quick processing and worldwide shipping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Auth Form with Flip */}
        <div className="flex flex-col justify-center items-center px-6 lg:px-16 py-12 bg-white">
          <div className="w-full max-w-md" style={{ perspective: '1500px' }}>
            <div
              className="relative w-full transition-transform duration-700 ease-in-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: mode === 'register' ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Register form (sizes the container - it's taller) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  pointerEvents: mode === 'register' ? 'auto' : 'none',
                }}
              >
                <div>
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
                    <p className="text-gray-600">Join our community of shoppers</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="name"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          required
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          required
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          name="password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                          placeholder="Minimum 6 characters"
                          minLength={6}
                          className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {registerData.password && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            <div className={`h-0.5 flex-1 rounded-full ${strengthColor}`} />
                            <div className={`h-0.5 flex-1 rounded-full ${registerData.password.length >= 6 ? strengthColor : 'bg-gray-200'}`} />
                            <div className={`h-0.5 flex-1 rounded-full ${registerData.password.length >= 10 ? strengthColor : 'bg-gray-200'}`} />
                          </div>
                          <p className={`text-xs mt-1 capitalize ${
                            passwordStrength === 'strong' ? 'text-green-600' :
                            passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {passwordStrength} password
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          required
                          placeholder="Re-enter your password"
                          className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {registerData.confirmPassword && (
                        <p className={`text-xs mt-1 ${
                          registerData.password === registerData.confirmPassword ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {registerData.password === registerData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                      {registerLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <span>Create account</span>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={toggleMode}
                        className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Login form (absolutely positioned on top, vertically centered) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  pointerEvents: mode === 'login' ? 'auto' : 'none',
                }}
              >
                <div>
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                    <p className="text-gray-600">Welcome back to ShopLogs</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          required
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <a href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                          Forgot?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          required
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="remember"
                        name="rememberMe"
                        checked={loginData.rememberMe}
                        onChange={handleLoginChange}
                        className="w-4 h-4 rounded border-gray-300 bg-gray-50 cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                        Remember me for 30 days
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                      {loginLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign in</span>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={toggleMode}
                        className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
              <p>
                By continuing, you agree to our{' '}
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

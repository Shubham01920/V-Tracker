import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'postman-1';
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
        deviceId: getOrCreateDeviceId(),
      });

      const data = res.data?.data;
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data?.user) {
        const u = data.user;
        const loggedInUser = {
          id: u.id,
          name: u.fullName || u.email,
          email: u.email,
          role: u.role,
          memberId: u.memberId,
          rawUser: u,
          initials: (u.fullName || u.email || 'AD')
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        toast.success(res.data?.message || 'Login successful!');
        navigate('/dashboard', { state: loggedInUser });
      } else {
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.log('Backend Error Response Data:', err.response?.data);
      const data = err.response?.data;
      const errorMsg =
        (typeof data === 'string' ? data : null) ||
        data?.message ||
        (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
        (Array.isArray(data?.errors) ? data.errors[0]?.message || data.errors[0] : null) ||
        err.message ||
        'Login failed: 401 Unauthorized (Invalid email or password)';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden font-sans">
      {/* Left side image - hidden on mobile/tablet, shown on desktop (lg) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary items-center justify-center">
        <img
          src="/v-tracker-login-image.png"
          alt="V-Tracker Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-10 left-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 shadow-xl z-10">
          <div className="w-12 h-12 bg-accent text-white rounded-lg flex items-center justify-center font-heading font-black text-2xl shadow-lg">
            V
          </div>
          <div>
            <h2 className="text-white font-heading font-bold text-lg tracking-wider">V-TRACKER</h2>
            <p className="text-white/80 text-xs font-medium">Mission 2026</p>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl lg:hidden"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl lg:hidden"></div>

        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-heading font-bold text-xl shadow-md">
              V
            </div>
            <h1 className="text-xl font-heading font-bold text-primary tracking-wide">V-TRACKER</h1>
          </div>

          <p className="text-gray-500 mb-8 text-sm sm:text-sm">
            Please sign-in to your account and start exploring.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email / Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or phone"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder-gray-400 text-gray-700 font-medium disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder-gray-400 text-gray-700 font-medium disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-[#061120] text-white font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
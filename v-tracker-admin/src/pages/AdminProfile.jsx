import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import {
  User, Mail, Phone, ShieldCheck, MapPin, Calendar, KeyRound,
  Copy, Check, RefreshCw, AlertCircle, Award, ShieldAlert,
  ArrowRight, CheckCircle2, Building, Sparkles
} from 'lucide-react';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast.error('Session expired. Please log in.');
      navigate('/');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';
      const res = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Fetch admin profile error:', err);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

      // If 401 (Access token expired), attempt auto-refresh
      if (err.response?.status === 401) {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          try {
            const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: storedRefreshToken
            });

            const newTokens = refreshRes.data?.data;
            if (newTokens?.accessToken) {
              localStorage.setItem('accessToken', newTokens.accessToken);
              if (newTokens.refreshToken) {
                localStorage.setItem('refreshToken', newTokens.refreshToken);
              }

              // Retry profile fetch with new token
              const retryRes = await axios.get(`${API_BASE_URL}/me`, {
                headers: { Authorization: `Bearer ${newTokens.accessToken}` }
              });

              if (retryRes.data?.data) {
                setProfile(retryRes.data.data);
                return;
              }
            }
          } catch (refreshErr) {
            console.error('Silent token refresh failed:', refreshErr);
          }
        }

        // If refresh also failed, prompt re-login
        toast.error('Session expired (401). Please log in again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('loggedInUser');
        navigate('/');
        return;
      }

      const msg = err.response?.data?.message || err.message || 'Failed to load profile details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'VA';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 space-y-6">
          
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">Admin Profile</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
                Administrator Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchProfile}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/40 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/change-password"
                className="px-4 py-2 bg-primary hover:bg-[#061120] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </Link>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && !profile && (
            <div className="space-y-6 animate-pulse">
              <div className="h-44 bg-white border border-gray-200 rounded-2xl p-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-60 bg-white border border-gray-200 rounded-2xl p-6"></div>
                <div className="h-60 bg-white border border-gray-200 rounded-2xl p-6"></div>
              </div>
            </div>
          )}

          {/* Error View */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <h3 className="text-base font-bold text-red-900">Failed to Load Profile</h3>
              <p className="text-sm text-red-600 max-w-md">{error}</p>
              <button
                type="button"
                onClick={fetchProfile}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Profile Content */}
          {profile && (
            <div className="space-y-6">

              {/* Hero Banner Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    {/* Big Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-primary to-[#061120] text-white flex items-center justify-center font-heading font-black text-2xl sm:text-3xl shadow-xl shadow-primary/25 border-4 border-white">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          getInitials(profile.fullName || profile.email)
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Active Account">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                          {profile.fullName || 'V Tracker Administrator'}
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {profile.role || 'ADMIN'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <span>Member ID: <strong className="font-mono text-gray-800">{profile.memberId || 'VT000001'}</strong></span>
                        <span>•</span>
                        <span>Joined: <strong className="text-gray-800">{formatDate(profile.createdAt)}</strong></span>
                      </p>

                      {/* Referral Badge */}
                      {profile.referralCode && (
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Referral Code:</span>
                          <button
                            type="button"
                            onClick={handleCopyReferral}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 font-mono text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                            title="Click to copy"
                          >
                            {profile.referralCode}
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stat Pill */}
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl self-stretch md:self-auto justify-around sm:justify-start">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Points Balance</p>
                      <p className="text-xl font-black font-heading text-primary">{profile.pointsBalance ?? 0} <span className="text-xs font-medium text-gray-500">pts</span></p>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">KYC Status</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        profile.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {profile.kycStatus || 'NOT_SUBMITTED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Card 1: Contact & Identification */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Contact & Credentials</h3>
                      <p className="text-xs text-gray-500">Registered authentication details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Primary Email</span>
                        <p className="text-sm font-bold text-gray-900">{profile.email || 'N/A'}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Primary Phone</span>
                        <p className="text-sm font-bold font-mono text-gray-900">{profile.phoneMasked || profile.phone || 'N/A'}</p>
                      </div>
                      {profile.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Alert Phone</span>
                        <p className="text-sm font-bold font-mono text-gray-900">
                          {profile.alertPhoneMasked || profile.alertPhone || 'Not Configured'}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-400">Emergency only</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Regional & Address Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Location & Address</h3>
                      <p className="text-xs text-gray-500">Regional details associated with admin</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Registered Address</span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.address || 'Not Provided'}</p>
                    </div>

                    <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase">City / Place</span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.city || profile.place || '—'}</p>
                    </div>

                    <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase">State</span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.state || '—'}</p>
                    </div>

                    <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Pincode</span>
                      <p className="text-sm font-bold font-mono text-gray-900 mt-0.5">{profile.pincode || '—'}</p>
                    </div>

                    <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Locality / Landmark</span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.locality || profile.nearBy || '—'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Security & System Info Footer */}
              <div className="bg-gradient-to-r from-gray-900 to-[#061120] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Administrator Security Status</h4>
                    <p className="text-xs text-white/70">Authenticated via JSON Web Tokens with 15-minute rotation</p>
                  </div>
                </div>
                <Link
                  to="/change-password"
                  className="px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                >
                  Manage Security
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminProfile;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  X, User as UserIcon, Shield, Car, Network, ExternalLink,
  Wallet, ShoppingCart, History, ArrowLeft, Edit3, ClipboardList,
  ChevronRight, AlertTriangle, MapPin, CheckCircle2, Loader2, Sparkles,
  Phone, Mail, Calendar, LogOut, Check
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const UserDrawer = ({ selectedUser, onClose, onUserUpdated }) => {
  const [activeView, setActiveView] = useState('PROFILE'); // PROFILE, EDIT, AUDIT, RECHARGE, ORDERS, WALLET, REFERRALS
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('Abusive Scanner Calls');
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [detailedUser, setDetailedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    address: '',
    locality: '',
    nearBy: '',
    city: '',
    state: '',
    pincode: '',
    role: 'OWNER',
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUserDetails = async (userId) => {
    if (!userId) return;
    setLoadingDetails(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: getAuthHeader(),
      });
      if (res.data?.data) {
        const d = res.data.data;
        setDetailedUser(d);
        setEditForm({
          fullName: d.fullName || '',
          email: d.email || '',
          address: d.address?.address || '',
          locality: d.address?.locality || '',
          nearBy: d.address?.nearBy || '',
          city: d.address?.city || '',
          state: d.address?.state || '',
          pincode: d.address?.pincode || '',
          role: d.role || 'OWNER',
        });
      }
    } catch (err) {
      console.warn('Live /v1/admin/users/:id API error:', err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      setActiveView('PROFILE');
      setShowBlockModal(false);
      setExpandedLevel(null);
      setDetailedUser(null);
      fetchUserDetails(selectedUser.id);
    }
  }, [selectedUser]);

  if (!selectedUser) return null;

  const handleBack = () => setActiveView('PROFILE');

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ADM-07: Block / Unblock user
  const handleToggleStatus = async (targetStatus, reason) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/admin/users/${selectedUser.id}/status`,
        { status: targetStatus, reason: reason || 'Status modified by admin' },
        { headers: getAuthHeader() }
      );
      toast.success(
        targetStatus === 'DISABLED' ? 'User blocked and all active sessions revoked' : 'User account re-activated!'
      );
      setShowBlockModal(false);
      fetchUserDetails(selectedUser.id);
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      console.error('Update user status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  // ADM-06: Update user details
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {};
      if (editForm.fullName) payload.fullName = editForm.fullName.trim();
      if (editForm.email) payload.email = editForm.email.trim();
      if (editForm.address) payload.address = editForm.address.trim();
      if (editForm.locality) payload.locality = editForm.locality.trim();
      if (editForm.nearBy) payload.nearBy = editForm.nearBy.trim();
      if (editForm.city) payload.city = editForm.city.trim();
      if (editForm.state) payload.state = editForm.state.trim();
      if (editForm.pincode) payload.pincode = editForm.pincode.trim();

      await axios.patch(
        `${API_BASE_URL}/admin/users/${selectedUser.id}`,
        payload,
        { headers: getAuthHeader() }
      );

      // ADM-08: If role was changed, update role
      const currentRole = detailedUser?.role || selectedUser.userClass || 'OWNER';
      if (editForm.role && editForm.role !== currentRole) {
        await axios.patch(
          `${API_BASE_URL}/admin/users/${selectedUser.id}/role`,
          { role: editForm.role },
          { headers: getAuthHeader() }
        );
      }

      toast.success('User profile updated successfully!');
      fetchUserDetails(selectedUser.id);
      setActiveView('PROFILE');
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      console.error('Update user error:', err);
      toast.error(err.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setActionLoading(false);
    }
  };

  // ADM-09: Force logout user from all active devices
  const handleForceLogout = async () => {
    try {
      setActionLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/admin/users/${selectedUser.id}/logout`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success(`Force logout complete! ${res.data?.data?.sessionsRevoked || ''} session(s) revoked.`);
    } catch (err) {
      console.error('Force logout error:', err);
      toast.error(err.response?.data?.message || 'Failed to revoke user sessions.');
    } finally {
      setActionLoading(false);
    }
  };

  // Baseline fields
  const displayName = detailedUser?.fullName || selectedUser.name;
  const displayMemberId = detailedUser?.memberId || selectedUser.memberId || selectedUser.id;
  const displayPhone = detailedUser?.phone || selectedUser.phone;
  const displayAlertPhone = detailedUser?.alertPhone;
  const displayEmail = detailedUser?.email || selectedUser.email;
  const displayJoinDate = detailedUser?.createdAt ? formatDate(detailedUser.createdAt) : (selectedUser.joinDate || 'N/A');
  const displayRole = detailedUser?.role || selectedUser.userClass || 'OWNER';
  const displayStatus = (detailedUser?.status || selectedUser.status || 'ACTIVE').toUpperCase();
  const displayKycStatus = detailedUser?.kyc?.status || detailedUser?.kycStatus || selectedUser.kycStatus || 'NOT_SUBMITTED';

  // Vehicles list
  const vehiclesList = detailedUser?.vehicles && detailedUser.vehicles.length > 0
    ? detailedUser.vehicles.map((v) => ({
        name: v.model ? `${v.model} (${v.registrationNumber})` : v.registrationNumber,
        vin: v.registrationNumber,
        qrOverride: !v.qr,
        type: v.type,
      }))
    : (selectedUser.linkedVehicles || []);

  // Orders list
  const ordersList = detailedUser?.recentOrders && detailedUser.recentOrders.length > 0
    ? detailedUser.recentOrders.map((ord) => ({
        product: ord.orderNumber,
        status: ord.status,
        date: formatDate(ord.placedAt),
        trackingId: ord.id,
        amount: `₹${((ord.totalPaise || 0) / 100).toLocaleString()}`,
      }))
    : (selectedUser.orderHistory || []);

  // Wallet
  const walletAvailable = detailedUser?.wallet?.availablePaise != null
    ? `₹${((detailedUser.wallet.availablePaise || 0) / 100).toLocaleString()}`
    : (selectedUser.walletBalance || '₹0');

  const totalSpentFormatted = detailedUser?.stats?.totalSpentPaise != null
    ? `₹${((detailedUser.stats.totalSpentPaise || 0) / 100).toLocaleString()}`
    : null;

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity cursor-pointer"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white z-[60] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col border-l border-gray-200 ${
          selectedUser ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            {activeView !== 'PROFILE' && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedUser.color} shrink-0`}
            >
              {selectedUser.initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-xl text-gray-900 line-clamp-1">{displayName}</h3>
                {loadingDetails && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs font-bold text-primary">{displayMemberId}</p>
                <span className="text-gray-300">•</span>
                <span className="text-[11px] font-semibold text-gray-500 uppercase">{displayRole}</span>
              </div>
            </div>
          </div>
          <button
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer shrink-0"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative">
          {/* ----- PROFILE VIEW ----- */}
          {activeView === 'PROFILE' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Personal Info */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Personal Information
                    </h4>
                  </div>
                  {detailedUser?.isActiveMember && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Sparkles className="w-3 h-3" /> Active Member
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Mobile Phone</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {displayPhone}
                      {detailedUser?.phoneVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" title="Verified" />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Email Address</p>
                    <p className="text-sm font-semibold text-gray-900 break-all flex items-center gap-1">
                      {displayEmail}
                      {detailedUser?.emailVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" title="Verified" />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Join Date</p>
                    <p className="text-sm font-semibold text-gray-900">{displayJoinDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">KYC Status</p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        displayKycStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {displayKycStatus}
                    </span>
                  </div>

                  {displayAlertPhone && (
                    <div className="col-span-2 pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Alert Phone (Emergency)</p>
                      <p className="text-sm font-semibold text-gray-900 font-mono">{displayAlertPhone}</p>
                    </div>
                  )}

                  {detailedUser?.referralCode && (
                    <div className="col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Referral Code</p>
                        <p className="text-sm font-mono font-bold text-primary">{detailedUser.referralCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Direct Referrals</p>
                        <p className="text-sm font-bold text-gray-900">{detailedUser.directReferrals ?? 0}</p>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveView('EDIT')}
                        className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Details
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => setActiveView('AUDIT')}
                        className="text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                      >
                        Audit Log
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleForceLogout}
                      disabled={actionLoading}
                      title="Force logout user from all devices"
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Force Logout
                    </button>
                  </div>
                </div>
              </section>

              {/* Address Information */}
              {detailedUser?.address && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Location & Address
                    </h4>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-sm space-y-1">
                    <p className="font-semibold text-gray-900">
                      {detailedUser.address.address || 'No street address'}
                      {detailedUser.address.locality ? `, ${detailedUser.address.locality}` : ''}
                    </p>
                    {detailedUser.address.nearBy && (
                      <p className="text-xs text-gray-500">Landmark: {detailedUser.address.nearBy}</p>
                    )}
                    <p className="text-xs text-gray-600 font-medium">
                      {detailedUser.address.city || '—'}, {detailedUser.address.state || '—'} — {detailedUser.address.pincode || '—'}
                    </p>
                  </div>
                </section>
              )}

              {/* Security Controls & Account Status */}
              <section className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      Account Status
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (displayStatus === 'ACTIVE') {
                        setShowBlockModal(true);
                      } else {
                        handleToggleStatus('ACTIVE', 'Re-activated by admin');
                      }
                    }}
                    disabled={actionLoading}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      displayStatus === 'ACTIVE'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {displayStatus === 'ACTIVE' ? 'Active (Click to Block)' : 'Blocked (Click to Activate)'}
                  </button>
                </div>

                {detailedUser?.statusReason && (
                  <p className="text-xs text-red-600 font-medium bg-red-100/50 p-2.5 rounded-lg border border-red-200">
                    Reason: <strong>{detailedUser.statusReason}</strong>
                  </p>
                )}
              </section>

              {/* Linked Vehicles */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Linked Vehicles
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded-md">
                    {vehiclesList.length} Registered
                  </span>
                </div>
                <div className="space-y-2">
                  {vehiclesList.length === 0 ? (
                    <p className="text-xs text-gray-500 italic p-3 text-center border border-dashed rounded-lg bg-gray-50">
                      No vehicles registered
                    </p>
                  ) : (
                    vehiclesList.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Car className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{v.name}</p>
                            <p className="text-[11px] text-gray-500 font-mono">Reg: {v.vin}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400">OVERRIDE</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked={v.qrOverride}
                            />
                            <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Account & Billing Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                {/* Recharge History */}
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <History className="w-3.5 h-3.5 text-primary" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</h4>
                  </div>
                  <div
                    onClick={() => setActiveView('RECHARGE')}
                    className="bg-white border border-gray-200 rounded-lg p-3.5 h-22 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer group shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-gray-500">Membership</span>
                      <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary truncate">
                        {detailedUser?.isActiveMember ? 'Active Member' : 'Standard'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">Click to view plans</p>
                    </div>
                  </div>
                </section>

                {/* Order History */}
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</h4>
                  </div>
                  <div
                    onClick={() => setActiveView('ORDERS')}
                    className="bg-white border border-gray-200 rounded-lg p-3.5 h-22 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer group shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-gray-500">Lifetime Orders</span>
                      <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 leading-tight">
                        {ordersList.length} Orders
                      </p>
                      {totalSpentFormatted && (
                        <p className="text-[10px] text-emerald-600 font-bold">Spent: {totalSpentFormatted}</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Wallet & Points */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Wallet & Points
                  </h4>
                </div>
                <div
                  onClick={() => setActiveView('WALLET')}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-primary/50 transition-colors cursor-pointer group shadow-sm"
                >
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5">Available Balance</p>
                    <p className="text-2xl font-black text-gray-900">{walletAvailable}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                      View Ledger <ExternalLink className="w-3 h-3" />
                    </span>
                    {detailedUser?.pointsBalance != null && (
                      <span className="text-xs font-bold text-gray-500">
                        {detailedUser.pointsBalance} Points
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Referral Tree Action */}
              <section className="pt-1">
                <button
                  onClick={() => setActiveView('REFERRALS')}
                  className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-sm font-bold leading-none mb-1">View Referral Network</p>
                      <p className="text-[11px] font-medium opacity-80">
                        Analyze user's multi-level referral network
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </section>
            </div>
          )}

          {/* ----- SUB VIEWS ----- */}

          {/* EDIT DETAILS (ADM-06) */}
          {activeView === 'EDIT' && (
            <form onSubmit={handleSaveEdit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Edit3 className="w-5 h-5" />
                <h3 className="text-lg font-bold">Edit Profile Details</h3>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Role / Class</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900 bg-white"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street / Flat / House No."
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Pincode</label>
                  <input
                    type="text"
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Landmark</label>
                  <input
                    type="text"
                    value={editForm.nearBy}
                    onChange={(e) => setEditForm({ ...editForm, nearBy: e.target.value })}
                    placeholder="Nearby landmark"
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border border-gray-200 text-gray-700 font-bold rounded-lg p-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-primary text-white font-bold rounded-lg p-2.5 hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* AUDIT LOG */}
          {activeView === 'AUDIT' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4 text-gray-700">
                <ClipboardList className="w-5 h-5" />
                <h3 className="text-lg font-bold">Security Audit Log</h3>
              </div>
              <div className="space-y-3">
                {(selectedUser.auditLogs || []).map((log, i) => (
                  <div key={i} className="p-3.5 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-sm font-bold text-gray-900">{log.action}</span>
                      <span className="text-[10px] font-bold text-gray-500">{log.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Performed by: <span className="text-primary font-bold">{log.admin}</span>
                    </p>
                  </div>
                ))}
                {(!selectedUser.auditLogs || selectedUser.auditLogs.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-8">No security audit events recorded.</p>
                )}
              </div>
            </div>
          )}

          {/* RECHARGE HISTORY */}
          {activeView === 'RECHARGE' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <History className="w-5 h-5" />
                <h3 className="text-lg font-bold">Subscription & Recharge History</h3>
              </div>
              <div className="space-y-3">
                {(selectedUser.rechargeHistory || []).map((rec, i) => (
                  <div key={i} className="p-3.5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                      <span className="text-sm font-bold text-gray-900">{rec.plan}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Date: {rec.date}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rec.invoiceId}</p>
                      </div>
                      <span className="text-base font-bold text-gray-800">{rec.amount}</span>
                    </div>
                  </div>
                ))}
                {(!selectedUser.rechargeHistory || selectedUser.rechargeHistory.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-8">No recharge history records found.</p>
                )}
              </div>
            </div>
          )}

          {/* ORDER HISTORY */}
          {activeView === 'ORDERS' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="text-lg font-bold">Hardware & Sticker Orders</h3>
              </div>
              <div className="space-y-3">
                {ordersList.map((ord, i) => (
                  <div
                    key={i}
                    className="p-3.5 border border-gray-200 border-l-4 border-l-primary rounded-xl hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-sm font-bold text-gray-900">{ord.product}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Date: {ord.date}</span>
                      <span className="font-bold text-gray-900 text-sm">{ord.amount}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {ord.trackingId}</p>
                  </div>
                ))}
                {ordersList.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No orders found for this user.</p>
                )}
              </div>
            </div>
          )}

          {/* WALLET LEDGER */}
          {activeView === 'WALLET' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Wallet className="w-5 h-5" />
                <h3 className="text-lg font-bold">Wallet Ledger</h3>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 flex justify-between items-center">
                <span className="text-xs font-bold text-primary uppercase">Available Balance</span>
                <span className="text-2xl font-black text-primary">{walletAvailable}</span>
              </div>
              <div className="space-y-2">
                {(selectedUser.walletLedger || []).map((tx, i) => (
                  <div
                    key={i}
                    className="p-3 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.desc}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{tx.date}</p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))}
                {(!selectedUser.walletLedger || selectedUser.walletLedger.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-8">No wallet ledger transactions.</p>
                )}
              </div>
            </div>
          )}

          {/* REFERRAL TREE */}
          {activeView === 'REFERRALS' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Network className="w-5 h-5" />
                <h3 className="text-lg font-bold">Referral Growth Network</h3>
              </div>

              <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-4 text-white shadow-md">
                <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-0.5">
                  Direct Referrals
                </p>
                <p className="text-2xl font-bold">{detailedUser?.directReferrals ?? selectedUser.referrals ?? 0}</p>
                <p className="text-xs mt-1 opacity-90">
                  Referral Code: <span className="font-mono font-bold">{detailedUser?.referralCode || 'VT-REF'}</span>
                </p>
              </div>

              <div className="relative pl-4 border-l-2 border-gray-200 space-y-4 mt-4">
                {(selectedUser.referralTree || []).map((ref, i) => (
                  <div key={i} className="relative">
                    <div className="absolute w-4 h-0.5 bg-gray-200 -left-4 top-4"></div>
                    <div className="absolute w-2 h-2 rounded-full bg-primary -left-[21px] top-3 border-2 border-white"></div>
                    <div
                      className={`bg-white border rounded-lg p-3 transition-colors cursor-pointer ${
                        expandedLevel === i ? 'border-primary shadow-sm' : 'border-gray-200 hover:border-primary/30'
                      }`}
                      onClick={() => setExpandedLevel(expandedLevel === i ? null : i)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-gray-800">{ref.level}</span>
                        <span className="text-sm font-bold text-emerald-600">{ref.earnings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 font-medium">{ref.count} Active Users</p>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedLevel === i ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!selectedUser.referralTree || selectedUser.referralTree.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-6 -ml-4 border-l-0">
                    No multi-generation referrals recorded yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer (Only visible on PROFILE view) */}
        {activeView === 'PROFILE' && (
          <div className="p-6 border-t border-gray-200 flex items-center gap-3 bg-gray-50 shrink-0">
            {displayStatus === 'ACTIVE' ? (
              <button
                onClick={() => setShowBlockModal(true)}
                disabled={actionLoading}
                className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                Block / Suspend User
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus('ACTIVE', 'Reactivated by admin')}
                disabled={actionLoading}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                Reactivate Account
              </button>
            )}
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Confirm Account Suspension</h3>
              <p className="text-center text-gray-500 text-sm mb-4">
                Are you sure you want to block <span className="font-bold text-gray-800">{displayName}</span>? This will immediately revoke all active sessions across devices.
              </p>

              <div className="mb-5 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Suspension Reason</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option>Abusive Scanner Calls</option>
                  <option>Fraudulent Vehicle Claim</option>
                  <option>Unpaid Orders</option>
                  <option>Policy Violation</option>
                  <option>Spam Activity</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus('DISABLED', blockReason)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Block User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDrawer;

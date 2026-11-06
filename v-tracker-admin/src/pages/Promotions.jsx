import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { toast } from 'sonner';
import {
  Megaphone, Tag, Plus, Edit, Trash2, Save, X, Calendar,
  IndianRupee, Percent, Settings2, Coins, UserPlus, Users,
  CreditCard, ShieldCheck, SlidersHorizontal,
  Ticket
} from 'lucide-react';

const initialCoupons = [
  { id: 1, code: 'WELCOME50', type: 'percentage', value: 50, minCart: 500, expiry: '2026-12-31', target: 'all', targetId: '' },
  { id: 2, code: 'VTRACK20', type: 'fixed', value: 200, minCart: 1000, expiry: '2026-10-15', target: 'specific', targetId: 'USR001' }
];

const initialRewards = {
  conversionRate: 1,
  signupBonus: 500,
  isTieredEnabled: true
};

const Promotions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Coupon State
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [couponForm, setCouponForm] = useState({
    id: null, code: '', type: 'percentage', value: '', minCart: '', expiry: '', target: 'all', targetId: ''
  });

  // Rewards State
  const [rewards, setRewards] = useState(initialRewards);

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  // Coupon Handlers
  const handleCouponChange = (e) => {
    const { name, value } = e.target;
    setCouponForm(prev => ({ ...prev, [name]: value }));
  };

  const resetCouponForm = () => {
    setCouponForm({ id: null, code: '', type: 'percentage', value: '', minCart: '', expiry: '', target: 'all', targetId: '' });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setCouponForm({ id: null, code: '', type: 'percentage', value: '', minCart: '', expiry: '', target: 'all', targetId: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.value || !couponForm.minCart || !couponForm.expiry || (couponForm.target === 'specific' && !couponForm.targetId)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const newCoupon = {
      ...couponForm,
      id: isEditing ? couponForm.id : Date.now(),
      value: parseFloat(couponForm.value),
      minCart: parseFloat(couponForm.minCart)
    };

    if (isEditing) {
      setCoupons(prev => prev.map(c => c.id === newCoupon.id ? newCoupon : c));
      toast.success(`Coupon ${newCoupon.code} updated successfully.`);
    } else {
      setCoupons(prev => [...prev, newCoupon]);
      toast.success(`Coupon ${newCoupon.code} created successfully.`);
    }
    resetCouponForm();
  };

  const handleEditCoupon = (coupon) => {
    setCouponForm({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      target: coupon.target || 'all',
      targetId: coupon.targetId || '',
      minCart: coupon.minCart.toString(),
      expiry: coupon.expiry
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteCoupon = (id) => {
    setCouponToDelete(id);
  };

  const confirmDeleteCoupon = () => {
    if (couponToDelete) {
      setCoupons(prev => prev.filter(c => c.id !== couponToDelete));
      toast.success('Coupon deleted successfully.');
      setCouponToDelete(null);
    }
  };

  // Rewards Handlers
  const handleRewardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRewards(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveRewards = () => {
    if (!rewards.conversionRate || !rewards.signupBonus || !rewards.referralBonus) {
      toast.error('Please fill in all reward fields.');
      return;
    }
    toast.success('Global rules saved successfully.');
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-primary" />
                Discounts, Coupons & Points
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage discount coupons and reward point rules</p>
            </div>
            <button onClick={openCreateModal} className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Create New Coupon
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Left Column: Points & Rewards Engine */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                  <div className="p-5 border-b border-gray-100 bg-white flex items-center gap-3">
                    <SlidersHorizontal className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Points Settings</h3>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Point Conversion Rate */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Point Conversion Rate</label>
                      <div className="flex items-center gap-3 bg-[#F8FAFC] border border-indigo-50 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-gray-600">10 pts = ₹</span>
                        <input
                          type="number"
                          name="conversionRate"
                          value={rewards.conversionRate}
                          onChange={handleRewardChange}
                          className="w-16 bg-transparent text-base font-bold text-gray-900 focus:outline-none border-b border-dashed border-gray-300 text-center"
                        />
                      </div>
                      <p className="text-[11px] italic text-gray-500 mt-2">Value in INR for every 10 loyalty points earned.</p>
                    </div>

                    {/* Signup Bonus */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Signup Bonus Points</label>
                      <div className="flex justify-between items-center bg-[#F8FAFC] border border-indigo-50 rounded-xl px-4 py-3">
                        <input
                          type="number"
                          name="signupBonus"
                          value={rewards.signupBonus}
                          onChange={handleRewardChange}
                          className="w-full bg-transparent text-base font-medium text-gray-900 focus:outline-none"
                        />
                        <span className="text-sm font-bold text-gray-500">PTS</span>
                      </div>
                    </div>



                    <hr className="border-gray-100" />

                    {/* Save Button */}
                    <button onClick={handleSaveRewards} className="w-full bg-primary hover:bg-primary/90 cursor-pointer text-white font-bold py-3.5 rounded-xl transition-colors mt-2 text-sm uppercase tracking-wider shadow-sm">
                      Save Points
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Active Coupons Table */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">Active Coupons</h3>
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{coupons.length}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-white border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Cart</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {coupons.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center bg-gray-50/30">
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <Tag className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No active coupons found.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          coupons.map(coupon => (
                            <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors bg-white group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-lg border border-primary/20 tracking-wider">
                                  {coupon.code}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {coupon.target === 'specific' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                                    <Users className="w-3.5 h-3.5" /> ID: {coupon.targetId}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-100">
                                    <Users className="w-3.5 h-3.5" /> All Users
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-900">
                                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">₹{coupon.minCart}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-red-600">{new Date(coupon.expiry).toLocaleDateString()}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditCoupon(coupon)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modal for Creating / Editing Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={resetCouponForm}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              </div>
              <button onClick={resetCouponForm} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={couponForm.code}
                  onChange={handleCouponChange}
                  placeholder="e.g. WELCOME50"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Target Users *</label>
                  <select
                    name="target"
                    value={couponForm.target}
                    onChange={handleCouponChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="all">All Users</option>
                    <option value="specific">Specific User ID</option>
                  </select>
                </div>
                {couponForm.target === 'specific' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">User ID *</label>
                    <input
                      type="text"
                      name="targetId"
                      value={couponForm.targetId}
                      onChange={handleCouponChange}
                      placeholder="e.g. USR12345"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                ) : (
                  <div></div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type *</label>
                  <select
                    name="type"
                    value={couponForm.type}
                    onChange={handleCouponChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Value *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="value"
                      value={couponForm.value}
                      onChange={handleCouponChange}
                      placeholder="0"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {couponForm.type === 'percentage' ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Min Cart (₹) *</label>
                <input
                  type="number"
                  name="minCart"
                  value={couponForm.minCart}
                  onChange={handleCouponChange}
                  placeholder="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expiry Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expiry"
                    value={couponForm.expiry}
                    onChange={handleCouponChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setCouponToDelete(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-5">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Coupon?</h3>
              <p className="text-sm text-gray-500 mb-6 px-2">Are you sure you want to permanently delete this coupon? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setCouponToDelete(null)}
                  className="flex-1 cursor-pointer px-4 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCoupon}
                  className="flex-1 cursor-pointer px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;

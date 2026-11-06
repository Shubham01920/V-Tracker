import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { packageConfig, premiumPlans, revenueData } from '../data/mockPlans';
import { toast } from 'sonner';
import {
  CreditCard, Edit, Plus, Eye, EyeOff, Package,
  Settings, IndianRupee, Users, TrendingUp, X, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Plans = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [plans, setPlans] = useState(premiumPlans);
  const [pkgConfig, setPkgConfig] = useState(packageConfig);
  const location = useLocation();

  // Modal States
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [currentPlanData, setCurrentPlanData] = useState(null); // null if adding, object if editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  // Base Package Handlers
  const handleEditPackage = () => {
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setPkgConfig({
      basePrice: Number(formData.get('basePrice')),
      gstPercentage: Number(formData.get('gstPercentage')),
      bundledItems: formData.get('bundledItems').split('\n').map(i => i.trim()).filter(Boolean)
    });
    setIsPackageModalOpen(false);
    toast.success('Package configuration updated successfully');
  };

  // Plan Handlers
  const handleEditPlan = (plan) => {
    setCurrentPlanData(plan);
    setIsPlanModalOpen(true);
  };

  const handleAddPlan = () => {
    setCurrentPlanData(null);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const planData = {
      duration: formData.get('duration'),
      price: Number(formData.get('price')),
    };

    if (currentPlanData) {
      // Edit
      setPlans(plans.map(p => p.id === currentPlanData.id ? { ...p, ...planData } : p));
      toast.success('Plan updated successfully');
    } else {
      // Add
      const newPlan = {
        id: `plan_${Date.now()}`,
        duration: planData.duration,
        price: planData.price,
        activeSubscribers: 0,
        status: 'Active'
      };
      setPlans([...plans, newPlan]);
      toast.success('New plan added successfully');
    }
    setIsPlanModalOpen(false);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePlan = () => {
    setPlans(plans.filter(p => p.id !== planToDelete.id));
    setIsDeleteModalOpen(false);
    toast.success('Plan removed successfully');
  };

  const handleToggleVisibility = (planId) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const newStatus = p.status === 'Active' ? 'Hidden' : 'Active';
        toast.success(`Plan visibility changed to ${newStatus}`);
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900">Plans & Pricing</h2>
              <p className="text-sm text-gray-500 mt-1">Manage base packages and recharge plans</p>
            </div>
            <button
              onClick={handleAddPlan}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto justify-center cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Package Configuration Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Base Package</h3>
                    <p className="text-xs text-gray-500">Hardware & Setup</p>
                  </div>
                </div>
                <button
                  onClick={handleEditPackage}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                  title="Edit Package"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">₹{pkgConfig.basePrice}</span>
                  <span className="text-sm text-gray-500">+ {pkgConfig.gstPercentage}% GST</span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Bundled Items:</p>
                  {pkgConfig.bundledItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Revenue by Plan Duration</h3>
                  <p className="text-xs text-gray-500">Estimated based on active subscriptions</p>
                </div>
              </div>
              
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Premium Plans Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Recharge Plans</h3>
                  <p className="text-xs text-gray-500">Manage duration, pricing and visibility</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Duration</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscribers</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{plan.duration}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-700">
                          <IndianRupee className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="font-medium">{plan.price}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{plan.activeSubscribers.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleVisibility(plan.id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                            title={plan.status === 'Active' ? 'Hide Plan' : 'Show Plan'}
                          >
                            {plan.status === 'Active' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(plan)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Plan"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {plans.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No premium plans found. Click "Add New Plan" to create one.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Package Configuration Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 font-heading">Edit Base Package</h3>
              <button 
                onClick={() => setIsPackageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                  <input 
                    type="number" 
                    name="basePrice" 
                    defaultValue={pkgConfig.basePrice} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Percentage (%)</label>
                  <input 
                    type="number" 
                    name="gstPercentage" 
                    defaultValue={pkgConfig.gstPercentage} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bundled Items (One per line)</label>
                  <textarea 
                    name="bundledItems" 
                    rows={4} 
                    defaultValue={pkgConfig.bundledItems.join('\n')} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm resize-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Modal (Add / Edit) */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 font-heading">
                {currentPlanData ? 'Edit Plan' : 'Add New Plan'}
              </h3>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Duration</label>
                  <input 
                    type="text" 
                    name="duration" 
                    placeholder="e.g., 30 Days"
                    defaultValue={currentPlanData?.duration || ''} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    placeholder="e.g., 199"
                    defaultValue={currentPlanData?.price || ''} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  {currentPlanData ? 'Save Changes' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">Remove Plan?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove the <span className="font-semibold text-gray-700">{planToDelete?.duration}</span> plan? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors flex-1 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeletePlan}
                className="px-5 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex-1 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;

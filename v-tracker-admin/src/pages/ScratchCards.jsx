import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { mockRewardPoolConfig } from '../data/mockReferrals';
import { toast } from 'sonner';
import {
  Gift, Percent, Settings, Save, Edit, Smartphone, Ticket, Zap
} from 'lucide-react';

const ScratchCards = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [config, setConfig] = useState(mockRewardPoolConfig);
  const location = useLocation();

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const handleLimitChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      activeCardLimits: {
        ...prev.activeCardLimits,
        [name]: parseInt(value, 10) || 0
      }
    }));
  };

  const handleSaveLimits = () => {
    toast.success('Active card limits updated successfully.');
  };

  const handleProbabilityChange = (id, newProbability) => {
    const value = parseInt(newProbability, 10) || 0;
    setConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map(t => t.id === id ? { ...t, probability: value } : t)
    }));
  };

  const handleSaveTiers = () => {
    const totalProb = config.tiers.reduce((sum, tier) => sum + tier.probability, 0);
    if (totalProb !== 100) {
      toast.error(`Total probability must be 100%. Currently it is ${totalProb}%.`);
      return;
    }
    toast.success('Reward tiers matrix updated successfully.');
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-8">Scratch Card Reward Pool (/scratch-cards)</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
              <Gift className="w-7 h-7 text-primary" />
              Reward Pool Management
            </h3>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8 flex items-start gap-4">
              <Smartphone className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-blue-900 font-medium text-lg">
                Configure reward cards for the mobile app's scratcher widget.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Column: Tiers and Probability */}
              <div className="space-y-8">
                
                {/* Reward Tier Types */}
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Ticket className="w-6 h-6 text-purple-600" />
                    <h4 className="font-bold text-gray-900 text-lg">Reward Tier Types</h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 font-medium">
                    <li>Cashback (₹10–₹500)</li>
                    <li>Discount Coupons</li>
                    <li>Premium Plan Free Extension Days</li>
                    <li>"Better Luck Next Time"</li>
                  </ul>
                </div>

                {/* Win Probability Matrix */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Percent className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Win Probability Matrix</h4>
                        <p className="text-sm text-gray-500">set percentage odds per reward tier</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-100">
                        {config.tiers.map((tier) => (
                          <tr key={tier.id}>
                            <td className="py-3 px-2">
                              <span className="font-semibold text-gray-800">{tier.type}</span>
                            </td>
                            <td className="py-3 px-2 w-32">
                              <div className="relative inline-flex items-center w-full">
                                <input
                                  type="number"
                                  value={tier.probability}
                                  onChange={(e) => handleProbabilityChange(tier.id, e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center font-bold"
                                />
                                <Percent className="w-3.5 h-3.5 absolute right-3 text-gray-400 pointer-events-none" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className={`text-sm font-bold ${
                        config.tiers.reduce((sum, t) => sum + t.probability, 0) === 100 
                          ? 'text-emerald-600' 
                          : 'text-red-500'
                      }`}>
                        Total Odds: {config.tiers.reduce((sum, t) => sum + t.probability, 0)}%
                      </span>
                      <button
                        onClick={handleSaveTiers}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer flex items-center gap-2 text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save Matrix
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Active Card Limits */}
              <div>
                <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-6 shadow-sm sticky top-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    <h4 className="font-bold text-gray-900 text-lg">Active Card Limits</h4>
                  </div>
                  <p className="text-gray-600 mb-6 font-medium">set max scratch cards a user can earn per referral or recharge event</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Per Referral Event</label>
                      <input
                        type="number"
                        name="perReferral"
                        value={config.activeCardLimits.perReferral}
                        onChange={handleLimitChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Per Recharge Event</label>
                      <input
                        type="number"
                        name="perRecharge"
                        value={config.activeCardLimits.perRecharge}
                        onChange={handleLimitChange}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      />
                    </div>
                    
                    <button
                      onClick={handleSaveLimits}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
                    >
                      <Save className="w-5 h-5" />
                      Save Limits
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default ScratchCards;

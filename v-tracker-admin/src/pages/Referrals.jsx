import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import {
  mockGenerationPlan, mockLeaderboard, mockPayoutHistory, mockNetworkTree, mockRewardPoolConfig
} from '../data/mockReferrals';
import { toast } from 'sonner';
import {
  Share2, Network, IndianRupee, Check, X,
  Search, Users, TrendingUp, Plus, Minus, Edit, Award, Info,
  Settings2, Layers, PieChart, CheckSquare, Trash2, AlertTriangle,
  Gift, Percent, Save, Smartphone, Ticket, Zap, Table, LayoutGrid
} from 'lucide-react';

const flattenTreeByLevel = (node) => {
  const levels = {};
  const traverse = (currentNode) => {
    if (currentNode.level > 0) {
      if (!levels[currentNode.level]) levels[currentNode.level] = [];
      levels[currentNode.level].push(currentNode);
    }
    if (currentNode.children) {
      currentNode.children.forEach(traverse);
    }
  };
  traverse(node);
  return levels;
};


const Referrals = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Income Plan Configuration');
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState(mockRewardPoolConfig);
  const [generationPlan, setGenerationPlan] = useState(mockGenerationPlan);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [levelToDelete, setLevelToDelete] = useState(null);
  const [expandedGen, setExpandedGen] = useState(null);
  const [packageAmount, setPackageAmount] = useState(1599);
  const [payoutViewMode, setPayoutViewMode] = useState('table');
  const location = useLocation();

  const usersByLevel = flattenTreeByLevel(mockNetworkTree);

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const tabs = ['Income Plan Configuration', 'Referral Network Explorer', 'Payout History', 'Scratch Card Reward Pool'];

  const handleApprovePayout = (id) => {
    toast.success(`Payout ${id} approved successfully.`);
  };

  const handleRejectPayout = (id) => {
    toast.error(`Payout ${id} rejected.`);
  };

  const handleSearchUser = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.success(`Displaying referral network for user: ${searchQuery}`);
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

  const handleRemoveLevel = (levelToRemove) => {
    setLevelToDelete(levelToRemove);
  };

  const confirmRemoveLevel = () => {
    if (!levelToDelete) return;
    setGenerationPlan(prev => {
      const filtered = prev.filter(g => g.level !== levelToDelete);
      return filtered.map((g, idx) => ({ ...g, level: idx + 1 }));
    });
    toast.success('Generation level removed.');
    setLevelToDelete(null);
  };

  const handleEditClick = (gen) => {
    setEditingLevel(gen.level);
    setEditValue(gen.percentage.toString());
  };

  const handleSaveEdit = (level) => {
    const newPercentage = parseFloat(editValue);
    if (isNaN(newPercentage) || newPercentage < 0) {
      toast.error('Please enter a valid positive number.');
      return;
    }
    setGenerationPlan(prev => prev.map(g => g.level === level ? { ...g, percentage: newPercentage } : g));
    setEditingLevel(null);
    toast.success('Income percentage updated.');
  };

  const handleCancelEdit = () => {
    setEditingLevel(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900">Referrals & Income</h2>
              <p className="text-sm text-gray-500 mt-1">Manage 10-generation plans, networks, and payouts</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 mb-6 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: Income Plan Configuration */}
          {activeTab === 'Income Plan Configuration' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">


              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">10-Generation Income Plan</h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex flex-col gap-1">
                        <span>• Edit income percentages per generation</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                      <span className="text-sm font-semibold text-gray-500 mr-2">Package: ₹</span>
                      <input 
                        type="number"
                        value={packageAmount}
                        onChange={(e) => setPackageAmount(Number(e.target.value) || 0)}
                        className="w-20 outline-none text-sm font-bold text-gray-900 bg-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generation Level</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Income (%)</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Calculated Income (₹)</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Payouts to Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {generationPlan.map((gen) => (
                        <tr key={gen.level} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-900">Generation {gen.level}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {editingLevel === gen.level ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-20 px-2 py-1 border border-primary text-primary font-bold rounded outline-none focus:ring-2 focus:ring-primary/20 text-center"
                                  autoFocus
                                />
                                <span className="text-gray-500 font-bold">%</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg">
                                {gen.percentage}%
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg">
                              ₹{((gen.percentage / 100) * packageAmount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-gray-700 font-medium text-sm flex items-center justify-end">
                              <IndianRupee className="w-3.5 h-3.5 mr-1 text-gray-400" />
                              {gen.totalPayouts.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {editingLevel === gen.level ? (
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleSaveEdit(gen.level)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Save">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Cancel">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleEditClick(gen)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer" title="Edit income percentage">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleRemoveLevel(gen.level)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Remove generation level">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Income Rule Banner */}
                <div className="p-5 border-t border-gray-100 bg-blue-50/50 flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 leading-relaxed">
                    <strong>Income Rule:</strong> Every time a referred user (across any of the 10 generations) recharges a premium plan, the referrer chain earns the configured percentage of the recharge amount.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Referral Network Explorer */}
          {activeTab === 'Referral Network Explorer' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Tree Visualization */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden xl:col-span-2 flex flex-col min-h-[600px]">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Network className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Tree Visualization</h3>
                        <p className="text-xs text-gray-500">Interactive 10-level deep referral chain</p>
                      </div>
                    </div>
                    <form onSubmit={handleSearchUser} className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search User ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-20 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      />
                      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                        Search
                      </button>
                    </form>
                  </div>

                  <div className="flex-1 p-6 overflow-auto bg-gray-50/30">
                    <div className="w-full max-w-3xl space-y-3">
                      {generationPlan.map((gen) => {
                        const users = usersByLevel[gen.level] || [];
                        const isExpanded = expandedGen === gen.level;
                        return (
                          <div key={gen.level} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all">
                            <button
                              onClick={() => setExpandedGen(isExpanded ? null : gen.level)}
                              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                  G{gen.level}
                                </div>
                                <div className="text-left">
                                  <h4 className="font-bold text-gray-900">Generation {gen.level}</h4>
                                  <p className="text-xs text-gray-500 font-medium">{users.length} Referrals</p>
                                </div>
                              </div>
                              <div className="text-gray-400">
                                {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                {users.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {users.map((u) => (
                                      <div key={u.id} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm hover:border-primary/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shadow-inner">
                                          {u.name.charAt(0)}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.id}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-6 flex flex-col items-center justify-center text-gray-400">
                                    <Users className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No referrals found at this generation level.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden xl:col-span-1 h-fit">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-xl shadow-inner">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Referral Leaderboard</h3>
                        <p className="text-xs text-gray-500">Top referrers ranked by total network size and income earned</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {mockLeaderboard.map((user, idx) => (
                      <div key={user.id} className="relative flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 overflow-hidden group cursor-default">
                        {idx === 0 && <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>}
                        <div className="flex items-center gap-3 relative z-10">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' : idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' : idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className={`font-bold ${idx === 0 ? 'text-amber-700' : 'text-gray-900'}`}>{user.name}</p>
                            <div className="flex items-center text-[10px] text-gray-500 mt-0.5 font-medium">
                              <Users className="w-3 h-3 mr-1" />
                              {user.networkSize.toLocaleString()} refs
                            </div>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-semibold">Total Income</p>
                          <p className={`text-sm font-black ${idx === 0 ? 'text-emerald-600' : 'text-gray-700'}`}>₹{user.totalIncome.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Payout History */}
          {activeTab === 'Payout History' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Payout History / Queue Container */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Payout History ({payoutViewMode === 'table' ? 'Table View' : 'Card View'})</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Review pending income distributions and payout history</p>
                  </div>

                  {/* View Switcher Toggle */}
                  <div className="flex items-center bg-gray-200/80 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setPayoutViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        payoutViewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Table View"
                    >
                      <Table className="w-4 h-4" />
                      <span>Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        payoutViewMode === 'cards' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Card View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Cards</span>
                    </button>
                  </div>
                </div>

                {/* Table View */}
                {payoutViewMode === 'table' && (
                  <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generation Level</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referral User</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recharge Plan</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recharge Amount</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Income %</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payout Amount</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payout Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mockPayoutHistory.map((payout) => (
                          <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900 text-sm">{payout.userName}</p>
                              <p className="text-[10px] font-mono text-gray-500">{payout.userId}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">GEN {payout.genLevel}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-700">{payout.referralUser}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">{payout.rechargePlan}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">₹{payout.amount}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">{payout.incomePercent}%</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-emerald-600">₹{payout.payoutAmount}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${payout.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                payout.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                  payout.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {payout.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{payout.date}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {payout.status === 'Pending' ? (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleApprovePayout(payout.id)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer" title="Approve">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleRejectPayout(payout.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors cursor-pointer" title="Reject">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Card View */}
                {payoutViewMode === 'cards' && (
                  <div className="p-6 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {mockPayoutHistory.map((payout) => (
                        <div key={payout.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                              <div>
                                <h4 className="font-bold text-gray-900 text-base">{payout.userName}</h4>
                                <span className="font-mono text-xs text-gray-400">{payout.userId}</span>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                payout.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                payout.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                payout.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {payout.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="inline-block bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold">
                                GEN {payout.genLevel}
                              </span>
                              <span className="text-gray-500 font-medium">
                                Ref User: <strong className="text-gray-800">{payout.referralUser}</strong>
                              </span>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-gray-400 font-medium block mb-0.5">Plan</span>
                                <span className="font-semibold text-gray-800">{payout.rechargePlan}</span>
                                <p className="text-[11px] text-gray-500 mt-0.5">Recharge: ₹{payout.amount} ({payout.incomePercent}%)</p>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-400 font-medium block mb-0.5">Payout Amount</span>
                                <span className="font-extrabold text-emerald-600 text-base">₹{payout.payoutAmount}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                              <span>Date: {payout.date}</span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-mono">ID: {payout.id}</span>
                            {payout.status === 'Pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprovePayout(payout.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPayout(payout.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-md">Processed</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Scratch Card Reward Pool */}
          {activeTab === 'Scratch Card Reward Pool' && (
            <div className="animate-in fade-in duration-500 max-w-5xl">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                  <Gift className="w-7 h-7 text-primary" />
                  Scratch Card Reward Pool
                </h3>

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
                        <li>Cashback (₹2–₹15)</li>
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
                          <span className={`text-sm font-bold ${config.tiers.reduce((sum, t) => sum + t.probability, 0) === 100
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
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {levelToDelete && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Generation {levelToDelete}?</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete this generation level? This will also renumber all subsequent levels. This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setLevelToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveLevel}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Delete Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;

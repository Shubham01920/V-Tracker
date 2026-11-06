import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { 
  IndianRupee, Copy, ChevronDown, ChevronUp, Network, TrendingUp,
  Search, Plus, Minus, X, Check, AlertCircle, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import StatCard from '../components/dashboard/StatCard';

// Mock Data Generator for 10 Levels
const generateMockLevels = () => {
  const levels = [];
  const names = ['Vaishnavi', 'Arjun Kapoor', 'Rahul Sharma', 'Amit Kumar', 'Priya Singh', 'Suresh Raina', 'Neha Gupta', 'Vikram Patel', 'Anjali Desai'];
  
  for (let i = 1; i <= 10; i++) {
    const numMembers = Math.max(2, Math.floor(Math.random() * 6) + (10 - i));
    const members = [];
    
    for (let j = 1; j <= numMembers; j++) {
      const name = names[Math.floor(Math.random() * names.length)];
      members.push({
        id: `S${i}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.toUpperCase(),
        email: `${name.toLowerCase().replace(' ', '')}${Math.floor(Math.random()*100)}@gmail.com`,
        referrals: Math.floor(Math.random() * 10),
        earnings: Math.floor(Math.random() * 10000).toLocaleString('en-IN'),
        joined: `${Math.floor(1 + Math.random() * 28)} Aug 2025`,
        activationDate: `${Math.floor(1 + Math.random() * 28)} Aug 2025`
      });
    }
    levels.push({ levelNumber: i, members });
  }
  return levels;
};

const initialMockLevels = generateMockLevels();

const UserReferralStatistics = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState({ 1: true });
  const [levelsData, setLevelsData] = useState(initialMockLevels);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Top level stats state
  const [totalEarnings, setTotalEarnings] = useState(1300);
  const [availableBalance, setAvailableBalance] = useState(1300);

  // Modal State for Add / Deduct
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'ADD', // 'ADD' or 'DEDUCT'
    member: null,
    levelNumber: null
  });
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleLevel = (levelNumber) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelNumber]: !prev[levelNumber]
    }));
  };

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const loggedInUser = getLoggedInUser();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ID: ${text}`);
  };

  // Search Logic
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setActiveSearch(query);

    if (query) {
      // Expand levels containing search query matches
      const newExpanded = {};
      let matchCount = 0;

      levelsData.forEach(lvl => {
        const hasMatch = lvl.members.some(m => 
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.id.toLowerCase().includes(query.toLowerCase()) ||
          m.email.toLowerCase().includes(query.toLowerCase())
        );
        if (hasMatch) {
          newExpanded[lvl.levelNumber] = true;
          matchCount++;
        }
      });

      setExpandedLevels(newExpanded);
      if (matchCount > 0) {
        toast.success(`Found results for "${query}" across ${matchCount} level(s)`);
      } else {
        toast.error(`No members found matching "${query}"`);
      }
    } else {
      toast.info('Search cleared');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setExpandedLevels({ 1: true });
    toast.info('Search cleared');
  };

  // Open Adjustment Modal (Member or Overall User)
  const openAdjustmentModal = (type, member = null, levelNumber = null) => {
    setModalConfig({
      isOpen: true,
      type,
      member,
      levelNumber
    });
    setAdjustAmount('');
    setAdjustReason(type === 'ADD' ? 'Referral Bonus Credit' : 'Administrative Deduction');
  };

  // Submit Adjustment (Add or Deduct)
  const handleConfirmAdjustment = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    if (modalConfig.member) {
      // Member level adjustment
      setLevelsData(prev => prev.map(lvl => {
        if (lvl.levelNumber !== modalConfig.levelNumber) return lvl;
        return {
          ...lvl,
          members: lvl.members.map(m => {
            if (m.id !== modalConfig.member.id) return m;
            const currentEarnings = parseInt(m.earnings.replace(/[^\d]/g, '') || '0', 10);
            const newEarnings = modalConfig.type === 'ADD' 
              ? currentEarnings + amountNum 
              : Math.max(0, currentEarnings - amountNum);
            return {
              ...m,
              earnings: newEarnings.toLocaleString('en-IN')
            };
          })
        };
      }));

      if (modalConfig.type === 'ADD') {
        setTotalEarnings(prev => prev + amountNum);
        setAvailableBalance(prev => prev + amountNum);
        toast.success(`Added ₹${amountNum.toLocaleString('en-IN')} to ${modalConfig.member.name} (${modalConfig.member.id})`);
      } else {
        setAvailableBalance(prev => Math.max(0, prev - amountNum));
        toast.success(`Deducted ₹${amountNum.toLocaleString('en-IN')} from ${modalConfig.member.name} (${modalConfig.member.id})`);
      }
    } else {
      // Overall User balance adjustment
      if (modalConfig.type === 'ADD') {
        setTotalEarnings(prev => prev + amountNum);
        setAvailableBalance(prev => prev + amountNum);
        toast.success(`Added ₹${amountNum.toLocaleString('en-IN')} to user balance.`);
      } else {
        if (amountNum > availableBalance) {
          toast.error('Deduction amount exceeds current available balance.');
          return;
        }
        setAvailableBalance(prev => Math.max(0, prev - amountNum));
        toast.success(`Deducted ₹${amountNum.toLocaleString('en-IN')} from user balance.`);
      }
    }

    setModalConfig({ isOpen: false, type: 'ADD', member: null, levelNumber: null });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} user={loggedInUser} />
        
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Header Title & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-heading font-bold text-primary">User Referral Statistics</h1>
                <p className="text-gray-500 text-sm mt-1">Detailed 10-level view & management of user's referral network</p>
              </div>

              {/* Add & Deduct Global Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openAdjustmentModal('ADD')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Earnings
                </button>
                <button 
                  onClick={() => openAdjustmentModal('DEDUCT')}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                  Deduct Earnings
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Direct Referrals" 
                icon={Network} 
                value="3" 
                trend="Level 1 referrals" 
                colorScheme="green" 
              />
              <StatCard 
                title="Total Earnings" 
                icon={IndianRupee} 
                value={`₹${totalEarnings.toLocaleString('en-IN')}`} 
                trend="Lifetime earnings" 
                colorScheme="purple" 
              />
              <StatCard 
                title="Available Balance" 
                icon={TrendingUp} 
                value={`₹${availableBalance.toLocaleString('en-IN')}`} 
                trend="Current balance" 
                colorScheme="orange" 
              />
            </div>

            {/* Search Bar Section */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Name, User ID (e.g. S1-2094), or Email..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>

                  {activeSearch && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>
              </form>

              {activeSearch && (
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Showing search results for: <span className="font-bold text-gray-900">"{activeSearch}"</span>
                </p>
              )}
            </div>
            
            {/* Referral Tree Section */}
            <div className="pt-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Referral Tree (10 Levels)</h2>
              <div className="space-y-4">
                {levelsData.map((levelData) => {
                  const isExpanded = expandedLevels[levelData.levelNumber];
                  const filteredMembers = activeSearch 
                    ? levelData.members.filter(m => 
                        m.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
                        m.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
                        m.email.toLowerCase().includes(activeSearch.toLowerCase())
                      )
                    : levelData.members;

                  return (
                    <div key={levelData.levelNumber} className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                      
                      {/* Level Header (Accordion Toggle) */}
                      <button 
                        onClick={() => toggleLevel(levelData.levelNumber)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                          
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold tracking-wide">
                            Level {levelData.levelNumber}
                          </div>
                          
                          <span className="text-sm font-bold text-gray-900">
                            {filteredMembers.length} {activeSearch ? 'Matching' : ''} Users
                          </span>
                        </div>

                        {activeSearch && filteredMembers.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                            {filteredMembers.length} found
                          </span>
                        )}
                      </button>

                      {/* Level Table */}
                      {isExpanded && (
                        <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-[12px] text-gray-800 bg-[#f8fafc] border-b border-gray-100 font-bold">
                              <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Referrals</th>
                                <th className="px-6 py-4">Earnings</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Activation Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                              {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-gray-900">
                                    {member.name}
                                  </td>
                                  <td className="px-6 py-4">
                                    <button 
                                      onClick={() => copyToClipboard(member.id)}
                                      className="cursor-pointer group px-2.5 py-1 bg-emerald-50/60 text-emerald-500 border border-emerald-100 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                    >
                                      {member.id}
                                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">
                                    {member.email}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-gray-700">
                                    {member.referrals}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-emerald-600">
                                    ₹{member.earnings}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-gray-600">
                                    {member.joined}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-gray-600">
                                    {member.activationDate}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => openAdjustmentModal('ADD', member, levelData.levelNumber)}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                        title="Add Earnings"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add
                                      </button>
                                      <button
                                        onClick={() => openAdjustmentModal('DEDUCT', member, levelData.levelNumber)}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                        title="Deduct Earnings"
                                      >
                                        <Minus className="w-3 h-3" />
                                        Deduct
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredMembers.length === 0 && (
                                <tr>
                                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 font-medium">
                                    {activeSearch ? `No members matching "${activeSearch}" in Level ${levelData.levelNumber}.` : 'No members found in this level.'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Add / Deduct Adjustment Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  modalConfig.type === 'ADD' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {modalConfig.type === 'ADD' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {modalConfig.type === 'ADD' ? 'Add Referral Balance' : 'Deduct Referral Balance'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {modalConfig.member ? `For ${modalConfig.member.name} (${modalConfig.member.id})` : 'Global User Account Balance'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalConfig({ isOpen: false, type: 'ADD', member: null, levelNumber: null })}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="p-6 space-y-4">
              {modalConfig.member && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Member:</span>
                    <span className="font-bold text-gray-900">{modalConfig.member.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">User ID:</span>
                    <span className="font-mono text-gray-700">{modalConfig.member.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Current Earnings:</span>
                    <span className="font-bold text-emerald-600">₹{modalConfig.member.earnings}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason / Remarks
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalConfig({ isOpen: false, type: 'ADD', member: null, levelNumber: null })}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-md cursor-pointer ${
                    modalConfig.type === 'ADD' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {modalConfig.type === 'ADD' ? 'Confirm Add' : 'Confirm Deduct'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReferralStatistics;

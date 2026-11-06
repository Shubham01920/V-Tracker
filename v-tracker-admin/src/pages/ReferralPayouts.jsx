import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Search, ChevronDown, Calendar, ArrowRight, ChevronLeft, ChevronRight, Table, LayoutGrid } from 'lucide-react';

const generateMockPayouts = () => {
  const payouts = [];
  const names = ['Priya R K', 'Rahul Sharma', 'Amit Kumar', 'Neha Gupta', 'Suresh Raina', 'Vikram Patel', 'Anjali Desai'];
  const emails = ['akshaykumbi237@gmail.com', 'rahul23@gmail.com', 'amitk@gmail.com', 'neha.g@gmail.com', 'suresh.r@gmail.com', 'vikram.p@gmail.com', 'anjali.d@gmail.com'];
  
  for (let i = 1; i <= 15; i++) {
    const fromIndex = Math.floor(Math.random() * names.length);
    let toIndex = Math.floor(Math.random() * names.length);
    while (toIndex === fromIndex) toIndex = Math.floor(Math.random() * names.length);

    payouts.push({
      id: i,
      date: `${Math.floor(1 + Math.random() * 28)} Aug 2026, 12:05 pm`,
      level: Math.floor(1 + Math.random() * 10),
      amount: (Math.floor(1 + Math.random() * 5) * 10).toFixed(2),
      status: Math.random() > 0.3 ? 'Credited' : 'Pending',
      fromUserName: names[fromIndex],
      fromUserEmail: emails[fromIndex],
      toUserName: names[toIndex],
      toUserEmail: emails[toIndex],
      fromUserId: `S1-${Math.floor(1000 + Math.random() * 9000)}`,
      toUserId: `S1-${Math.floor(1000 + Math.random() * 9000)}`
    });
  }
  return payouts;
};

const mockPayouts = generateMockPayouts();

const ReferralPayouts = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const recordsPerPage = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const loggedInUser = getLoggedInUser();

  const getLevelStyle = (level) => {
    switch(level) {
      case 10: return 'bg-gray-100 text-gray-600';
      case 9: return 'bg-teal-50 text-teal-500 border-teal-100';
      case 8: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 7: return 'bg-red-50 text-red-500 border-red-100';
      case 6: return 'bg-blue-50 text-blue-500 border-blue-100';
      case 5: return 'bg-pink-50 text-pink-500 border-pink-100';
      case 4: return 'bg-purple-50 text-purple-500 border-purple-100';
      case 3: return 'bg-indigo-50 text-indigo-500 border-indigo-100';
      case 2: return 'bg-orange-50 text-orange-500 border-orange-100';
      case 1: return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Pending') {
      return <span className="px-3 py-1 bg-[#fff8e6] text-[#b38600] border border-[#ffeb99] rounded-md text-[11px] font-bold">Pending</span>;
    }
    if (status === 'Credited') {
      return <span className="px-3 py-1 bg-[#e6f4ea] text-[#1e8e3e] border border-[#a8dab5] rounded-md text-[11px] font-bold">Credited</span>;
    }
    return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-md text-[11px] font-bold">{status}</span>;
  };

  // Filter and pagination logic
  const filteredPayouts = mockPayouts.filter(p => 
    p.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.toUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.fromUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.toUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.fromUserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.toUserEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayouts.length / recordsPerPage);
  const currentRecords = filteredPayouts.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // Handle page reset on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} user={loggedInUser} />
        
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* Page Header Outside Box */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-bold text-primary">MLM Referral Payouts</h1>
              </div>
              {/* Refresh button removed as requested */}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative w-full lg:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, user ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-600"
                  />
                </div>
                <div className="w-full lg:w-48 relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-600 focus:outline-none cursor-pointer">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Credited</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="w-full lg:w-48 relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-600 focus:outline-none cursor-pointer">
                    <option>All Levels</option>
                    <option>Level 1</option>
                    <option>Level 2</option>
                    <option>Level 3</option>
                    <option>Level 4</option>
                    <option>Level 5</option>
                    <option>Level 6</option>
                    <option>Level 7</option>
                    <option>Level 8</option>
                    <option>Level 9</option>
                    <option>Level 10</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Recent Payouts Title & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-[15px] font-bold text-primary">Recent Payouts</h2>
                  <span className="text-gray-400 text-sm font-medium">({filteredPayouts.length} payouts)</span>
                </div>

                {/* View Switcher Toggle */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Table View"
                  >
                    <Table className="w-4 h-4" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'cards' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Cards</span>
                  </button>
                </div>
              </div>

              {/* Table View */}
              {viewMode === 'table' && (
                <div 
                  className="overflow-x-auto border border-gray-100 rounded-lg mt-4 [&::-webkit-scrollbar]:hidden" 
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[12px] text-[#6b21a8] bg-[#f8f9ff] border-b border-gray-100 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Level</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">From User</th>
                        <th className="px-6 py-4">To User</th>
                        <th className="px-6 py-4">User IDs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {currentRecords.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-6 py-5 text-[13px] font-bold text-gray-700">
                            {payout.date}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getLevelStyle(payout.level)}`}>
                              Level {payout.level}
                            </span>
                          </td>
                          <td className="px-6 py-5 font-bold text-[#059669] text-base">
                            ₹{payout.amount}
                          </td>
                          <td className="px-6 py-5">
                            {getStatusBadge(payout.status)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-[13px] text-gray-800">{payout.fromUserName}</div>
                            <div className="text-[12px] text-gray-400 mt-0.5">{payout.fromUserEmail}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-[13px] text-gray-800">{payout.toUserName}</div>
                            <div className="text-[12px] text-gray-400 mt-0.5">{payout.toUserEmail}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#eff6ff] text-[#3b82f6] px-2 py-1 rounded text-[11px] font-bold">
                                {payout.fromUserId}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                              <span className="bg-[#ecfdf5] text-[#10b981] px-2 py-1 rounded text-[11px] font-bold">
                                {payout.toUserId}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentRecords.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            No payouts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Card View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {currentRecords.map((payout) => (
                    <div key={payout.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getLevelStyle(payout.level)}`}>
                            Level {payout.level}
                          </span>
                          {getStatusBadge(payout.status)}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-gray-400 font-medium">Payout Amount</span>
                          <span className="font-bold text-[#059669] text-lg">₹{payout.amount}</span>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-2 text-xs">
                          <div>
                            <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">From</span>
                            <span className="font-bold text-gray-800">{payout.fromUserName}</span>
                            <p className="text-[11px] text-gray-400">{payout.fromUserEmail}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">To</span>
                            <span className="font-bold text-gray-800">{payout.toUserName}</span>
                            <p className="text-[11px] text-gray-400">{payout.toUserEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="bg-[#eff6ff] text-[#3b82f6] px-2 py-0.5 rounded font-bold">{payout.fromUserId}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="bg-[#ecfdf5] text-[#10b981] px-2 py-0.5 rounded font-bold">{payout.toUserId}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{payout.date}</span>
                        <span>ID: #{payout.id}</span>
                      </div>
                    </div>
                  ))}
                  {currentRecords.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      No payouts found.
                    </div>
                  )}
                </div>
              )}

              {/* Pagination UI */}
              {filteredPayouts.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, filteredPayouts.length)} of {filteredPayouts.length} entries
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralPayouts;

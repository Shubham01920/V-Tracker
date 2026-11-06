import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { ChevronLeft, ChevronRight, Check, X, Clock, Eye, LayoutGrid, Table } from 'lucide-react';

const mockWithdrawals = Array.from({ length: 15 }).map((_, index) => {
  const statuses = ['Pending', 'Approved', 'Rejected'];
  const status = statuses[index % 3];
  return {
    id: `#${index + 1}`,
    user: {
      name: 'raj',
      memberId: 'LS80484975',
      phone: '9876523210'
    },
    amount: 500 - (index * 10),
    net: 500 - (index * 10),
    bankDetails: {
      bank: 'sbi',
      acc: '234587654',
      ifsc: '3253',
      holder: 'lfbetthr'
    },
    date: '30 Mar 2026, 04:41 pm',
    status: status
  };
});

const Withdraw = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [withdrawalsData, setWithdrawalsData] = useState(mockWithdrawals);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
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

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  const filteredData = activeTab === 'All' 
    ? withdrawalsData 
    : withdrawalsData.filter(item => item.status === activeTab);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + recordsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination on tab change
  };

  const handleStatusChange = (id, newStatus) => {
    setWithdrawalsData(prevData => 
      prevData.map(item => item.id === id ? { ...item, status: newStatus } : item)
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'Rejected':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} user={loggedInUser} />
        
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-2xl font-heading font-bold text-primary mb-6">Withdrawal Requests</h1>

            {/* Header Toolbar & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 w-full md:w-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`cursor-pointer px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      activeTab === tab 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-primary/5 text-gray-600 hover:bg-primary/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center bg-gray-200/80 p-1 rounded-lg shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
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
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>

            {/* Table or Card Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {viewMode === 'table' && (
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">USER</th>
                        <th className="px-6 py-4">AMOUNT</th>
                        <th className="px-6 py-4">NET</th>
                        <th className="px-6 py-4">BANK DETAILS</th>
                        <th className="px-6 py-4">DATE</th>
                        <th className="px-6 py-4 text-center">STATUS</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentData.length > 0 ? (
                        currentData.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-gray-900">{row.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{row.user.name}</div>
                              <div className="text-gray-500 text-xs mt-0.5">{row.user.memberId}</div>
                              <div className="text-gray-500 text-xs">{row.user.phone}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              ₹{row.amount}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              ₹{row.net}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <span className="text-gray-400">Bank:</span> <span className="text-gray-900">{row.bankDetails.bank}</span>
                              </div>
                              <div className="text-sm mt-0.5">
                                <span className="text-gray-400">Acc:</span> <span className="text-gray-900">{row.bankDetails.acc}</span>
                              </div>
                              <div className="text-sm mt-0.5">
                                <span className="text-gray-400">IFSC:</span> <span className="text-gray-900">{row.bankDetails.ifsc}</span>
                              </div>
                              <div className="text-sm mt-0.5">
                                <span className="text-gray-400">Holder:</span> <span className="font-semibold text-gray-900">{row.bankDetails.holder}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {row.date}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-4 py-1.5 text-xs font-semibold rounded-full ${getStatusStyle(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {row.status !== 'Approved' && (
                                  <button onClick={() => handleStatusChange(row.id, 'Approved')} title="Approve" className="cursor-pointer p-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {row.status !== 'Rejected' && (
                                  <button onClick={() => handleStatusChange(row.id, 'Rejected')} title="Reject" className="cursor-pointer p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                {row.status !== 'Pending' && (
                                  <button onClick={() => handleStatusChange(row.id, 'Pending')} title="Mark Pending" className="cursor-pointer p-1.5 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                                    <Clock className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => setSelectedWithdrawal(row)} title="View Detail" className="cursor-pointer p-1.5 text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors ml-2">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                            No records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {viewMode === 'cards' && (
                <div className="p-6 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {currentData.map((row) => (
                      <div key={row.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                              <span className="font-mono text-xs font-bold text-primary">{row.id}</span>
                              <h4 className="font-bold text-gray-900 text-base">{row.user.name}</h4>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(row.status)}`}>
                              {row.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 font-medium block">Amount</span>
                              <span className="font-bold text-gray-900 text-sm">₹{row.amount}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium block">Net Payout</span>
                              <span className="font-bold text-emerald-600 text-sm">₹{row.net}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-2.5 rounded-lg text-xs space-y-1 border border-gray-100">
                            <p className="text-gray-600"><span className="font-medium text-gray-400">Bank:</span> {row.bankDetails.bank.toUpperCase()}</p>
                            <p className="text-gray-600"><span className="font-medium text-gray-400">Acc:</span> {row.bankDetails.acc}</p>
                            <p className="text-gray-600"><span className="font-medium text-gray-400">IFSC:</span> {row.bankDetails.ifsc}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">{row.date}</span>
                          <div className="flex items-center gap-1.5">
                            {row.status !== 'Approved' && (
                              <button onClick={() => handleStatusChange(row.id, 'Approved')} title="Approve" className="cursor-pointer p-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {row.status !== 'Rejected' && (
                              <button onClick={() => handleStatusChange(row.id, 'Rejected')} title="Reject" className="cursor-pointer p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setSelectedWithdrawal(row)} title="View Detail" className="cursor-pointer p-1.5 text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {currentData.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500 font-medium">No records found.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50">
                  <span className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredData.length)} of {filteredData.length} records
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* View Detail Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg text-primary">Withdrawal Details</h3>
              <button onClick={() => setSelectedWithdrawal(null)} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Request ID</span>
                <span className="font-bold text-gray-900">{selectedWithdrawal.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Status</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedWithdrawal.status)}`}>
                  {selectedWithdrawal.status}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">User Info</h4>
                  <p className="font-semibold text-gray-900">{selectedWithdrawal.user.name}</p>
                  <p className="text-sm text-gray-500">ID: {selectedWithdrawal.user.memberId}</p>
                  <p className="text-sm text-gray-500">Phone: {selectedWithdrawal.user.phone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Financials</h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Amount Requested</span>
                    <span className="font-medium">₹{selectedWithdrawal.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Net Payable</span>
                    <span className="font-bold text-green-600">₹{selectedWithdrawal.net}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Details</h4>
                  <p className="text-sm text-gray-600"><span className="text-gray-400 w-16 inline-block">Bank:</span> {selectedWithdrawal.bankDetails.bank}</p>
                  <p className="text-sm text-gray-600"><span className="text-gray-400 w-16 inline-block">Account:</span> {selectedWithdrawal.bankDetails.acc}</p>
                  <p className="text-sm text-gray-600"><span className="text-gray-400 w-16 inline-block">IFSC:</span> {selectedWithdrawal.bankDetails.ifsc}</p>
                  <p className="text-sm text-gray-600"><span className="text-gray-400 w-16 inline-block">Holder:</span> <span className="font-medium text-gray-900">{selectedWithdrawal.bankDetails.holder}</span></p>
                </div>
              </div>
              <div className="text-xs text-center text-gray-400 pt-4">
                Requested on {selectedWithdrawal.date}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => setSelectedWithdrawal(null)}
                className="cursor-pointer flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;

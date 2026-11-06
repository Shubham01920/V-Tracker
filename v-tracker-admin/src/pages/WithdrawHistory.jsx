import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Building2,
  Smartphone,
  Search,
  Filter
} from 'lucide-react';

const WithdrawHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const [activeTab, setActiveTab] = useState('All');

  // Mock Data
  const totalPaidOut = 10700.00;
  const pendingPayout = 1200.00;

  const transactions = [
    {
      id: 'TXN9842103981',
      amount: 1200.00,
      status: 'PENDING',
      timestamp: '28 Jul 2026, 04:15 PM',
      mode: 'IMPS',
      destination: 'HDFC Bank •••• 4829'
    },
    {
      id: 'TXN9842103980',
      amount: 5000.00,
      status: 'COMPLETED',
      timestamp: '25 Jul 2026, 11:30 AM',
      mode: 'UPI',
      destination: 'shubham@okhdfc'
    },
    {
      id: 'TXN9842103979',
      amount: 2500.00,
      status: 'FAILED',
      timestamp: '20 Jul 2026, 02:45 PM',
      mode: 'IMPS',
      destination: 'ICICI Bank •••• 1122',
      reason: 'Invalid IFSC Code'
    },
    {
      id: 'TXN9842103978',
      amount: 3200.00,
      status: 'COMPLETED',
      timestamp: '15 Jul 2026, 09:15 AM',
      mode: 'IMPS',
      destination: 'HDFC Bank •••• 4829'
    },
  ];

  const filteredTransactions = activeTab === 'All' 
    ? transactions 
    : transactions.filter(t => t.status === activeTab.toUpperCase());

  const getStatusConfig = (status) => {
    switch(status) {
      case 'COMPLETED':
        return { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600', label: 'Completed' };
      case 'PENDING':
        return { icon: Clock, bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pending' };
      case 'FAILED':
        return { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', label: 'Failed' };
      default:
        return { icon: Clock, bg: 'bg-gray-50', text: 'text-gray-600', label: status };
    }
  };

  const tabs = ['All', 'Completed', 'Pending', 'Failed'];

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} user={loggedInUser} />
        <div className="flex-1 p-4 lg:p-8 space-y-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/withdraw')}
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">Withdrawal History</h1>
            <p className="text-sm text-gray-500 mt-1">Track your past and pending payouts</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Paid Out</p>
              <h3 className="text-2xl font-bold text-green-600">₹{totalPaidOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Payout</p>
              <h3 className="text-2xl font-bold text-yellow-600">₹{pendingPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & List Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-gray-100">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => {
                const status = getStatusConfig(txn.status);
                const ModeIcon = txn.mode === 'IMPS' ? Building2 : Smartphone;
                
                return (
                  <div key={txn.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Status Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${status.bg} ${status.text}`}>
                        <status.icon className="w-5 h-5" />
                      </div>
                      
                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">{txn.id}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                          <span className="font-semibold text-gray-900">{txn.destination}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="text-gray-500">{txn.timestamp}</span>
                        </div>
                        {txn.reason && (
                          <p className="text-xs text-red-500 mt-1">{txn.reason}</p>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center sm:items-end justify-between sm:flex-col ml-14 sm:ml-0">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <ModeIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{txn.mode}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">No transactions found</p>
                <p className="text-sm">There are no {activeTab !== 'All' ? activeTab.toLowerCase() : ''} withdrawals at this time.</p>
              </div>
            )}
          </div>
        </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WithdrawHistory;

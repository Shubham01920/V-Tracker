import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import UserDrawer from '../components/users/UserDrawer';
import { mockUsers } from '../data/mockUsers';
import {
  Search, Download, MoreVertical,
  TrendingUp, Minus, ChevronLeft, ChevronRight, LayoutGrid, Table,
  Loader2, Users as UsersIcon, CheckCircle2, ShieldAlert
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const Users = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('All Users');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [usersList, setUsersList] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, disabled: 0 });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const itemsPerPage = 20;

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const getInitials = (name) => {
    if (!name) return 'VT';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
    'bg-indigo-100 text-indigo-700',
  ];

  const processUserItems = (items = [], rawSummary = null, rawMeta = null) => {
    // Filter out ADMIN and SYSTEM accounts - this table is only for customers/users
    // Admins are viewed and managed via their separate Profile page
    const customerItems = items.filter((u) => {
      const r = (u.role || '').toUpperCase();
      return r !== 'ADMIN' && r !== 'SYSTEM' && r !== 'SUPERADMIN';
    });

    if (customerItems.length > 0) {
      const mappedUsers = customerItems.map((u, i) => ({
        id: u.id,
        memberId: u.memberId || u.id,
        name: u.fullName || u.email || 'User',
        fullName: u.fullName,
        initial: getInitials(u.fullName || u.email),
        color: colors[i % colors.length],
        phone: u.phone || 'N/A',
        email: u.email || 'N/A',
        vehicles: u.vehicleCount ?? 0,
        totalOrders: u.orderCount ?? 0,
        referrals: u.directReferrals ?? 0,
        status: (u.status || 'ACTIVE').toUpperCase(),
        kycStatus: u.kycStatus || 'NOT_SUBMITTED',
        rechargePlan: u.isActiveMember ? 'Active Member' : 'Standard',
        city: u.city || '',
        state: u.state || '',
        createdAt: u.createdAt,
        raw: u,
      }));

      setUsersList(mappedUsers);
      setSummary({
        total: customerItems.length,
        active: customerItems.filter((u) => (u.status || '').toUpperCase() === 'ACTIVE').length,
        disabled: customerItems.filter((u) => (u.status || '').toUpperCase() === 'DISABLED').length,
      });
      if (rawMeta) {
        setMeta(rawMeta);
      }
    } else {
      // If DB has 0 customer accounts (e.g. only admin accounts seeded), fallback to 1 dummy entry
      fallbackToMock();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');

    try {
      // ADM-04 query params from backend: q, status, page, limit
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      if (activeTab === 'Active') {
        params.status = 'ACTIVE';
      } else if (activeTab === 'Blocked / Suspended') {
        params.status = 'DISABLED';
      }

      const res = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params,
      });

      if (res.data?.data) {
        processUserItems(res.data.data.items, res.data.data.summary, res.data.meta);
      } else {
        fallbackToMock();
      }
    } catch (err) {
      console.warn('Live /v1/admin/users API fetch error:', err.message);
      // Attempt silent token refresh if 401
      if (err.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
            const newTokens = refreshRes.data?.data;
            if (newTokens?.accessToken) {
              localStorage.setItem('accessToken', newTokens.accessToken);
              if (newTokens.refreshToken) {
                localStorage.setItem('refreshToken', newTokens.refreshToken);
              }
              const retryRes = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${newTokens.accessToken}` },
              });
              if (retryRes.data?.data) {
                processUserItems(retryRes.data.data.items, retryRes.data.data.summary, retryRes.data.meta);
                return;
              }
            }
          } catch (rErr) {
            console.error('Refresh token error:', rErr);
          }
        }
      }
      fallbackToMock();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToMock = () => {
    setUsersList(mockUsers);
    setSummary({
      total: mockUsers.length,
      active: mockUsers.filter((u) => u.status === 'Active' || u.status === 'ACTIVE').length,
      disabled: mockUsers.filter((u) => u.status === 'Blocked' || u.status === 'DISABLED').length,
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, activeTab]);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Active</span>;
    }
    if (s === 'INACTIVE' || s === 'DORMANT') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Inactive</span>;
    }
    if (s === 'BLOCKED' || s === 'DISABLED' || s === 'SUSPENDED') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Blocked</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{status}</span>;
  };

  // Client side fallback filtering for instant keystroke response
  const filteredUsers = usersList.filter((user) => {
    const s = (user.status || '').toUpperCase();
    let matchesTab = true;
    if (activeTab === 'Active') {
      matchesTab = s === 'ACTIVE';
    } else if (activeTab === 'Inactive (Dormant)') {
      matchesTab = s === 'INACTIVE' || s === 'DORMANT';
    } else if (activeTab === 'Blocked / Suspended') {
      matchesTab = s === 'BLOCKED' || s === 'DISABLED' || s === 'SUSPENDED';
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.id && user.id.toLowerCase().includes(q)) ||
      (user.memberId && user.memberId.toLowerCase().includes(q)) ||
      (user.phone && user.phone.includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  const totalPages = Math.max(1, meta?.total ? Math.ceil(meta.total / itemsPerPage) : Math.ceil(filteredUsers.length / itemsPerPage));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900">User Management</h2>
              <p className="text-xs text-gray-500 mt-1">
                View, audit and manage registered vehicle owners and app users
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, Email, or Mobile..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
            </form>
          </div>

          {/* Summary Metric Pills */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
                <p className="text-xl sm:text-2xl font-extrabold text-gray-900 font-heading mt-0.5">
                  {summary.total || usersList.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Users</p>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-heading mt-0.5">
                  {summary.active}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Disabled / Blocked</p>
                <p className="text-xl sm:text-2xl font-extrabold text-red-600 font-heading mt-0.5">
                  {summary.disabled}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Tabs & View Controls */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 w-full xl:w-auto overflow-x-auto scrollbar-hide">
              {['All Users', 'Active', 'Inactive (Dormant)', 'Blocked / Suspended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center bg-gray-200/80 p-1 rounded-lg shrink-0">
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

              <button className="cursor-pointer flex-1 xl:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Table / Cards Content */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {loading && usersList.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-gray-600">Loading user records from server...</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Member ID</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">Vehicles</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Plan / Role</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">Orders</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">Referrals</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Status</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-4 py-3.5 font-mono text-sm text-primary font-bold whitespace-nowrap">
                          {user.memberId || user.id}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.color}`}>
                              {user.initial}
                            </div>
                            <span className="font-semibold text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{user.phone}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700">
                            {user.vehicles}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {user.rechargePlan}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span className="text-sm font-bold text-gray-700">{user.totalOrders}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className={`inline-flex items-center gap-1.5 ${user.referrals > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {user.referrals > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                            <span className="text-sm font-bold">{user.referrals}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center text-gray-500 font-medium">
                          No users found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Card View */
              <div className="p-6 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${user.color}`}>
                              {user.initial}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{user.name}</h4>
                              <p className="font-mono text-xs text-primary font-bold">{user.memberId || user.id}</p>
                            </div>
                          </div>
                          {getStatusBadge(user.status)}
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <p className="text-gray-800 font-semibold">{user.phone}</p>
                          <p className="text-gray-500 font-medium">{user.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                          <div>
                            <span className="text-gray-500 font-medium block">Vehicles</span>
                            <span className="font-bold text-gray-900">{user.vehicles}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Plan</span>
                            <span className="font-semibold text-gray-800">{user.rechargePlan}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Orders</span>
                            <span className="font-bold text-gray-900">{user.totalOrders}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Referrals</span>
                            <span className="font-bold text-emerald-600">{user.referrals}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                        <button className="cursor-pointer text-xs font-bold text-primary hover:underline flex items-center gap-1">
                          View Details &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium">No users found.</div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">
                  Showing {filteredUsers.length} users
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Drawer Component with Live Detailed API & Actions */}
        <UserDrawer
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={fetchUsers}
        />
      </main>
    </div>
  );
};

export default Users;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import { useWishlist } from '../context/WishlistContext';
import {
  Search, Car, Heart, Trash2, ShieldCheck, CreditCard, Download, Smartphone, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

// Initial Mock data for Wishlist items populated from Android Mobile App
const initialAppWishlistItems = [
  {
    id: 'WSH-101',
    regNumber: 'TS09XX1234',
    ownerName: 'Rahul Sharma',
    appUser: {
      name: 'Alex Thompson',
      phone: '+91 78969 70130',
      email: 'alex.t@example.com',
      date: 'Today, 02:15 PM'
    },
    vehicleType: '4 Wheeler',
    linkedQR: 'QR-001249-X',
    activePlan: 'Premium Annual',
    registrationDate: '12 Jan 2023',
    docStatus: 'Verified',
    docStatusColor: 'bg-emerald-100 text-emerald-700',
    routingActive: true
  },
  {
    id: 'WSH-102',
    regNumber: 'KA03EF3456',
    ownerName: 'Sneha Reddy',
    appUser: {
      name: 'Elena Rodriguez',
      phone: '+91 81529 92324',
      email: 'e.rodriguez@fleet.com',
      date: 'Yesterday, 06:40 PM'
    },
    vehicleType: '3 Wheeler',
    linkedQR: 'QR-001251-X',
    activePlan: 'Standard Annual',
    registrationDate: '18 Aug 2023',
    docStatus: 'Verified',
    docStatusColor: 'bg-emerald-100 text-emerald-700',
    routingActive: true
  },
  {
    id: 'WSH-103',
    regNumber: 'MH02AB5678',
    ownerName: 'Priya Patel',
    appUser: {
      name: 'Michael Ross',
      phone: '+91 65291 44185',
      email: 'm.ross@logistics.net',
      date: '16 Aug 2026, 11:20 AM'
    },
    vehicleType: '2 Wheeler',
    linkedQR: 'QR-000842-R',
    activePlan: 'Basic Monthly',
    registrationDate: '05 Mar 2023',
    docStatus: 'Pending',
    docStatusColor: 'bg-orange-100 text-orange-700',
    routingActive: true
  },
  {
    id: 'WSH-104',
    regNumber: 'GJ05GH7890',
    ownerName: 'Vikram Desai',
    appUser: {
      name: 'Robert King',
      phone: '+91 61272 95880',
      email: 'r.king@freight.net',
      date: '14 Aug 2026, 04:10 PM'
    },
    vehicleType: 'Commercial',
    linkedQR: 'QR-001252-X',
    activePlan: 'Fleet Pro',
    registrationDate: '09 Sep 2022',
    docStatus: 'Verified',
    docStatusColor: 'bg-emerald-100 text-emerald-700',
    routingActive: true
  }
];

const Wishlist = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const { markWishlistAsRead } = useWishlist();

  // Wishlist items state coming from App Users
  const [wishlistItems, setWishlistItems] = useState(initialAppWishlistItems);
  const location = useLocation();

  // Mark sidebar notification badge as read when opening this page
  useEffect(() => {
    markWishlistAsRead();
  }, []);

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  // Apply search query & type/status filters
  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.appUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.linkedQR.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || item.vehicleType === typeFilter;
    const matchesStatus = statusFilter === 'All' || item.docStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleClearAll = () => {
    if (wishlistItems.length === 0) return;
    setWishlistItems([]);
    toast.success('All Wishlist records cleared');
  };

  const handleExportCSV = () => {
    if (wishlistItems.length === 0) return toast.error('No wishlist records to export');
    const headers = ['Registration Number,Owner Name,Wishlisted By,App Contact,Vehicle Type,Linked QR,Active Plan,Reg Date,Document Status\n'];
    const rows = wishlistItems.map(v =>
      `"${v.regNumber}","${v.ownerName}","${v.appUser.name}","${v.appUser.phone}","${v.vehicleType}","${v.linkedQR}","${v.activePlan}","${v.registrationDate}","${v.docStatus}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `v-tracker-app-wishlist-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('App Wishlist exported successfully');
  };

  // Stats calculation
  const verifiedCount = wishlistItems.filter(v => v.docStatus === 'Verified').length;
  const fourWheelerCount = wishlistItems.filter(v => v.vehicleType === '4 Wheeler').length;
  const activePlanCount = wishlistItems.filter(v => v.activePlan && v.activePlan !== 'None').length;

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 space-y-6">

          {/* Top Banner / Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">App User Wishlist</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Smartphone className="w-3.5 h-3.5 text-primary" /> Live vehicle bookmarks synced from Android Application users
                  </p>
                </div>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gray-500" /> Export CSV
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              </div>
            )}
          </div>

          {/* Stat Overview Cards using Dashboard StatCard Component Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Total App Wishlisted"
              icon={Heart}
              value={wishlistItems.length.toString()}
              trend={<span className="text-primary font-semibold">Synced from Android App</span>}
              colorScheme="purple"
            />
            <StatCard
              title="Verified Documents"
              icon={ShieldCheck}
              value={verifiedCount.toString()}
              trend={<span className="text-green-600 font-semibold">{wishlistItems.length ? Math.round((verifiedCount / wishlistItems.length) * 100) : 0}% Compliant</span>}
              colorScheme="green"
            />
            <StatCard
              title="4 Wheelers"
              icon={Car}
              value={fourWheelerCount.toString()}
              trend={<span className="text-blue-600 font-semibold">Active Fleet Items</span>}
              colorScheme="blue"
            />
            <StatCard
              title="Active Subscriptions"
              icon={CreditCard}
              value={activePlanCount.toString()}
              trend={<span className="text-orange-600 font-semibold">Premium & Standard</span>}
              colorScheme="orange"
            />
          </div>

          {/* Filter & Table Section - Matching Vehicles & Dashboard Table Design */}
          <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
            {/* Header & Controls */}
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900">Wishlisted Vehicles Registry</h3>
                <span className="bg-primary/10 text-primary font-bold text-xs px-2.5 py-0.5 rounded-full ml-1">
                  {filteredItems.length}
                </span>
              </div>

              {/* Controls Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {/* Search input */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search reg no, owner, user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Filter Type */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer shadow-sm appearance-none pr-8"
                    >
                      <option value="All">All Types</option>
                      <option value="4 Wheeler">4 Wheeler</option>
                      <option value="2 Wheeler">2 Wheeler</option>
                      <option value="3 Wheeler">3 Wheeler</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Filter Status */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer shadow-sm appearance-none pr-8"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop & Tablet Table View */}
            <div className="hidden md:block overflow-x-auto scrollbar-hide flex-1">
              <table className="w-full text-left border-collapse relative min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Number</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Name</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Wishlisted By (App User)</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Linked QR Tag</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Plan</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reg. Date</th>
                    <th className="px-4 lg:px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 lg:px-5 py-4">
                        <div className="font-mono text-sm text-primary font-bold">{item.regNumber}</div>
                        {!item.routingActive && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Routing Disabled</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-5 py-4 text-sm text-gray-900 font-semibold">{item.ownerName}</td>

                      {/* App User Info */}
                      <td className="px-4 lg:px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {item.appUser.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.appUser.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{item.appUser.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 lg:px-5 py-4 text-sm text-gray-700">{item.vehicleType}</td>
                      <td className="px-4 lg:px-5 py-4 text-sm font-mono text-gray-500">{item.linkedQR}</td>
                      <td className="px-4 lg:px-5 py-4 text-sm text-gray-700 font-medium">{item.activePlan}</td>
                      <td className="px-4 lg:px-5 py-4 text-sm text-gray-600">{item.registrationDate}</td>
                      <td className="px-4 lg:px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.docStatusColor}`}>
                          {item.docStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-medium">No wishlisted vehicle records found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="block md:hidden divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 space-y-3 bg-white hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-base font-bold text-primary">{item.regNumber}</div>
                      <div className="text-xs text-gray-500 font-semibold">Owner: {item.ownerName}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.docStatusColor}`}>
                      {item.docStatus}
                    </span>
                  </div>

                  <div className="bg-primary/5 p-2.5 rounded-lg text-xs flex items-center justify-between border border-primary/10">
                    <span className="text-gray-500 text-[11px] font-medium">Wishlisted By App User:</span>
                    <span className="font-bold text-primary">{item.appUser.name} ({item.appUser.phone})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Type</span>
                      <span className="font-semibold text-gray-800">{item.vehicleType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">QR Tag</span>
                      <span className="font-mono text-gray-700">{item.linkedQR}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Active Plan</span>
                      <span className="font-semibold text-gray-800">{item.activePlan}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Reg. Date</span>
                      <span className="text-gray-700">{item.registrationDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="px-6 py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-lg font-bold text-gray-900">No Wishlisted Records Found</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    No vehicle bookmarks recorded from Android App users matching your filter criteria.
                  </p>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default Wishlist;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import OrderDispatchDrawer from '../components/orders/OrderDispatchDrawer';
import { mockOrders } from '../data/mockOrders';
import {
  Search, Filter, ShoppingCart, Send, MapPin, IndianRupee, CreditCard, Box, ChevronDown, LayoutGrid, Table, FileText, Printer
} from 'lucide-react';

import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const Orders = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [loading, setLoading] = useState(false);
  
  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleOpenInvoice = (order) => {
    const invoiceId = order.dbId || order.id;
    window.open(`/invoice/${invoiceId}`, '_blank');
  };

  const location = useLocation();

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const tabs = ['All', 'New Orders', 'Processing', 'Dispatched', 'Delivered', 'Returns'];

  // Map backend order object to UI order shape
  const mapApiOrder = (o) => {
    let mappedStatus = 'New Orders';
    const s = (o.status || '').toUpperCase();
    if (s === 'PROCESSING') {
      mappedStatus = 'Processing';
    } else if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s)) {
      mappedStatus = 'Dispatched';
    } else if (s === 'DELIVERED') {
      mappedStatus = 'Delivered';
    } else if (['CANCELLED', 'REFUNDED'].includes(s)) {
      mappedStatus = 'Returns';
    } else {
      mappedStatus = 'New Orders'; // PAID or PENDING_PAYMENT
    }

    let paymentStatus = 'Paid';
    const ps = (o.paymentStatus || '').toUpperCase();
    if (ps === 'CAPTURED' || ps === 'PAID') {
      paymentStatus = 'Paid';
    } else if (ps === 'REFUNDED') {
      paymentStatus = 'Refunded';
    } else if (ps === 'PENDING') {
      paymentStatus = 'Pending';
    }

    const totalAmt = o.totalPaise ? o.totalPaise / 100 : 0;
    const gstAmt = totalAmt > 0 ? (totalAmt * 0.18) / 1.18 : 0;

    let vehicleCategory = 'Car';
    if (o.itemsSummary?.toLowerCase().includes('2 wheeler') || o.itemsSummary?.toLowerCase().includes('bike')) {
      vehicleCategory = 'Bike';
    } else if (o.itemsSummary?.toLowerCase().includes('commercial') || o.itemsSummary?.toLowerCase().includes('truck')) {
      vehicleCategory = 'Truck';
    }

    return {
      id: o.orderNumber || o.id,
      dbId: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer?.fullName || o.shipTo?.name || 'Customer',
      packageType: o.itemsSummary || 'V-Tracker QR Package',
      vehicleCategory,
      deliveryAddress: o.shipTo
        ? `${o.shipTo.name ? o.shipTo.name + ', ' : ''}${o.shipTo.city || ''} ${o.shipTo.pincode || ''}`.trim()
        : 'Address not specified',
      paymentStatus,
      gstAmount: parseFloat(gstAmt.toFixed(2)),
      totalAmount: parseFloat(totalAmt.toFixed(2)),
      status: mappedStatus,
      rawStatus: o.status,
      _raw: o,
    };
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: getAuthHeader(),
      });

      if (res.data?.data?.items && Array.isArray(res.data.data.items)) {
        const mapped = res.data.data.items.map(mapApiOrder);
        // If API returns 0 orders, show 1 dummy order so admin can see expected structure
        setOrders(mapped.length > 0 ? mapped : mockOrders);
      } else {
        setOrders(mockOrders);
      }
    } catch (err) {
      console.warn('Live /v1/admin/orders fetch error, fallback to mock:', err.message);
      // Attempt silent refresh if 401
      if (err.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
            const newTokens = refreshRes.data?.data;
            if (newTokens?.accessToken) {
              localStorage.setItem('accessToken', newTokens.accessToken);
              const retryRes = await axios.get(`${API_BASE_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${newTokens.accessToken}` },
              });
              if (retryRes.data?.data?.items) {
                const mapped = retryRes.data.data.items.map(mapApiOrder);
                setOrders(mapped.length > 0 ? mapped : mockOrders);
                return;
              }
            }
          } catch (rErr) {
            console.error('Silent refresh failed:', rErr);
          }
        }
      }
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New Orders': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Dispatched': return 'bg-amber-100 text-amber-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      case 'Returns': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Refunded': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const handleDispatchOrder = (orderId, dispatchData) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: dispatchData.status } : o));
    fetchOrders();
  };

  const statusMapToBackend = {
    'New Orders': 'PROCESSING',
    'Processing': 'PROCESSING',
    'Dispatched': 'SHIPPED',
    'Delivered': 'DELIVERED',
    'Returns': 'CANCELLED',
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const dbId = targetOrder?.dbId || orderId;
    const backendStatus = statusMapToBackend[newStatus] || newStatus;

    // Optimistic UI update
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      await axios.patch(
        `${API_BASE_URL}/admin/orders/${dbId}/status`,
        {
          status: backendStatus,
          note: `Status updated to ${newStatus} by admin`,
        },
        { headers: getAuthHeader() }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('Update order status error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error?.message || `Failed to update status to ${newStatus}`;
      toast.error(msg);
      // Revert if API failed
      if (targetOrder) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: targetOrder.status } : o));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900">Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and dispatch customer orders</p>
            </div>
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Name, or Address..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filter Tabs & View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 pb-2 md:pb-0 w-full md:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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

          {/* Orders Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {viewMode === 'table' && (
              <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package & Vehicle</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Details</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{order.id}</span>
                            <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm text-gray-700">
                              <Box className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                              {order.packageType}
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md w-fit">
                              {order.vehicleCategory}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start max-w-[250px]">
                            <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 line-clamp-2" title={order.deliveryAddress}>
                              {order.deliveryAddress}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center text-sm font-semibold text-gray-900">
                              <IndianRupee className="w-3.5 h-3.5 mr-1 text-gray-500" />
                              {order.totalAmount}
                              <span className="text-xs font-normal text-gray-500 ml-1">(inc ₹{order.gstAmount} GST)</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit ${getPaymentBadge(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm w-max ${getStatusBadge(order.status)}`}>
                            <span>{order.status === 'Returns' ? 'Cancelled / Returns' : order.status === 'New Orders' ? 'Placed' : order.status}</span>
                            <ChevronDown className="w-3.5 h-3.5 pointer-events-none" />
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                            >
                              <option value="New Orders">Placed</option>
                              <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Returns">Cancelled / Returns</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenInvoice(order)}
                              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                              title="Generate Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {(order.status === 'New Orders' || order.status === 'Processing') ? (
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                                Dispatch
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed"
                              >
                                <Send className="w-4 h-4" />
                                Dispatched
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'cards' && (
              <div className="p-6 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                          <div>
                            <span className="font-bold text-primary text-sm">{order.id}</span>
                            <h4 className="font-bold text-gray-900 text-base">{order.customerName}</h4>
                          </div>
                          <div className={`relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                            <span>{order.status === 'Returns' ? 'Cancelled / Returns' : order.status === 'New Orders' ? 'Placed' : order.status}</span>
                            <ChevronDown className="w-3 h-3 pointer-events-none" />
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                            >
                              <option value="New Orders">Placed</option>
                              <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Returns">Cancelled / Returns</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Package:</span>
                            <span className="font-semibold text-gray-900">{order.packageType} ({order.vehicleCategory})</span>
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-gray-500">Address:</span>
                            <span className="font-medium text-gray-700 text-right line-clamp-2">{order.deliveryAddress}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center text-sm font-bold text-gray-900">
                            <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
                            {order.totalAmount}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPaymentBadge(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenInvoice(order)}
                          className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Invoice
                        </button>
                        {(order.status === 'New Orders' || order.status === 'Processing') ? (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Dispatch Order
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed"
                          >
                            Dispatched
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filteredOrders.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
                <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-lg font-medium text-gray-900">No orders found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <OrderDispatchDrawer
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onDispatch={handleDispatchOrder}
      />
    </div>
  );
};

export default Orders;

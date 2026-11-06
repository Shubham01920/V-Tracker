import React, { useState } from 'react';
import axios from 'axios';
import {
  X, Package, QrCode, Truck, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const OrderDispatchDrawer = ({ selectedOrder, onClose, onDispatch }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [qrTag1, setQrTag1] = useState('');
  const [qrTag2, setQrTag2] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!selectedOrder) return null;

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!serialNumber || !qrTag1 || !qrTag2 || !courierPartner || !trackingNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    const dbId = selectedOrder.dbId || selectedOrder.id;
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const note = `Dispatched via ${courierPartner} (AWB: ${trackingNumber.trim()}) | Device SN: ${serialNumber.trim()} | QR: ${qrTag1.trim()}, ${qrTag2.trim()}`;

      await axios.patch(
        `${API_BASE_URL}/admin/orders/${dbId}/status`,
        {
          status: 'SHIPPED',
          note,
          location: 'Warehouse',
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      toast.success(`Order ${selectedOrder.id} dispatched! Push notification sent to user.`);
      onDispatch(selectedOrder.id, {
        serialNumber,
        qrTag1,
        qrTag2,
        courierPartner,
        trackingNumber,
        status: 'Dispatched',
      });
      onClose();
    } catch (err) {
      console.error('Dispatch order error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to dispatch order';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity cursor-pointer"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white z-[60] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col border-l border-gray-200 ${selectedOrder ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-heading font-bold text-xl text-gray-900">Dispatch Order</h3>
            <p className="font-mono text-sm font-semibold text-primary mt-1">{selectedOrder.id}</p>
          </div>
          <button
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <form id="dispatch-form" onSubmit={handleDispatch} className="space-y-8">
            
            {/* Customer Details Summary */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Package:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedOrder.packageType}</span>
                </div>
              </div>
            </div>

            {/* GPS Device Assignment */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-gray-800">1. Assign GPS Device</h4>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Device Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter or scan SN (e.g. VT-89382)"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* QR Tag Assignment */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-gray-800">2. Assign QR Tags</h4>
                <span className="text-xs text-gray-400 font-normal ml-auto">From unassigned batch</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">QR Tag 1 ID</label>
                  <input
                    type="text"
                    value={qrTag1}
                    onChange={(e) => setQrTag1(e.target.value)}
                    placeholder="Scan first QR tag"
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">QR Tag 2 ID</label>
                  <input
                    type="text"
                    value={qrTag2}
                    onChange={(e) => setQrTag2(e.target.value)}
                    placeholder="Scan second QR tag"
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Courier Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-gray-800">3. Shipping Details</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Courier Partner</label>
                  <select
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>Select Courier</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Bluedart">Bluedart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="India Post">India Post</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter AWB or Tracking No."
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Dispatching this order will permanently assign these devices and send a push notification to the user's app.
              </p>
            </div>
            
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="dispatch-form"
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderDispatchDrawer;

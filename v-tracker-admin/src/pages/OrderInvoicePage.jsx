import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Printer, Download, FileText, IndianRupee, ArrowLeft, PenTool, Check, Trash2, X, Loader2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { mockOrders } from '../data/mockOrders';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

const OrderInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const signaturePadRef = useRef(null);

  const [signatureData, setSignatureData] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [useCompanySeal, setUseCompanySeal] = useState(false);
  const [order, setOrder] = useState(() => mockOrders.find(o => o.id === id) || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_BASE_URL}/admin/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const d = res.data?.data;
        if (d) {
          const totalAmt = d.totals?.totalPaise ? d.totals.totalPaise / 100 : 0;
          const taxAmt = d.totals?.taxPaise ? d.totals.taxPaise / 100 : 0;
          const deliveryAddr = d.address
            ? `${d.address.line1 || ''}, ${d.address.city || ''}, ${d.address.state || ''} ${d.address.pincode || ''}`.replace(/^,\s*/, '').trim()
            : 'Address not specified';

          const primaryLine = d.lines?.[0];
          let vehicleCat = primaryLine?.category || 'Car';
          if (vehicleCat === 'FOUR_WHEELER') vehicleCat = 'Car';
          else if (vehicleCat === 'TWO_WHEELER') vehicleCat = 'Bike';
          else if (vehicleCat === 'COMMERCIAL') vehicleCat = 'Truck';

          const isPaid = (d.payment?.status === 'CAPTURED' || d.paymentStatus === 'CAPTURED' || d.status === 'PAID');

          const mapped = {
            id: d.orderNumber || d.id,
            dbId: d.id,
            customerName: d.customer?.fullName || d.address?.name || 'Customer',
            packageType: primaryLine?.title || '4 Wheeler QR Label',
            vehicleCategory: vehicleCat,
            deliveryAddress: deliveryAddr,
            paymentStatus: isPaid ? 'Paid' : 'Pending',
            gstAmount: parseFloat(taxAmt.toFixed(2)),
            totalAmount: parseFloat(totalAmt.toFixed(2)),
            status: d.status,
            _raw: d,
          };
          setOrder(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Live order detail fetch error, fallback to mock:', err.message);
      } finally {
        setLoading(false);
      }

      // Check fallback mock order (show at least 1 dummy order if no dynamic data exists)
      const fallback = mockOrders.find(o => o.id === id) || mockOrders[0];
      if (fallback) {
        setOrder(fallback);
      } else {
        navigate('/orders');
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setSignatureData(signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png'));
      setIsSigning(false);
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800">
      
      {/* Top Action Bar (Hidden on print) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <button 
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      <div className="p-6 md:p-10">
        <div 
          ref={invoiceRef} 
          className="bg-white p-6 sm:p-10 border border-gray-200 shadow-sm rounded-xl mx-auto max-w-4xl font-sans print:border-none print:shadow-none print:p-0"
        >
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-heading font-bold text-4xl shrink-0 print:!bg-primary print:!text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                V
              </div>
              <div>
                <h1 className="font-heading font-bold text-primary tracking-wide text-3xl">V-TRACKER</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enterprise Admin</p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-left md:text-right">
              <h1 className="text-4xl sm:text-5xl font-bold font-heading text-gray-900 mb-4">Invoice</h1>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-gray-400 text-right">Invoice no.:</div>
                <div className="text-gray-900 font-medium text-left">{order.id ? order.id.replace('ORD-', '') : ''}</div>
                <div className="text-gray-400 text-right">Invoice date:</div>
                <div className="text-gray-900 font-medium text-left">{currentDate}</div>
                <div className="text-gray-400 text-right">Due:</div>
                <div className="text-gray-900 font-medium text-left">{currentDate}</div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-sm">
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-base mb-2">From</p>
              <h3 className="font-bold text-gray-900 text-lg">V-Tracker Systems</h3>
              <p className="text-gray-600">admin@v-tracker.com</p>
              <p className="text-gray-600">+91 800-000-0000</p>
              <p className="text-gray-600">v-tracker.com</p>
              <p className="text-gray-600 mt-1">45 Tech Boulevard, Sector 12<br/>New Delhi, 110001, India</p>
            </div>

            <div className="flex flex-col gap-6 md:items-end md:text-right">
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-base mb-2">Bill to</p>
                <h3 className="font-bold text-gray-900 text-lg">{order.customerName}</h3>
                <p className="text-gray-600 max-w-[250px] md:ml-auto">
                  {order.deliveryAddress}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-base mb-1">Ship to</p>
                <p className="text-gray-600 max-w-[250px] md:ml-auto">
                  {order.deliveryAddress}
                </p>
                <p className="text-gray-600 mt-1">Track #: TRK-{order.id.split('-')[2] || order.id.slice(-4) || '9012'}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-primary text-white print:!bg-primary print:!text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-1/2">Description</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center">Category</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr className="bg-white hover:bg-gray-50/30">
                  <td className="py-4 px-4 align-top">
                    <div className="font-medium text-gray-900">{order.packageType}</div>
                    <div className="text-gray-500 mt-1 text-xs">V-Tracker GPS Hardware & Subscription Plan</div>
                  </td>
                  <td className="py-4 px-4 align-top text-center text-gray-700">{order.vehicleCategory}</td>
                  <td className="py-4 px-4 align-top text-right text-gray-900">{(order.totalAmount - order.gstAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="flex flex-col md:flex-row justify-between gap-10">
            
            {/* Payment Instructions & Notes */}
            <div className="w-full md:w-1/2 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Payment instruction</h4>
                <div className="text-sm text-gray-600 space-y-3">
                  <div>
                    <p className="text-gray-500">Paypal email</p>
                    <p className="font-medium text-gray-900">payments@v-tracker.com</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Make checks payable to</p>
                    <p className="font-medium text-gray-900">V-Tracker Systems Pvt Ltd</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bank Transfer</p>
                    <p className="font-medium text-gray-900">Routing (ABA): 061120084<br/>Account: 1234567890</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 leading-relaxed pr-4">
                  Thank you for your business. Prototype-based programming is a style of object-oriented programming in which behaviour reuse is performed via a process of cloning existing objects that serve as prototypes.
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="w-full md:w-1/2 lg:w-2/5 text-sm">
              <div className="space-y-3 px-4">
                <div className="flex justify-between text-gray-600">
                  <span className="font-bold text-gray-900">Subtotal:</span>
                  <span>INR {(order.totalAmount - order.gstAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount (0%):</span>
                  <span>INR 0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Cost:</span>
                  <span>INR 0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Sales Tax (18% GST):</span>
                  <span>INR {order.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total:</span>
                  <span>INR {order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Amount paid:</span>
                  <span>{order.paymentStatus === 'Paid' ? `INR ${order.totalAmount.toFixed(2)}` : 'INR 0.00'}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-gray-900 bg-[#EEF4FF] mt-4 p-4 rounded-lg print:!bg-[#EEF4FF]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <span>Balance Due:</span>
                <span>{order.paymentStatus === 'Paid' ? 'INR 0.00' : `INR ${order.totalAmount.toFixed(2)}`}</span>
              </div>

              {/* Signature Section */}
              <div className="mt-8 flex flex-col items-end px-4">
                <div className="flex items-center gap-2 mb-4 print:hidden">
                  <input 
                    type="checkbox" 
                    id="useSeal" 
                    checked={useCompanySeal}
                    onChange={(e) => setUseCompanySeal(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="useSeal" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Apply V-Tracker Seal & Signature
                  </label>
                </div>

                {useCompanySeal ? (
                  <div className="flex flex-col items-center justify-center border-[3px] border-primary/80 rounded-full w-28 h-28 rotate-[-10deg] opacity-90 mt-2 relative print:!border-primary print:!opacity-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <div className="absolute inset-1 border border-primary/40 rounded-full print:!border-primary"></div>
                    <span className="text-[12px] font-bold text-primary uppercase text-center tracking-tighter leading-tight print:!text-primary">V-Tracker<br/>Systems</span>
                    <span className="text-[8px] text-primary mt-1 border-t border-primary/40 pt-1 tracking-widest font-bold print:!text-primary print:!border-primary">AUTHORIZED</span>
                  </div>
                ) : isSigning ? (
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex flex-col gap-3 print:hidden shadow-sm">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-crosshair">
                      <SignatureCanvas 
                        ref={signaturePadRef} 
                        penColor="black"
                        canvasProps={{width: 300, height: 100, className: 'sigCanvas'}} 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={handleClearSignature} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                      <button onClick={() => setIsSigning(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                        Cancel
                      </button>
                      <button onClick={handleSaveSignature} className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end group relative mt-2">
                    <button 
                      onClick={() => setIsSigning(true)}
                      className="absolute -top-10 right-0 bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden z-10 cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Add Signature
                    </button>
                    
                    {signatureData ? (
                      <div className="relative group/sig">
                        <img 
                          src={signatureData} 
                          alt="Digital Signature" 
                          className="h-16 object-contain" 
                        />
                        <button 
                          onClick={() => setSignatureData(null)}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover/sig:opacity-100 transition-opacity print:hidden cursor-pointer"
                          title="Remove Signature"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" 
                        alt="Default Signature" 
                        className="h-16 opacity-40 group-hover:opacity-80 transition-opacity cursor-pointer" 
                        onClick={() => setIsSigning(true)}
                        title="Click to sign digitally"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoicePage;

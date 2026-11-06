import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { mockVehicles, mockVehicleDocuments } from '../data/mockVehicles';
import {
  FileText, ArrowLeft, Eye, CheckCircle, XCircle, AlertTriangle, X
} from 'lucide-react';
import { toast } from 'sonner';

const VehicleDocuments = () => {
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [documents, setDocuments] = useState([]);
  
  const [previewDoc, setPreviewDoc] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const v = mockVehicles.find(v => v.id === id);
    if (v) setVehicle(v);
    
    if (mockVehicleDocuments[id]) {
      setDocuments(mockVehicleDocuments[id]);
    }
  }, [id]);

  const isExpiredOrExpiringSoon = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { expired: true, text: 'Expired', color: 'text-red-600 bg-red-100 border-red-200' };
    if (diffDays <= 30) return { expired: false, expiringSoon: true, text: `Expiring in ${diffDays} days`, color: 'text-orange-600 bg-orange-100 border-orange-200' };
    return null;
  };

  const handleVerify = (docId) => {
    setDocuments(documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700', rejectionReason: null };
      }
      return doc;
    }));
    toast.success('Document verified successfully.');
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setDocuments(documents.map(doc => {
      if (doc.id === rejectDoc.id) {
        return { ...doc, status: 'Rejected', statusColor: 'bg-red-100 text-red-700', rejectionReason };
      }
      return doc;
    }));
    toast.success('Document rejected. User has been notified to re-upload.');
    setRejectDoc(null);
    setRejectionReason('');
  };

  if (!vehicle) return <div className="p-8 text-center text-gray-500">Loading vehicle details...</div>;

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 space-y-6">
          
          <div className="flex items-center gap-4">
            <Link to="/vehicles" className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">Documents for {vehicle.regNumber}</h2>
              <p className="text-sm text-gray-500 mt-1">Owner: <span className="font-semibold text-gray-700">{vehicle.ownerName}</span> | Vehicle: {vehicle.vehicleType}</p>
            </div>
          </div>

          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2.5 bg-gray-50/50">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900">Uploaded Documents</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {documents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No documents found for this vehicle.</div>
              ) : (
                documents.map(doc => {
                  const expiryInfo = isExpiredOrExpiringSoon(doc.expiryDate);
                  
                  return (
                    <div key={doc.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-gray-900">{doc.type}</h4>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.statusColor}`}>
                            {doc.status}
                          </span>
                          {expiryInfo && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${expiryInfo.color} flex items-center gap-1`}>
                              <AlertTriangle className="w-3 h-3" /> {expiryInfo.text}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                          <p>Document ID: <span className="font-mono text-gray-700">{doc.id}</span></p>
                          <p>Expiry Date: <span className="font-semibold text-gray-700">{doc.expiryDate}</span></p>
                        </div>
                        {doc.rejectionReason && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p><span className="font-semibold">Rejection Reason:</span> {doc.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        
                        {doc.status !== 'Verified' && (
                          <button 
                            onClick={() => handleVerify(doc.id)}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" /> Verify
                          </button>
                        )}
                        
                        {doc.status !== 'Rejected' && (
                          <button 
                            onClick={() => setRejectDoc(doc)}
                            className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{previewDoc.type} Preview</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center overflow-auto">
              {/* Dummy Image Placeholder */}
              <div className="bg-white border-2 border-dashed border-gray-300 w-full h-full max-w-xl max-h-[500px] flex flex-col items-center justify-center text-gray-400 rounded-xl space-y-4">
                <FileText className="w-16 h-16 opacity-50" />
                <p className="font-medium text-lg">Document Preview Area</p>
                <p className="text-sm">({previewDoc.fileUrl})</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectDoc && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Document
              </h3>
              <button onClick={() => setRejectDoc(null)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors cursor-pointer text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You are rejecting the <span className="font-bold text-gray-900">{rejectDoc.type}</span>. Please provide a reason so the owner can correct the issue.
              </p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Rejection Reason</label>
                <textarea
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-sm resize-none"
                  placeholder="e.g., Image is too blurry, expiry date mismatch..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setRejectDoc(null)} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleRejectSubmit} className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleDocuments;

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { mockBatches, mockTags } from '../data/mockQR';
import {
  Search, QrCode, History, ChevronRight, ChevronDown,
  Download, Eye, Package, Filter, Car, Truck, XCircle, ArrowLeft, X,
  AlertTriangle, Unlink, Ban, RefreshCw, LayoutGrid, Table
} from 'lucide-react';
import { MdBrandingWatermark } from 'react-icons/md';
import { toast } from 'sonner';

const QRInventory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomLogo, setIsCustomLogo] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoSize, setLogoSize] = useState('Standard');
  const [generatedBatch, setGeneratedBatch] = useState(null);
  const [vehicleType, setVehicleType] = useState('2 Wheeler');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [batches, setBatches] = useState(mockBatches);
  const [tagViewMode, setTagViewMode] = useState('table'); // 'table' | 'cards'
  const [showAllBatches, setShowAllBatches] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchSearchQuery, setBatchSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, tagId: null });
  const [tags, setTags] = useState(mockTags);
  const [currentPage, setCurrentPage] = useState(1);
  const tagsPerPage = 10;
  const location = useLocation();

  const totalPages = Math.ceil(tags.length / tagsPerPage);
  const paginatedTags = tags.slice((currentPage - 1) * tagsPerPage, currentPage * tagsPerPage);

  const handleAction = (id, actionType) => {
    setTags(tags.map(tag => {
      if (tag.id === id) {
        if (actionType === 'damage') {
          toast.warning(`Tag ${id} marked as Damaged/Lost`);
            return { ...tag, status: 'Damaged', statusColor: 'bg-orange-100 text-orange-700' };
          }
          if (actionType === 'unlink') {
            toast.success(`Tag ${id} unlinked from vehicle`);
            return { ...tag, linkedVehicle: '—', vehicleIcon: null };
          }
        if (actionType === 'reassign') {
          toast.success(`Tag ${id} set for pending re-assignment`);
          return { ...tag, linkedVehicle: 'Pending Re-assignment' };
        }
      }
      return tag;
    }));
    setActiveDropdown(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmation.tagId) {
      setTags(tags.filter(t => t.id !== deleteConfirmation.tagId));
      toast.success(`Tag ${deleteConfirmation.tagId} deleted successfully`);
      setDeleteConfirmation({ isOpen: false, tagId: null });
      setActiveDropdown(null);
    }
  };

  const getVehicleImage = () => {
    switch (vehicleType) {
      case '2 Wheeler': return '/bike-image.jpg';
      case '3 Wheeler': return '/auto-image.jpg';
      case '4 Wheeler': return '/car-image.jpg';
      case 'Commercial': return '/truck-image.jpg';
      default: return '';
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!quantity) return;
    const batchId = '#BATCH-' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedBatch(batchId);

    const newBatch = {
      id: batchId,
      createdDate: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''),
      vehicleType: vehicleType,
      quantity: quantity,
      pricePerUnit: pricePerUnit ? `₹${pricePerUnit}` : '—',
      status: 'Generated',
      statusColor: 'bg-emerald-100 text-emerald-700'
    };
    setBatches([newBatch, ...batches]);
  };

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 space-y-6">

          {/* Breadcrumbs & Title */}
          {!showAllBatches ? (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">QR Inventory</h2>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => setShowAllBatches(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">Batch History</h2>
            </div>
          )}

          {!showAllBatches ? (
            <>
              {/* Top Section: QR Generation Form */}
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Generate New QR Batch</h3>
                      <p className="text-sm text-gray-500 font-medium">Create unique encrypted identifiers for tracking assets.</p>
                    </div>
                  </div>

                  <form className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Vehicle Type</label>
                      <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm cursor-pointer">
                        <option value="2 Wheeler">2 Wheeler</option>
                        <option value="3 Wheeler">3 Wheeler</option>
                        <option value="4 Wheeler">4 Wheeler</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Batch Quantity</label>
                      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 500" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Price per Tag / QR (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                        <input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} placeholder="e.g. 199" className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                      </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                          <MdBrandingWatermark className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">Custom Logo Integration</p>
                            <p className="text-xs text-gray-500 font-medium">{isCustomLogo ? 'Upload your brand logo for the center of the QR.' : 'Standard V-Tracker branded QR will be generated.'}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isCustomLogo}
                            onChange={() => setIsCustomLogo(!isCustomLogo)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>

                      {isCustomLogo && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-200">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-700">Logo Upload</label>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-700">Logo Size</label>
                            <select value={logoSize} onChange={(e) => setLogoSize(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm cursor-pointer">
                              <option value="Standard">Standard</option>
                              <option value="Large">Large</option>
                              <option value="Custom">Custom</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {generatedBatch && (
                      <div className="md:col-span-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-800">Batch Generated Successfully!</p>
                          <p className="text-xs font-medium text-emerald-600 mt-0.5">Batch ID: <span className="font-mono">{generatedBatch}</span> | Price: <span className="font-semibold">{pricePerUnit ? `₹${pricePerUnit}` : 'N/A'}</span></p>
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-3 flex flex-col sm:flex-row justify-end gap-3 mt-2">
                      <button type="button" onClick={() => setGeneratedBatch(null)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                        Discard
                      </button>
                      {generatedBatch && (
                        <button type="button" className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download PDF/SVG
                        </button>
                      )}
                      <button type="submit" onClick={handleGenerate} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
                        Generate Batch
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview Card */}
                <div className="rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-200 relative overflow-hidden shadow-md bg-gray-900 transition-all duration-500 min-h-[250px]">

                  {/* Dynamic Vehicle Background Image */}
                  <div
                    key={vehicleType}
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out opacity-40 animate-in fade-in zoom-in-95"
                    style={{ backgroundImage: `url(${getVehicleImage()})` }}
                  ></div>

                  {/* Dark Overlay for better contrast */}
                  <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-4 font-mono">{vehicleType} Preview</span>
                    <div className="bg-white p-4 rounded-2xl shadow-2xl relative flex items-center justify-center ring-4 ring-white/10">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="w-32 h-32 object-cover opacity-90" />

                      {isCustomLogo && (logoPreview || true) && (
                        <div className={`absolute bg-white rounded flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 ${logoSize === 'Large' ? 'w-10 h-10 p-1' : logoSize === 'Custom' ? 'w-12 h-12 p-0.5' : 'w-8 h-8 p-1'}`}>
                          {logoPreview ? (
                            <img src={logoPreview} alt="Custom Logo" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[8px] font-bold text-gray-400">LOGO</span>
                          )}
                        </div>
                      )}
                      {!isCustomLogo && (
                        <div className="absolute bg-white rounded flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 w-8 h-8 p-1">
                          <div className="w-full h-full bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">V</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Middle Section: Batch History Table (Preview) */}
              <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-2.5">
                    <History className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Batches</h3>
                  </div>
                  <button onClick={() => setShowAllBatches(true)} className="flex items-center gap-1 text-sm font-bold text-primary cursor-pointer transition-all">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Batch ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Created Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Vehicle Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batches.slice(0, 5).map((batch, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">{batch.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">{batch.createdDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-semibold whitespace-nowrap">{batch.vehicleType}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-bold whitespace-nowrap">{batch.quantity}</td>
                          <td className="px-6 py-4 text-sm font-bold text-primary whitespace-nowrap">{batch.pricePerUnit || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${batch.statusColor}`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                            <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-primary transition-colors cursor-pointer">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => setSelectedBatch(batch)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-primary transition-colors cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ============================================================
                  LIVE TAG INVENTORY TABLE (COMMENTED OUT)
                  To restore, remove the surrounding JSX comment tags.
              ============================================================
              <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">Live Tag Inventory</h3>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tags..."
                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      />
                    </div>
                    <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none shadow-sm cursor-pointer hidden sm:block">
                      <option>All Statuses</option>
                      <option>Unprinted</option>
                      <option>Printed</option>
                      <option>Shipped</option>
                      <option>Active</option>
                      <option>Damaged</option>
                      <option>Revoked</option>
                    </select>

                    <div className="flex items-center bg-gray-200/80 p-1 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => setTagViewMode('table')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          tagViewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="Table View"
                      >
                        <Table className="w-4 h-4" />
                        <span className="hidden sm:inline">Table</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTagViewMode('cards')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          tagViewMode === 'cards' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="Card View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Cards</span>
                      </button>
                    </div>
                  </div>
                </div>

                {tagViewMode === 'table' && (
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">QR Tag ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Batch ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Linked Vehicle Registration</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedTags.map((tag, idx) => {
                          const isLastRow = idx >= paginatedTags.length - 2;
                          return (
                          <tr key={idx} className={`hover:bg-gray-50/80 transition-colors ${tag.isRevoked ? 'bg-red-50/30' : ''}`}>
                            <td className={`px-6 py-4 font-mono text-sm font-bold ${tag.isRevoked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{tag.id}</td>
                            <td className={`px-6 py-4 text-sm font-medium ${tag.isRevoked ? 'text-gray-400' : 'text-gray-500'}`}>{tag.batchId}</td>
                            <td className={`px-6 py-4 text-sm font-semibold ${tag.isRevoked ? 'text-gray-400' : 'text-gray-700'}`}>{tag.category}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tag.statusColor}`}>
                                {tag.statusDot && <span className={`w-1.5 h-1.5 rounded-full ${tag.statusDot}`}></span>}
                                {tag.isRevoked && <XCircle className="w-3.5 h-3.5" />}
                                {tag.status}
                              </span>
                            </td>
                            <td className={`px-6 py-4 ${tag.isRevoked ? 'text-gray-400' : 'text-gray-700'}`}>
                              {tag.linkedVehicle !== '—' && tag.linkedVehicle !== 'Suspended Asset' && tag.linkedVehicle !== 'Pending Re-assignment' ? (
                                <div className="flex items-center gap-2">
                                  {tag.vehicleIcon === 'directions_car' ? <Car className="w-4 h-4 text-primary" /> : <Truck className="w-4 h-4 text-primary" />}
                                  <span className="font-semibold">{tag.linkedVehicle}</span>
                                </div>
                              ) : (
                                <span className={tag.isRevoked ? 'font-medium' : ''}>{tag.linkedVehicle}</span>
                              )}
                            </td>
                            <td className={`px-6 py-4 text-sm font-mono ${tag.isRevoked ? 'text-gray-400' : 'text-gray-500'}`}>{tag.ownerId}</td>
                            <td className="px-6 py-4 text-right relative">
                              <button 
                                onClick={() => setActiveDropdown(activeDropdown === tag.id ? null : tag.id)}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                Action <ChevronDown className="w-4 h-4" />
                              </button>
                              
                              {activeDropdown === tag.id && (
                                <div className={`absolute right-6 ${isLastRow ? 'bottom-full mb-2' : 'top-14'} bg-white border border-gray-200 shadow-lg rounded-lg py-1.5 z-50 w-64 text-left flex flex-col`}>
                                  <button onClick={() => handleAction(tag.id, 'damage')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={tag.isRevoked}>
                                    <AlertTriangle className="w-4 h-4 text-red-500" /> Mark as Damaged/Lost
                                  </button>
                                  <button onClick={() => handleAction(tag.id, 'unlink')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={tag.linkedVehicle === '—' || tag.isRevoked || tag.linkedVehicle === 'Pending Re-assignment'}>
                                    <Unlink className="w-4 h-4 text-orange-500" /> Force Unlink from Vehicle
                                  </button>
                                  <button onClick={() => { setActiveDropdown(null); setDeleteConfirmation({ isOpen: true, tagId: tag.id }); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={tag.isRevoked}>
                                    <Ban className="w-4 h-4 text-red-600" /> Delete Tag
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button onClick={() => handleAction(tag.id, 'reassign')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={tag.isRevoked}>
                                    <RefreshCw className="w-4 h-4 text-blue-600" /> Re-assign to different Vehicle
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {tagViewMode === 'cards' && (
                  <div className="p-6 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedTags.map((tag) => (
                        <div key={tag.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 relative">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                              <div>
                                <span className={`font-mono text-base font-bold ${tag.isRevoked ? 'text-gray-400 line-through' : 'text-primary'}`}>{tag.id}</span>
                                <p className="text-xs text-gray-500 font-medium">Batch: {tag.batchId}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${tag.statusColor}`}>
                                {tag.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500 font-medium block">Category</span>
                                <span className="font-semibold text-gray-800">{tag.category}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium block">Owner ID</span>
                                <span className="font-mono font-semibold text-gray-700">{tag.ownerId}</span>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-2.5 rounded-lg text-xs border border-gray-100">
                              <span className="text-gray-500 font-medium block mb-0.5">Linked Vehicle:</span>
                              <span className="font-bold text-gray-900">{tag.linkedVehicle}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-end relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === tag.id ? null : tag.id)}
                              className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Action <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {activeDropdown === tag.id && (
                              <div className="absolute right-0 bottom-12 bg-white border border-gray-200 shadow-xl rounded-xl py-1.5 z-50 w-60 text-left flex flex-col">
                                <button onClick={() => handleAction(tag.id, 'damage')} className="cursor-pointer w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium" disabled={tag.isRevoked}>
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Mark Damaged/Lost
                                </button>
                                <button onClick={() => handleAction(tag.id, 'unlink')} className="cursor-pointer w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium" disabled={tag.linkedVehicle === '—' || tag.isRevoked}>
                                  <Unlink className="w-3.5 h-3.5 text-orange-500" /> Unlink Vehicle
                                </button>
                                <button onClick={() => { setActiveDropdown(null); setDeleteConfirmation({ isOpen: true, tagId: tag.id }); }} className="cursor-pointer w-full text-left px-4 py-2 text-xs text-red-600 font-medium hover:bg-red-50 flex items-center gap-2" disabled={tag.isRevoked}>
                                  <Ban className="w-3.5 h-3.5 text-red-600" /> Delete Tag
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500">
                    Showing {tags.length > 0 ? (currentPage - 1) * tagsPerPage + 1 : 0}-{Math.min(currentPage * tagsPerPage, tags.length)} of {tags.length} tags
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer shadow-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1.5 border ${currentPage === i + 1 ? 'border-primary bg-primary text-white font-bold' : 'border-gray-300 text-gray-700 font-medium hover:bg-white'} rounded-lg shadow-sm cursor-pointer transition-colors`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer shadow-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>
              ============================================================
                  END LIVE TAG INVENTORY TABLE
              ============================================================ */}
            </>
          ) : (
            /* Full Batch History View */
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-bold text-gray-900">All Batches</h3>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by Batch ID or Type..."
                    value={batchSearchQuery}
                    onChange={(e) => setBatchSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="overflow-auto scrollbar-hide flex-1">
                <table className="w-full text-left border-collapse relative">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Batch ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Created Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Vehicle Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batches.filter(b => b.id.toLowerCase().includes(batchSearchQuery.toLowerCase()) || b.vehicleType.toLowerCase().includes(batchSearchQuery.toLowerCase())).map((batch, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">{batch.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">{batch.createdDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-semibold whitespace-nowrap">{batch.vehicleType}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-bold whitespace-nowrap">{batch.quantity}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary whitespace-nowrap">{batch.pricePerUnit || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${batch.statusColor}`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-primary transition-colors cursor-pointer">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={() => setSelectedBatch(batch)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-primary transition-colors cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {batches.filter(b => b.id.toLowerCase().includes(batchSearchQuery.toLowerCase()) || b.vehicleType.toLowerCase().includes(batchSearchQuery.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">No batches found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Batch Details</h3>
              <button onClick={() => setSelectedBatch(null)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Batch ID</p>
                  <p className="text-2xl font-bold font-mono text-primary mt-1">{selectedBatch.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${selectedBatch.statusColor}`}>
                  {selectedBatch.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle Type</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedBatch.vehicleType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Generated</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedBatch.quantity} Tags</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-medium">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Per Tag</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedBatch.pricePerUnit || '—'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-500">Generation Date</span>
                  <span className="font-bold text-gray-900">{selectedBatch.createdDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-500">Custom Logo</span>
                  <span className="font-bold text-gray-900">Yes (Standard Size)</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setSelectedBatch(null)} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Close
              </button>
              <button className="px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-primary/90 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
                <Download className="w-4 h-4" /> Download PDF/SVG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Confirm Deletion
              </h3>
              <button onClick={() => setDeleteConfirmation({ isOpen: false, tagId: null })} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete tag <span className="font-bold text-gray-900">{deleteConfirmation.tagId}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmation({ isOpen: false, tagId: null })} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QRInventory;

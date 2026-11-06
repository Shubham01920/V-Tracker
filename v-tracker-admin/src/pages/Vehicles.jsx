import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { mockVehicles } from '../data/mockVehicles';
import {
  Search, Car, Eye, RefreshCw, PhoneOff, PhoneCall, ChevronDown, LayoutGrid, Table
} from 'lucide-react';
import { toast } from 'sonner';

const Vehicles = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [vehicles, setVehicles] = useState(mockVehicles.map(v => ({ ...v, routingActive: true })));
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [reassignModal, setReassignModal] = useState({ isOpen: false, vehicle: null });
  const [newOwnerName, setNewOwnerName] = useState('');
  
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, vehicle: null });
  const [callHistoryModal, setCallHistoryModal] = useState({ isOpen: false, vehicle: null });
  
  const location = useLocation();

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const filteredVehicles = vehicles.filter(v => 
    v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (vehicle, actionType) => {
    if (actionType === 'reassign') {
      setReassignModal({ isOpen: true, vehicle });
      setNewOwnerName('');
    } else if (actionType === 'deactivate_routing') {
      if (!vehicle.routingActive) {
        toast.info(`Routing is already deactivated for ${vehicle.regNumber}`);
      } else {
        setDeactivateModal({ isOpen: true, vehicle });
      }
    } else if (actionType === 'call_history') {
      setCallHistoryModal({ isOpen: true, vehicle });
    }
    setActiveDropdown(null);
  };

  const submitReassign = () => {
    if (!newOwnerName.trim()) return toast.error('Please enter a new owner name');
    setVehicles(vehicles.map(v => v.id === reassignModal.vehicle.id ? { ...v, ownerName: newOwnerName } : v));
    toast.success(`Owner re-assigned successfully to ${newOwnerName}`);
    setReassignModal({ isOpen: false, vehicle: null });
  };

  const submitDeactivate = () => {
    setVehicles(vehicles.map(v => v.id === deactivateModal.vehicle.id ? { ...v, routingActive: false } : v));
    toast.success(`Emergency routing deactivated for ${deactivateModal.vehicle.regNumber}`);
    setDeactivateModal({ isOpen: false, vehicle: null });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800 flex overflow-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col flex-1 h-screen transition-all duration-300 relative min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} user={getLoggedInUser()} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 space-y-6">
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">Vehicle Registry</h2>
            <p className="text-sm text-gray-500 mt-1">Manage registered vehicles, owners, and document verifications.</p>
          </div>

          <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900">All Vehicles</h3>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by Reg No or Owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>

                {/* View Switcher Toggle */}
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
              </div>
            </div>
            
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="overflow-x-auto scrollbar-hide flex-1 pb-24">
                <table className="w-full text-left border-collapse relative min-w-[1000px]">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Number</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Linked QR Tag</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Plan</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reg. Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVehicles.map((vehicle, idx) => {
                      const isLastRow = idx >= filteredVehicles.length - 2 && filteredVehicles.length > 2;
                      return (
                      <tr key={vehicle.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-primary font-bold">{vehicle.regNumber}</div>
                          {!vehicle.routingActive && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Routing Disabled</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{vehicle.ownerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{vehicle.vehicleType}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{vehicle.linkedQR}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{vehicle.activePlan}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{vehicle.registrationDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${vehicle.docStatusColor}`}>
                            {vehicle.docStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              to={`/vehicles/${vehicle.id}/documents`}
                              className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-primary/10 transition-colors"
                              title="View Documents"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === vehicle.id ? null : vehicle.id)}
                              className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              Action <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {activeDropdown === vehicle.id && (
                            <div className={`absolute right-6 ${isLastRow ? 'bottom-full mb-2' : 'top-14 mt-1'} bg-white border border-gray-200 shadow-lg rounded-lg py-1.5 z-50 w-64 text-left flex flex-col`}>
                              <button onClick={() => handleAction(vehicle, 'reassign')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer">
                                <RefreshCw className="w-4 h-4 text-blue-600" /> Re-assign Owner
                              </button>
                              <button onClick={() => handleAction(vehicle, 'deactivate_routing')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer">
                                <PhoneOff className="w-4 h-4 text-orange-500" /> Deactivate Emergency Routing
                              </button>
                              <button onClick={() => handleAction(vehicle, 'call_history')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer">
                                <PhoneCall className="w-4 h-4 text-emerald-600" /> View Call History
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )})}
                    {filteredVehicles.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-medium">No vehicles found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Card Grid View */}
            {viewMode === 'cards' && (
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 relative">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="font-mono text-base font-bold text-primary">{vehicle.regNumber}</span>
                            {!vehicle.routingActive && (
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">Routing Disabled</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 ${vehicle.docStatusColor}`}>
                            {vehicle.docStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 font-medium block">Owner</span>
                            <span className="font-bold text-gray-900">{vehicle.ownerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Vehicle Type</span>
                            <span className="font-semibold text-gray-800">{vehicle.vehicleType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Linked QR Tag</span>
                            <span className="font-mono font-bold text-gray-700">{vehicle.linkedQR}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Active Plan</span>
                            <span className="font-semibold text-gray-800">{vehicle.activePlan}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500 font-medium">Reg: {vehicle.registrationDate}</span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/vehicles/${vehicle.id}/documents`}
                            className="p-2 bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary rounded-lg transition-colors"
                            title="View Documents"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === vehicle.id ? null : vehicle.id)}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Action <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {activeDropdown === vehicle.id && (
                        <div className="absolute right-5 bottom-14 bg-white border border-gray-200 shadow-xl rounded-xl py-1.5 z-50 w-60 text-left flex flex-col">
                          <button onClick={() => handleAction(vehicle, 'reassign')} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold cursor-pointer">
                            <RefreshCw className="w-4 h-4 text-blue-600" /> Re-assign Owner
                          </button>
                          <button onClick={() => handleAction(vehicle, 'deactivate_routing')} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold cursor-pointer">
                            <PhoneOff className="w-4 h-4 text-orange-500" /> Deactivate Routing
                          </button>
                          <button onClick={() => handleAction(vehicle, 'call_history')} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold cursor-pointer">
                            <PhoneCall className="w-4 h-4 text-emerald-600" /> View Call History
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium">No vehicles found matching your search.</div>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Reassign Owner Modal */}
      {reassignModal.isOpen && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" /> Re-assign Owner
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
                You are re-assigning <span className="font-bold">{reassignModal.vehicle?.regNumber}</span>. Current owner is <span className="font-bold">{reassignModal.vehicle?.ownerName}</span>.
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Owner Name</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Enter new owner's full name"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setReassignModal({ isOpen: false, vehicle: null })} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={submitReassign} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm">
                Confirm Re-assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Routing Modal */}
      {deactivateModal.isOpen && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-red-50/50">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <PhoneOff className="w-5 h-5 text-red-600" /> Deactivate Emergency Routing
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to deactivate emergency routing for vehicle <span className="font-bold text-gray-900">{deactivateModal.vehicle?.regNumber}</span>?
              </p>
              <p className="text-xs text-red-500 font-semibold">
                Warning: Callers scanning the QR code will no longer be able to reach the owner.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setDeactivateModal({ isOpen: false, vehicle: null })} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={submitDeactivate} className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-sm">
                Deactivate Routing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call History Modal */}
      {callHistoryModal.isOpen && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600" /> Call History
              </h3>
              <button onClick={() => setCallHistoryModal({ isOpen: false, vehicle: null })} className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-500">
                &times;
              </button>
            </div>
            <div className="p-0">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Vehicle: {callHistoryModal.vehicle?.regNumber}
              </div>
              <ul className="divide-y divide-gray-100">
                <li className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">+91 98765 43210</p>
                    <p className="text-xs text-gray-500 mt-0.5">Emergency Need - Blocking Driveway</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">Today, 10:45 AM</p>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">Connected (45s)</p>
                  </div>
                </li>
                <li className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">+91 99999 88888</p>
                    <p className="text-xs text-gray-500 mt-0.5">General Alert</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">Yesterday, 04:20 PM</p>
                    <p className="text-xs text-red-500 font-bold mt-0.5">Missed Call</p>
                  </div>
                </li>
                <li className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">+91 88888 77777</p>
                    <p className="text-xs text-gray-500 mt-0.5">Accident Alert</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">12 Jan, 09:15 AM</p>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">Connected (120s)</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <button onClick={() => setCallHistoryModal({ isOpen: false, vehicle: null })} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;

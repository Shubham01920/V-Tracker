import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import {
  PhoneCall, Phone, PhoneOff, PhoneForwarded,
  Clock, Car, Hash, Activity
} from 'lucide-react';

const mockCallLogs = [
  { id: 'CL-9284', caller: '+91 98765 43210', vehicleReg: 'MH-12-AB-1234', owner: '+91 99887 76543', timestamp: '2026-07-29T10:15:00', duration: '02:45', status: 'Connected' },
  { id: 'CL-9283', caller: '+91 87654 32109', vehicleReg: 'KA-01-XY-9876', owner: '+91 77665 54321', timestamp: '2026-07-29T09:42:00', duration: '00:00', status: 'Missed' },
  { id: 'CL-9282', caller: '+91 76543 21098', vehicleReg: 'DL-04-CZ-5678', owner: '+91 66554 43210', timestamp: '2026-07-29T08:15:00', duration: '00:15', status: 'User Disconnected' },
  { id: 'CL-9281', caller: '+91 65432 10987', vehicleReg: 'GJ-05-PQ-3456', owner: '+91 55443 32109', timestamp: '2026-07-28T18:30:00', duration: '00:00', status: 'Busy' },
  { id: 'CL-9280', caller: '+91 94123 87654', vehicleReg: 'TN-09-BK-8821', owner: '+91 88990 11223', timestamp: '2026-07-28T16:20:00', duration: '01:30', status: 'Connected' },
  { id: 'CL-9279', caller: '+91 98221 11234', vehicleReg: 'UP-32-EF-4412', owner: '+91 77889 22334', timestamp: '2026-07-28T14:05:00', duration: '00:00', status: 'Missed' },
  { id: 'CL-9278', caller: '+91 88123 44123', vehicleReg: 'HR-26-DQ-9012', owner: '+91 99001 33445', timestamp: '2026-07-28T11:45:00', duration: '03:12', status: 'Connected' },
];

const CallLogs = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getLoggedInUser = () => {
    if (location.state?.email) return location.state;
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Connected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"><Phone className="w-3 h-3" /> {status}</span>;
      case 'Missed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200"><PhoneOff className="w-3 h-3" /> {status}</span>;
      case 'Busy':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200"><PhoneForwarded className="w-3 h-3" /> {status}</span>;
      case 'User Disconnected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200"><PhoneOff className="w-3 h-3" /> Disconnected</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">{status}</span>;
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
              <h2 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
                <PhoneCall className="w-6 h-6 text-primary" />
                Emergency Call & Route Logs
              </h2>
              <p className="text-sm text-gray-500 mt-1">Monitor emergency and routed phone calls</p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Call Monitor Table</h3>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Log ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Caller</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Reg. No</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Call Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockCallLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                            <Hash className="w-3.5 h-3.5 text-gray-400" />
                            {log.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{log.caller}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm font-bold uppercase tracking-wider border border-blue-200">
                            <Car className="w-3.5 h-3.5" />
                            {log.vehicleReg}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{log.owner}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">{log.duration}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(log.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CallLogs;

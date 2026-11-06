import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QrCode, CheckCircle2, AlertCircle, ShoppingBag, Users, IndianRupee, Plus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import GSTSettlement from '../components/dashboard/GSTSettlement';
import FulfillmentChart from '../components/dashboard/FulfillmentChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { Link } from 'react-router-dom';

const DocumentExpiryWidget = () => {
  const expiringDocs = [
    { id: 'VEH-002', reg: 'MH02AB5678', type: 'Insurance', days: 2, status: 'text-red-600 bg-red-50 border-red-100' },
    { id: 'VEH-003', reg: 'DL01CD9012', type: 'PUC', days: 12, status: 'text-orange-600 bg-orange-50 border-orange-100' },
    { id: 'VEH-004', reg: 'KA03EF3456', type: 'Fitness', days: 25, status: 'text-orange-600 bg-orange-50 border-orange-100' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Document Expiry Alerts
        </h3>
      </div>
      <div className="space-y-4 flex-1">
        {expiringDocs.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-bold text-sm text-gray-900">{doc.reg}</p>
              <p className="text-xs text-gray-500">{doc.type}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${doc.status}`}>
                {doc.days} Days Left
              </span>
              <Link to={`/vehicles/${doc.id}/documents`} className="text-[10px] font-semibold text-primary hover:underline">
                View Docs
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Link to="/vehicles" className="mt-4 w-full py-2 text-center text-sm font-semibold text-gray-600 hover:text-primary transition-colors border-t border-gray-100 pt-4">
        View All Vehicles
      </Link>
    </div>
  );
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Priority: data passed via login navigation -> saved in localStorage -> default admin
  const getLoggedInUser = () => {
    if (location.state?.email) {
      return location.state;
    }
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // corrupted data, ignore and fall through to default
      }
    }
    return { name: 'Super Admin', email: 'admin@v-tracker.com', initials: 'SA' };
  };

  const loggedInUser = getLoggedInUser();

  return (
    <div className="min-h-screen bg-background font-sans text-gray-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} user={loggedInUser} />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="QR Generated" icon={QrCode} value="12,450" trend={<span className="text-green-600 flex items-center gap-1">↑ +12.5% vs LW</span>} colorScheme="blue" />
            <StatCard title="QR Active" icon={CheckCircle2} value="8,230" trend={<div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-green-500 h-full" style={{ width: '66%' }}></div></div>} colorScheme="green" />
            <StatCard title="QR Inactive" icon={AlertCircle} value="4,220" trend="34% of total supply" colorScheme="orange" />
            <StatCard title="Total Orders" icon={ShoppingBag} value="5,100" trend={<span className="text-green-600 flex items-center gap-1">↑ +4.2%</span>} colorScheme="blue" />
            <StatCard title="Total Users" icon={Users} value="4,800" trend="Active: 3,920" colorScheme="orange" />
            <StatCard title="Sales Today" icon={IndianRupee} value="₹1,45,000" trend="Peak: 14:00 - 16:00" colorScheme="green" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-4"><SalesChart /></div>
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <GSTSettlement />
              <FulfillmentChart />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8"><ActivityFeed /></div>
            <div className="xl:col-span-4"><DocumentExpiryWidget /></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
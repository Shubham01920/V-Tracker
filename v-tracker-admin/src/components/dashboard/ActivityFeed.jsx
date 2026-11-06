import React from 'react';
import { UserPlus, QrCode, ShoppingCart, ShieldBan, Zap } from 'lucide-react';

const ActivityFeed = () => {
  const activities = [
    {
      type: 'New Registration',
      description: <>User <span className="font-mono text-primary font-bold">#USR_8829</span> verified mobile</>,
      source: 'Android App',
      status: 'Verified',
      statusColor: 'bg-green-100 text-green-700',
      time: '2 mins ago',
      icon: UserPlus,
      iconBg: 'bg-green-50 text-green-600'
    },
    {
      type: 'Order Placed',
      description: <>Order <span className="font-mono text-primary font-bold">#ORD-101</span> placed for ₹5,999</>,
      source: 'Website',
      status: 'Processing',
      statusColor: 'bg-blue-100 text-blue-700',
      time: '5 mins ago',
      icon: ShoppingCart,
      iconBg: 'bg-blue-50 text-blue-600'
    },
    {
      type: 'User Blocked',
      description: <>User <span className="font-mono text-primary font-bold">#USR_4210</span> blocked (Policy Violation)</>,
      source: 'Admin Console',
      status: 'Blocked',
      statusColor: 'bg-red-100 text-red-700',
      time: '12 mins ago',
      icon: ShieldBan,
      iconBg: 'bg-red-50 text-red-600'
    },
    {
      type: 'QR Activation',
      description: <>QR Serial <span className="font-mono text-primary font-bold">VT-441-X</span> assigned to KA01HA442</>,
      source: 'Web Console',
      status: 'Success',
      statusColor: 'bg-green-100 text-green-700',
      time: '14 mins ago',
      icon: QrCode,
      iconBg: 'bg-slate-100 text-slate-600'
    },
    {
      type: 'Recharge Renewal',
      description: <>Annual plan renewed for <span className="font-mono text-primary font-bold">KA05MZ1234</span></>,
      source: 'In-App Purchase',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-700',
      time: '22 mins ago',
      icon: Zap,
      iconBg: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-heading font-bold text-lg text-primary">Live Activity Feed</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Real-time</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 font-bold">Event Type</th>
              <th className="px-6 py-4 font-bold">Description</th>
              <th className="px-6 py-4 font-bold">Source</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${activity.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-800">{activity.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{activity.description}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{activity.source}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 ${activity.statusColor} text-[10px] font-bold rounded-md uppercase tracking-wider inline-block`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium text-right whitespace-nowrap">{activity.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityFeed;

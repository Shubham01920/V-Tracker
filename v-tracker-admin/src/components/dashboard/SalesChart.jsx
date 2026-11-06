import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'In-App', value: 65000, color: '#3b82f6' },
  { name: 'Website', value: 42000, color: '#f59e0b' },
  { name: 'Offline/Dealer', value: 21450, color: '#10b981' }
];

const SalesChart = () => {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="font-heading font-bold text-lg text-[#1e293b]">Revenue by Channel</h3>
          <p className="text-[#8c98a4] text-xs font-medium">Distribution of sales across platforms</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              itemStyle={{ color: '#1e293b' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;

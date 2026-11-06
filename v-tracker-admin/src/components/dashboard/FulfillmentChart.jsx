import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { category: '2W (Bikes)', orders: 4520, color: '#3b82f6' },
  { category: '3W (Auto)', orders: 2140, color: '#f59e0b' },
  { category: '4W (Car)', orders: 8540, color: '#10b981' },
  { category: 'Commercial', orders: 1250, color: '#6366f1' },
];

const FulfillmentChart = () => {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-heading font-bold text-lg text-[#1e293b]">Order Fulfillment</h3>
        <p className="text-[#8c98a4] text-xs font-medium">Breakdown by vehicle category</p>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis 
              type="number"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
            />
            <YAxis 
              dataKey="category" 
              type="category"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [`${value} Orders`, 'Fulfillment']}
            />
            <Bar dataKey="orders" radius={[0, 6, 6, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FulfillmentChart;

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'ORD-101', Base: 5999, CGST: 540, SGST: 540, IGST: 0 },
  { name: 'ORD-102', Base: 12999, CGST: 0, SGST: 0, IGST: 2340 },
  { name: 'ORD-103', Base: 5999, CGST: 540, SGST: 540, IGST: 0 },
  { name: 'ORD-104', Base: 8999, CGST: 810, SGST: 810, IGST: 0 },
  { name: 'ORD-105', Base: 14999, CGST: 0, SGST: 0, IGST: 2700 },
  { name: 'ORD-106', Base: 5999, CGST: 540, SGST: 540, IGST: 0 },
];

const GSTSettlement = () => {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-heading font-bold text-lg text-[#1e293b]">GST Split per Order</h3>
        <p className="text-[#8c98a4] text-xs font-medium">Base Amount vs Taxes (CGST/SGST/IGST)</p>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              tickFormatter={(val) => `₹${val/1000}k`}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => `₹${value}`}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#64748b', paddingTop: '20px' }}
            />
            <Bar dataKey="Base" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={40} />
            <Bar dataKey="CGST" stackId="a" fill="#f59e0b" maxBarSize={40} />
            <Bar dataKey="SGST" stackId="a" fill="#10b981" maxBarSize={40} />
            <Bar dataKey="IGST" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GSTSettlement;

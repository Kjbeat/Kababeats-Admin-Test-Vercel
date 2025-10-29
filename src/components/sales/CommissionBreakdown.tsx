import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CommissionBreakdownProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalCommission: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function CommissionBreakdown({ data, totalCommission }: CommissionBreakdownProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Commission Breakdown</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ${totalCommission.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Commission</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Commission']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend and Details */}
        <div className="space-y-4">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${item.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((item.value / totalCommission) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {data.length}
                </div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  ${(totalCommission / data.length).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Avg per Category</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

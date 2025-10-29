import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    commission: number;
  }>;
  title?: string;
}

export function RevenueChart({ data, title = "Revenue Trend" }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxCommission = Math.max(...data.map(d => d.commission));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Commission</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const revenuePercentage = (item.revenue / maxRevenue) * 100;
          const commissionPercentage = (item.commission / maxCommission) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <div className="flex space-x-4">
                  <span className="text-sm text-blue-600 font-medium">
                    ${item.revenue.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    ${item.commission.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-16 text-xs text-gray-500">Revenue</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${revenuePercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-16 text-xs text-gray-500">Commission</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${commissionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${data.reduce((sum, item) => sum + item.commission, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Commission</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

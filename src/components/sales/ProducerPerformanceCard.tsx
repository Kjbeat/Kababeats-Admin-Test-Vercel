import React from 'react';
import { TrendingUp, TrendingDown, Star, Users, DollarSign } from 'lucide-react';

interface ProducerPerformanceCardProps {
  producer: {
    producerId: string;
    producerName: string;
    totalSales: number;
    totalRevenue: number;
    commissionEarned: number;
    beatsSold: number;
    averageRating: number;
    joinDate: string;
    growthRate?: number;
    rank?: number;
  };
  showRank?: boolean;
}

export function ProducerPerformanceCard({ producer, showRank = false }: ProducerPerformanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getGrowthIcon = (growthRate?: number) => {
    if (!growthRate) return null;
    return growthRate > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growthRate?: number) => {
    if (!growthRate) return 'text-gray-500';
    return growthRate > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-semibold text-gray-900 truncate">
                {producer.producerName}
              </h4>
              {showRank && producer.rank && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #{producer.rank}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">ID: {producer.producerId.slice(-8)}</p>
            <p className="text-xs text-gray-400">Joined {formatDate(producer.joinDate)}</p>
          </div>
        </div>
        
        {producer.growthRate && (
          <div className={`flex items-center space-x-1 ${getGrowthColor(producer.growthRate)}`}>
            {getGrowthIcon(producer.growthRate)}
            <span className="text-sm font-medium">
              {Math.abs(producer.growthRate).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="h-4 w-4 mr-1" />
            Total Revenue
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(producer.totalRevenue)}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            Commission Earned
          </div>
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(producer.commissionEarned)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {producer.totalSales.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Sales</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {producer.beatsSold.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Beats Sold</div>
        </div>
        
        <div>
          <div className="flex items-center justify-center text-2xl font-bold text-gray-900">
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            {(producer.averageRating || 0).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Performance Score</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                style={{ 
                  width: `${Math.min((producer.totalRevenue / 10000) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {Math.min(Math.round((producer.totalRevenue / 10000) * 100), 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

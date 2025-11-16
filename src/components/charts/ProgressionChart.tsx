import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProgressionDataPoint {
  date: string;
  users: number;
  subscriptions: number;
  beats: number;
  sales: number;
}

interface ProgressionChartProps {
  data: ProgressionDataPoint[];
  loading?: boolean;
}

type MetricType = 'users' | 'subscriptions' | 'beats' | 'sales';

const metricConfig = {
  users: {
    label: 'Users',
    color: '#3b82f6', // blue
    dataKey: 'users',
  },
  subscriptions: {
    label: 'Subscriptions',
    color: '#f59e0b', // yellow
    dataKey: 'subscriptions',
  },
  beats: {
    label: 'Beats',
    color: '#8b5cf6', // purple
    dataKey: 'beats',
  },
  sales: {
    label: 'Sales',
    color: '#f97316', // orange
    dataKey: 'sales',
  },
};

export function ProgressionChart({ data, loading = false }: ProgressionChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('users');

  const config = metricConfig[selectedMetric];

  const formatTooltipValue = (value: number) => {
    return value.toLocaleString();
  };

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Current Month Progression</h3>
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Current Month Progression</h3>
        <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(metricConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), config.label]}
            labelFormatter={(label) => `Date: ${formatXAxisLabel(label)}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
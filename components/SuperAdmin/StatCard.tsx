import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold ${color} mt-1`}>
          {value.toLocaleString()}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '100').replace('[#E1262D]', 'red-100')}`}>
        {icon}
      </div>
    </div>
  </div>
);

interface StyleCardProps {
  title: string;
  styleName: string | null;
  icon: React.ReactNode;
  color: string;
}

const StyleCard: React.FC<StyleCardProps> = ({ title, styleName, icon, color }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className={`text-xl font-bold ${color} mt-1 truncate`}>
          {styleName || 'No data yet'}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '100')} flex-shrink-0 ml-4`}>
        {icon}
      </div>
    </div>
  </div>
);

export { StatCard, StyleCard };
export type { StatCardProps, StyleCardProps };

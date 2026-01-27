import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold ${color} mt-1`}>
          {value.toLocaleString()}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '500/20')}`}>
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
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className={`text-xl font-bold ${color} mt-1 truncate`}>
          {styleName || 'No data yet'}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '500/20')} flex-shrink-0 ml-4`}>
        {icon}
      </div>
    </div>
  </div>
);

export { StatCard, StyleCard };
export type { StatCardProps, StyleCardProps };

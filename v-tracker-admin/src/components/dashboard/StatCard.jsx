import React from 'react';

const StatCard = ({ title, icon: Icon, value, trend, isPrimary, colorScheme = 'blue' }) => {
  const colors = {
    blue: {
      border: 'border-l-blue-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    orange: {
      border: 'border-l-orange-500',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    green: {
      border: 'border-l-green-500',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    purple: {
      border: 'border-l-purple-500',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  };

  const scheme = colors[colorScheme] || colors.blue;

  return (
    <div
      className={`group relative bg-white border-y border-r border-l-[3px] border-gray-100 ${scheme.border} rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full`}
    >
      <div className="flex flex-col h-full">
        {/* Top row: title + icon side by side, always aligned regardless of title length */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider leading-tight pt-1">
            {title}
          </span>
          <div
            className={`w-9 h-9 rounded-lg flex flex-shrink-0 items-center justify-center ${scheme.iconBg} ${scheme.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className="w-4.5 h-4.5" strokeWidth={2.25} />
          </div>
        </div>

        {/* Value: own full-width line, never collides with icon */}
        <h2 className="text-[24px] font-bold font-heading text-primary leading-tight mb-1.5 truncate">
          {value}
        </h2>

        {/* Trend / subtext */}
        <div className="text-gray-500 text-[11px] font-semibold mt-auto min-h-[18px] flex items-center">
          {trend}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  accent?: 'mint' | 'slate' | 'ash' | 'lilac' | 'taupe';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  accent = 'mint',
  onClick
}) => {
  const accentBorders = {
    mint: 'hover:border-[#c4e7d4]',
    slate: 'hover:border-[#b9c0da]',
    ash: 'hover:border-[#c4dacf]',
    lilac: 'hover:border-[#998da0]',
    taupe: 'hover:border-[#63585e]'
  }[accent];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-[rgba(99,88,94,0.12)] shadow-xs transition-all duration-200 ${accentBorders} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-[#7d737a] uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-[#f1f5f3] text-[#63585e]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-[#1b171a] font-mono">
          {value}
        </div>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>

      {subtitle && (
        <p className="text-xs text-[#7d737a] mt-1.5 line-clamp-1">{subtitle}</p>
      )}
    </div>
  );
};

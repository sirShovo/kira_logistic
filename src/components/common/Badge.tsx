import React from 'react';

export type BadgeVariant = 
  | 'mint' 
  | 'slate' 
  | 'ash' 
  | 'lilac' 
  | 'taupe' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'ash',
  size = 'md',
  dot = true,
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dotColor: string }> = {
    mint: {
      container: 'bg-[#c4e7d4]/35 text-[#1a4a35] border-[#c4e7d4]/80',
      dotColor: 'bg-[#2e7d58]'
    },
    success: {
      container: 'bg-[#c4e7d4]/40 text-[#174630] border-[#c4e7d4]',
      dotColor: 'bg-[#1e6b45]'
    },
    slate: {
      container: 'bg-[#b9c0da]/35 text-[#2b3556] border-[#b9c0da]/80',
      dotColor: 'bg-[#47558a]'
    },
    info: {
      container: 'bg-[#b9c0da]/35 text-[#242e4c] border-[#b9c0da]',
      dotColor: 'bg-[#3b4c7e]'
    },
    ash: {
      container: 'bg-[#c4dacf]/40 text-[#3d4b44] border-[#c4dacf]',
      dotColor: 'bg-[#62766d]'
    },
    lilac: {
      container: 'bg-[#998da0]/25 text-[#423547] border-[#998da0]/50',
      dotColor: 'bg-[#7a6a82]'
    },
    taupe: {
      container: 'bg-[#63585e]/15 text-[#383034] border-[#63585e]/40',
      dotColor: 'bg-[#63585e]'
    },
    warning: {
      container: 'bg-[#f4ebd0] text-[#6b4716] border-[#e8d7a7]',
      dotColor: 'bg-[#b4781c]'
    },
    error: {
      container: 'bg-[#f8d7da] text-[#781c2d] border-[#f1b0b7]',
      dotColor: 'bg-[#b02a37]'
    }
  };

  const sizeStyles = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1.5' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  const current = variantStyles[variant] || variantStyles.ash;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${current.container} ${sizeStyles} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0`} />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};

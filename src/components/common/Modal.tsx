import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#181417]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div 
        className={`relative w-full ${maxWidthClasses} bg-[#ffffff] rounded-2xl shadow-2xl border border-[rgba(99,88,94,0.18)] overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in-0 zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[rgba(99,88,94,0.1)] bg-[#f8faf9]">
          <div>
            <h3 className="text-base font-semibold text-[#1b171a] tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#7d737a] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#7d737a] hover:text-[#1b171a] hover:bg-[rgba(99,88,94,0.08)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(99,88,94,0.1)] bg-[#f8faf9]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

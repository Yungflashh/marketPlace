import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideClose?: boolean;
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

/** Renders as a centered modal on desktop and a bottom sheet on mobile. */
const Dialog: React.FC<Props> = ({ open, onClose, title, description, children, footer, size = 'md', hideClose = false }) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-[#09090C]/55 backdrop-blur-sm animate-fade-in" />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClasses[size]} bg-elevated border border-border rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] shadow-[var(--shadow-vault-lg)] max-h-[88dvh] sm:max-h-[85vh] flex flex-col [animation:vault-sheet-up_0.32s_cubic-bezier(0.16,1,0.3,1)_both] sm:[animation:vault-scale-in_0.22s_cubic-bezier(0.22,1,0.36,1)_both]`}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-9 h-1 rounded-full bg-border-strong" />
        </div>

        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-3 sm:pt-5 pb-4 border-b border-border shrink-0">
            <div>
              {title && <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>}
              {description && <p className="text-[12.5px] text-ink-muted mt-1">{description}</p>}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto vault-scroll flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;

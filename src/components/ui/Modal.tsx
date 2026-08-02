import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative w-full bg-elevated border border-hairline-strong rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-sheet-up sm:animate-pop-in',
          sizeClasses[size]
        )}
      >
        <div className="sm:hidden w-9 h-1 bg-hairline-strong rounded-full mx-auto mt-3" />
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
            <div>
              {title && (
                <h2 id="modal-title" className="font-display text-xl font-medium text-ink">
                  {title}
                </h2>
              )}
              {description && <p className="text-sm text-ink-faint mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-ink hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">{children}</div>
        {footer && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-hairline mt-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

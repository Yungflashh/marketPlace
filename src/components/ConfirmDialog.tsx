import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = ({
  open, title, message, confirmLabel = 'Confirm', danger = false, loading = false, onConfirm, onCancel
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(id);
    } else {
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-sm transition-all duration-200 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            </div>
            {!loading && (
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-6 ml-13 leading-relaxed" style={{ marginLeft: '52px' }}>{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                danger
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...</>
                : confirmLabel
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

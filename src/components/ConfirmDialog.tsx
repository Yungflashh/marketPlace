import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Dialog from './ui/Dialog';
import Button from './ui/Button';

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
  return (
    <Dialog open={open} onClose={onCancel} size="sm" hideClose>
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-10 h-10 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center ${danger ? 'bg-error-soft text-error' : 'bg-warning-soft text-warning'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display text-[15px] font-bold text-ink mb-1">{title}</h3>
          <p className="text-[13px] text-ink-soft leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <Button variant="secondary" fullWidth onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? 'destructive' : 'primary'} fullWidth onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

const getPageList = (page: number, totalPages: number): (number | 'ellipsis')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push('ellipsis');
    result.push(p);
  });
  return result;
};

const Pagination: React.FC<Props> = ({ page, totalPages, onChange, className = '' }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-ink-soft border border-border hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageList(page, totalPages).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-ink-muted text-sm">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors ${
              p === page
                ? 'bg-primary text-on-primary'
                : 'text-ink-soft border border-border hover:bg-surface-hover'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-ink-soft border border-border hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;

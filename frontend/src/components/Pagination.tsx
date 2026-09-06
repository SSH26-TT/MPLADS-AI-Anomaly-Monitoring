import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startItem.toLocaleString()}</strong> to <strong>{endItem.toLocaleString()}</strong> of <strong>{totalItems.toLocaleString()}</strong> projects
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: '#F8FAFC',
                fontFamily: 'inherit',
                fontSize: '13px'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        <div className="pagination-controls">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 600 }}>
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

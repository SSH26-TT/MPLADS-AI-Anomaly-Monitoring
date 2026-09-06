import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="top-header">
      <div className="header-search">
        <Search size={18} className="header-search-icon" />
        <input
          type="text"
          placeholder="Search works by ID, title, representative, district..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="header-actions">
        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '12px' }}>AO</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: '1.2' }}>Authority Desk</span>
            <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)' }}>National Auditor</span>
          </div>
          <ChevronDown size={14} color="var(--color-text-muted)" style={{ marginLeft: '4px' }} />
        </div>
      </div>
    </header>
  );
};


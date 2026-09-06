import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  AlertTriangle, 
  MapPin, 
  CalendarRange, 
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  reviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, reviewCount = 0 }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">M</div>
        <div className="brand-text">
          <h1>MPLADS Monitor</h1>
          <p>National Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Overview</div>
        <button
          className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'projects' ? 'active' : ''}`}
          onClick={() => onSelectTab('projects')}
        >
          <FolderGit2 size={18} />
          <span>All Works</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'high-risk' ? 'active' : ''}`}
          onClick={() => onSelectTab('high-risk')}
        >
          <AlertTriangle size={18} />
          <span>Priority Review</span>
          {reviewCount > 0 && <span className="nav-badge">{reviewCount > 99 ? '99+' : reviewCount}</span>}
        </button>

        <div className="nav-section-title">Analytics</div>
        <button
          className={`nav-item ${currentTab === 'state-analytics' ? 'active' : ''}`}
          onClick={() => onSelectTab('state-analytics')}
        >
          <MapPin size={18} />
          <span>State Wise Analysis</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'fy-analytics' ? 'active' : ''}`}
          onClick={() => onSelectTab('fy-analytics')}
        >
          <CalendarRange size={18} />
          <span>Financial Year</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">AO</div>
        <div className="user-info" style={{ flex: 1 }}>
          <h4>Authority Officer</h4>
          <p>National Audit Desk</p>
        </div>
        <button
          title="Official Session Active"
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}
        >
          <ShieldCheck size={18} />
        </button>
      </div>
    </aside>
  );
};

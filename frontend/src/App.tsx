import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { HighRisk } from './pages/HighRisk';
import { StateAnalytics } from './pages/StateAnalytics';
import { FinancialYearAnalytics } from './pages/FinancialYearAnalytics';
import { Methodology } from './pages/Methodology';
import { api } from './services/api';
import { Project, SystemSummary } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadInitialMetadata() {
      try {
        const summaryData = await api.getSummary();
        setSummary(summaryData);
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    }
    loadInitialMetadata();
  }, []);

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && currentTab !== 'projects') {
      setCurrentTab('projects');
    }
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        reviewCount={summary?.requiring_review || 2090}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleGlobalSearch}
        />

        <main className="content-body">

          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onSelectProject={setSelectedProject}
            />
          )}

          {currentTab === 'projects' && (
            <Projects
              onSelectProject={setSelectedProject}
              globalSearch={searchQuery}
              selectedState="ALL"
            />
          )}

          {currentTab === 'high-risk' && (
            <HighRisk
              onSelectProject={setSelectedProject}
              selectedState="ALL"
            />
          )}

          {currentTab === 'state-analytics' && (
            <StateAnalytics
              onSelectProject={setSelectedProject}
              selectedState="ALL"
              onStateChange={() => {}}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'fy-analytics' && (
            <FinancialYearAnalytics />
          )}

          {currentTab === 'methodology' && (
            <Methodology />
          )}
        </main>
      </div>

      {/* Single Project Risk Inspection Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { ProjectsView } from './views/ProjectsView';
import { JobApplicationsView } from './views/JobApplicationsView';
import { SkillsView } from './views/SkillsView';
import { ProfileView } from './views/ProfileView';

const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading DevTrack Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginView onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterView onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'tasks':
        return <TasksView />;
      case 'projects':
        return <ProjectsView />;
      case 'jobs':
        return <JobApplicationsView />;
      case 'skills':
        return <SkillsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  const pageTitles: Record<NavTab, string> = {
    dashboard: 'Developer Dashboard',
    tasks: 'Task & Productivity Manager',
    projects: 'Project Portfolio',
    jobs: 'Career Applications Pipeline',
    skills: 'Skills & Tech Matrix',
    profile: 'User Profile & Security',
  };

  return (
    <div style={styles.appShell}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={styles.mainArea}>
        <Header title={pageTitles[activeTab]} />
        {renderActiveView()}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090d16',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  appShell: {
    display: 'flex',
    minHeight: '100vh',
  },
  mainArea: {
    flex: 1,
    padding: '32px 40px',
    overflowY: 'auto',
  },
};

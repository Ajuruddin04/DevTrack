import React from 'react';
import {
  Briefcase,
  CheckSquare,
  Code2,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'jobs'
  | 'skills'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={20} /> },
    { id: 'jobs', label: 'Job Applications', icon: <Briefcase size={20} /> },
    { id: 'skills', label: 'Skills & Tech', icon: <Code2 size={20} /> },
    { id: 'profile', label: 'Profile Settings', icon: <UserIcon size={20} /> },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logoBadge}>DT</div>
        <div>
          <h2 style={styles.brandTitle}>DevTrack</h2>
          <span style={styles.brandSubtitle}>Developer Workspace</span>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navBtn,
                ...(isActive ? styles.activeNavBtn : {}),
              }}
            >
              <span style={{ color: isActive ? '#6366f1' : '#94a3b8' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.userFooter}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} title="Logout" style={styles.logoutBtn}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0c121e',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    padding: '24px 16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '24px',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.2rem',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.92rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  activeNavBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#f8fafc',
    fontWeight: 600,
    borderLeft: '3px solid #6366f1',
  },
  userFooter: {
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(99, 102, 241, 0.4)',
  },
  userName: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
};

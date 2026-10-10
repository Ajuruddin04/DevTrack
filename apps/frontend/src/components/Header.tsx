import React from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name || 'Developer'}!</p>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search tasks, projects, skills..."
            style={styles.searchInput}
          />
        </div>

        <button style={styles.iconBtn} title="Notifications">
          <Bell size={18} />
        </button>

        <div style={styles.liveBadge}>
          <Sparkles size={14} color="#6366f1" />
          <span>API Connected</span>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(18, 25, 41, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '8px 14px',
    width: '260px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#f8fafc',
    fontSize: '0.85rem',
    width: '100%',
  },
  iconBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#818cf8',
  },
};

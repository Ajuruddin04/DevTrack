import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Code2,
  FolderGit2,
  Plus,
} from 'lucide-react';
import type { DashboardStats } from '../types';
import { apiRequest } from '../api/client';
import type { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest<DashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading workspace dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stat Cards */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Total Tasks</span>
            <div style={{ ...styles.iconBox, color: '#6366f1' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{stats?.tasks.total || 0}</div>
          <div style={styles.statFooter}>
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              {stats?.tasks.completed || 0} completed
            </span>
            <span style={{ color: '#64748b' }}> • {stats?.tasks.pending || 0} pending</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Active Projects</span>
            <div style={{ ...styles.iconBox, color: '#06b6d4' }}>
              <FolderGit2 size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{stats?.projects.total || 0}</div>
          <div style={styles.statFooter}>
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>
              {stats?.projects.inProgress || 0} in progress
            </span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Job Pipeline</span>
            <div style={{ ...styles.iconBox, color: '#8b5cf6' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{stats?.jobApplications.total || 0}</div>
          <div style={styles.statFooter}>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>
              {stats?.jobApplications.interviews || 0} interviews
            </span>
            <span style={{ color: '#10b981' }}> • {stats?.jobApplications.offers || 0} offers</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Skill Proficiency</span>
            <div style={{ ...styles.iconBox, color: '#10b981' }}>
              <Code2 size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{stats?.skills.averageProgress || 0}%</div>
          <div style={styles.statFooter}>
            <span style={{ color: '#94a3b8' }}>
              Across {stats?.skills.total || 0} tracked technologies
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#f8fafc' }}>
          Quick Developer Actions
        </h3>
        <div style={styles.shortcutGrid}>
          <button onClick={() => setActiveTab('tasks')} className="secondary-btn" style={styles.actionBtn}>
            <Plus size={16} color="#6366f1" />
            <span>Add Task</span>
          </button>
          <button onClick={() => setActiveTab('projects')} className="secondary-btn" style={styles.actionBtn}>
            <Plus size={16} color="#06b6d4" />
            <span>Create Project</span>
          </button>
          <button onClick={() => setActiveTab('jobs')} className="secondary-btn" style={styles.actionBtn}>
            <Plus size={16} color="#8b5cf6" />
            <span>Track Application</span>
          </button>
          <button onClick={() => setActiveTab('skills')} className="secondary-btn" style={styles.actionBtn}>
            <Plus size={16} color="#10b981" />
            <span>Update Skill</span>
          </button>
        </div>
      </div>

      {/* Developer Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>Project Progress</h3>
            <button onClick={() => setActiveTab('projects')} style={styles.linkBtn}>View all</button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
            Track and build your developer portfolio projects.
          </p>
          <div style={styles.metricRow}>
            <span>Completed Projects</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>{stats?.projects.completed || 0}</span>
          </div>
          <div style={styles.metricRow}>
            <span>In Development</span>
            <span style={{ fontWeight: 700, color: '#06b6d4' }}>{stats?.projects.inProgress || 0}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>Career Application Status</h3>
            <button onClick={() => setActiveTab('jobs')} style={styles.linkBtn}>View pipeline</button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
            Organize software engineering interviews and job offers.
          </p>
          <div style={styles.metricRow}>
            <span>Submitted Applications</span>
            <span style={{ fontWeight: 700, color: '#818cf8' }}>{stats?.jobApplications.applied || 0}</span>
          </div>
          <div style={styles.metricRow}>
            <span>Active Interviewing</span>
            <span style={{ fontWeight: 700, color: '#a78bfa' }}>{stats?.jobApplications.interviews || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '20px',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  statTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#f8fafc',
    marginBottom: '8px',
  },
  statFooter: {
    fontSize: '0.8rem',
  },
  shortcutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  actionBtn: {
    justifyContent: 'center',
    padding: '12px 16px',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.9rem',
    color: '#cbd5e1',
  },
};

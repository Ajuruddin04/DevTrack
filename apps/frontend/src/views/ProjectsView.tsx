import React, { useEffect, useState } from 'react';
import { ExternalLink, FolderGit2, Plus, Trash2 } from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import { apiRequest } from '../api/client';
import { Modal } from '../components/Modal';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [techStackInput, setTechStackInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest<Project[]>('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const techStack = techStackInput
      ? techStackInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      await apiRequest<Project>('/projects', {
        method: 'POST',
        body: {
          name,
          description: description || undefined,
          status,
          techStack,
          repoUrl: repoUrl || undefined,
          liveUrl: liveUrl || undefined,
        },
      });

      setIsModalOpen(false);
      setName('');
      setDescription('');
      setTechStackInput('');
      setRepoUrl('');
      setLiveUrl('');
      fetchProjects();
    } catch (err) {
      alert('Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await apiRequest(`/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={styles.topBar}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
            Developer Projects Portfolio
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '2px' }}>
            Track open source & production applications
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <FolderGit2 size={48} color="#06b6d4" style={{ marginBottom: '12px' }} />
          <h3>No Projects Created Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Add your first project to start tracking code repositories & live deployments.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <div key={project.id} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.projectTitle}>{project.name}</h3>
                  <span className={`badge badge-${project.status.toLowerCase()}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  style={styles.deleteBtn}
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {project.description && (
                <p style={styles.projectDesc}>{project.description}</p>
              )}

              {/* Progress Bar */}
              <div style={{ margin: '16px 0' }}>
                <div style={styles.progressLabelRow}>
                  <span>Tasks Progress</span>
                  <span>{project.progressPercentage || 0}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${project.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Tech Stack Badges */}
              {project.techStack && project.techStack.length > 0 && (
                <div style={styles.techStackRow}>
                  {project.techStack.map((tech) => (
                    <span key={tech} style={styles.techTag}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Links */}
              <div style={styles.cardFooter}>
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    <FolderGit2 size={14} />
                    <span>Repository</span>
                  </a>
                ) : (
                  <span />
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ...styles.link, color: '#22d3ee' }}
                  >
                    <span>Live Demo</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.modalLabel}>Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DevTrack Productivity Suite"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of features and architecture..."
              className="glass-input"
              rows={3}
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="glass-input"
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div>
            <label style={styles.modalLabel}>Tech Stack (comma separated)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="React, NestJS, Prisma, PostgreSQL, Docker"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>GitHub Repository URL</label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/devtrack"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Live Deployment URL</label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://devtrack.example.com"
              className="glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn"
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  projectTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '4px',
  },
  projectDesc: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    marginBottom: '12px',
  },
  progressLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    color: '#cbd5e1',
    marginBottom: '6px',
  },
  techStackRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: 'auto',
    paddingTop: '12px',
  },
  techTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '0.75rem',
    color: '#cbd5e1',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#818cf8',
    fontSize: '0.85rem',
    textDecoration: 'none',
    fontWeight: 500,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
  },
  emptyState: {
    padding: '60px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '6px',
    display: 'block',
  },
};

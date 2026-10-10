import React, { useEffect, useState } from 'react';
import { Code2, Plus, Trash2 } from 'lucide-react';
import type { Skill, SkillProficiency } from '../types';
import { apiRequest, ApiError } from '../api/client';
import { Modal } from '../components/Modal';

export const SkillsView: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [proficiency, setProficiency] = useState<SkillProficiency>('INTERMEDIATE');
  const [progressPercentage, setProgressPercentage] = useState<number>(75);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSkills = async () => {
    try {
      const data = await apiRequest<Skill[]>('/skills');
      setSkills(data);
    } catch (err) {
      console.error('Failed to fetch skills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await apiRequest<Skill>('/skills', {
        method: 'POST',
        body: {
          name,
          category: category || undefined,
          proficiency,
          progressPercentage,
        },
      });

      setIsModalOpen(false);
      setName('');
      setCategory('');
      setProgressPercentage(75);
      fetchSkills();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.messages.join(', '));
      } else {
        setErrorMsg('Failed to add skill.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await apiRequest(`/skills/${id}`, { method: 'DELETE' });
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete skill.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={styles.topBar}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
            Skills & Technology Matrix
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '2px' }}>
            Track technical mastery in Java, JavaScript, React, NestJS, Docker, AWS, Terraform, Jenkins
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} />
          <span>Add Skill</span>
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading skills matrix...</div>
      ) : skills.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <Code2 size={48} color="#10b981" style={{ marginBottom: '12px' }} />
          <h3>No Skills Tracked</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Add frameworks, languages, and cloud tools to track learning progress.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {skills.map((skill) => (
            <div key={skill.id} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.skillTitle}>{skill.name}</h3>
                  {skill.category && (
                    <span style={styles.categoryBadge}>{skill.category}</span>
                  )}
                </div>
                <button onClick={() => handleDelete(skill.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={styles.proficiencyRow}>
                <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  {skill.proficiency}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                  {skill.progressPercentage}%
                </span>
              </div>

              <div className="progress-bar-bg" style={{ marginTop: '10px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${skill.progressPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Technology / Skill"
      >
        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleCreateSkill} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.modalLabel}>Technology / Skill Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NestJS, React, Docker, AWS, Terraform"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Backend, Frontend, DevOps, Database"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Proficiency Level</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value as SkillProficiency)}
              className="glass-input"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={styles.modalLabel}>Progress Percentage</label>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{progressPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={(e) => setProgressPercentage(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn"
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Saving Skill...' : 'Add Skill'}
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  skillTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  categoryBadge: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '2px',
    display: 'block',
  },
  proficiencyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
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
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#fb7185',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '16px',
  },
  modalLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '6px',
    display: 'block',
  },
};

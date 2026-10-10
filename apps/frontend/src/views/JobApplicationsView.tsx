import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, MapPin, Plus, Trash2 } from 'lucide-react';
import type { JobApplication, JobApplicationStatus } from '../types';
import { apiRequest } from '../api/client';
import { Modal } from '../components/Modal';

export const JobApplicationsView: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<JobApplicationStatus>('APPLIED');
  const [notes, setNotes] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplications = async () => {
    try {
      const data = await apiRequest<JobApplication[]>('/job-applications');
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch job applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest<JobApplication>('/job-applications', {
        method: 'POST',
        body: {
          company,
          role,
          location: location || undefined,
          salary: salary || undefined,
          status,
          notes: notes || undefined,
          jobUrl: jobUrl || undefined,
        },
      });

      setIsModalOpen(false);
      setCompany('');
      setRole('');
      setLocation('');
      setSalary('');
      setStatus('APPLIED');
      setNotes('');
      setJobUrl('');
      fetchApplications();
    } catch (err) {
      alert('Failed to add job application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job application?')) return;

    try {
      await apiRequest(`/job-applications/${id}`, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete job application.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={styles.topBar}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
            Career & Job Application Pipeline
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '2px' }}>
            Track software engineering opportunities and interview stages
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} />
          <span>Add Application</span>
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <Briefcase size={48} color="#8b5cf6" style={{ marginBottom: '12px' }} />
          <h3>No Job Applications Tracked</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Start tracking tech job applications, interviews, and offer letters.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {applications.map((app) => (
            <div key={app.id} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.companyTitle}>{app.company}</h3>
                  <div style={styles.roleTitle}>{app.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                  <button onClick={() => handleDelete(app.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={styles.detailsRow}>
                {app.location && (
                  <div style={styles.detailItem}>
                    <MapPin size={14} color="#64748b" />
                    <span>{app.location}</span>
                  </div>
                )}
                <div style={styles.detailItem}>
                  <Calendar size={14} color="#64748b" />
                  <span>Applied {new Date(app.applicationDate).toLocaleDateString()}</span>
                </div>
                {app.salary && (
                  <div style={styles.detailItem}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{app.salary}</span>
                  </div>
                )}
              </div>

              {app.notes && <p style={styles.notes}>{app.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Track Job Application"
      >
        <form onSubmit={handleCreateApplication} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.modalLabel}>Company Name *</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, Stripe"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Role / Position *</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="glass-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.modalLabel}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
                className="glass-input"
              >
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer Received</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div>
              <label style={styles.modalLabel}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, NYC, CA"
                className="glass-input"
              />
            </div>
          </div>

          <div>
            <label style={styles.modalLabel}>Expected Salary / Compensation</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="$150,000 - $180,000"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Notes / Next Steps</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Technical interview details, recruiter email..."
              className="glass-input"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn"
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Saving...' : 'Add Application'}
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  companyTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  roleTitle: {
    fontSize: '0.92rem',
    color: '#818cf8',
    fontWeight: 500,
    marginTop: '2px',
  },
  detailsRow: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: '12px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  notes: {
    fontSize: '0.88rem',
    color: '#cbd5e1',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '10px 14px',
    borderRadius: '8px',
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

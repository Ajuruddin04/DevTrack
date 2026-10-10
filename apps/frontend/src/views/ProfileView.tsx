import React, { useState } from 'react';
import { Key, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, ApiError } from '../api/client';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await apiRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: { password },
      });

      setSuccessMsg('Password updated and re-hashed with bcrypt successfully!');
      setPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.messages.join(', '));
      } else {
        setErrorMsg('Failed to update password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
      {/* Account Info */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              fontSize: '1.5rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(99, 102, 241, 0.4)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0 }}>{user?.name}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '2px' }}>{user?.email}</p>
          </div>
        </div>

        <div style={styles.infoRow}>
          <span>User ID</span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{user?.id}</span>
        </div>
        <div style={styles.infoRow}>
          <span>Account Created</span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span>Security Level</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>Bcrypt Hashed & JWT Secured</span>
          </div>
        </div>
      </div>

      {/* Security Update Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Key size={20} color="#6366f1" />
          <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0 }}>Change Password</h3>
        </div>

        {successMsg && <div style={styles.successBanner}>{successMsg}</div>}
        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.modalLabel}>New Password (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn"
            style={{ width: 'fit-content' }}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.92rem',
    color: '#cbd5e1',
  },
  modalLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '6px',
    display: 'block',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '16px',
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
};

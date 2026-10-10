import React, { useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

interface LoginViewProps {
  onSwitchToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.messages.join(', '));
      } else {
        setErrorMsg('Failed to login. Please check connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>DT</div>
          <h2 style={styles.title}>Welcome to DevTrack</h2>
          <p style={styles.subtitle}>Sign in to your developer workspace</p>
        </div>

        {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="azzu@example.com"
                className="glass-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn"
            style={{ width: '100%', marginTop: '8px' }}
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} style={styles.switchBtn}>
            Register now
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '36px 32px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.4rem',
    color: '#ffffff',
    margin: '0 auto 16px',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#fb7185',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#cbd5e1',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    zIndex: 1,
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '0.88rem',
    color: '#94a3b8',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

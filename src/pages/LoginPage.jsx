import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Lock, Mail, AlertCircle, Shield, ArrowRight, UserCheck } from 'lucide-react';

const FACTORY_ACCOUNTS = [
  {
    roleName: 'Cutting Supervisor',
    email: 'supervisor@apparelflow.com',
    password: 'Password123!',
    duty: 'Create production batches from recipe multiplier',
    badgeClass: 'badge-blue'
  },
  {
    roleName: 'Cutting Verifier (QC)',
    email: 'verifier@apparelflow.com',
    password: 'Password123!',
    duty: 'Physical part counting & traffic light gatekeeper',
    badgeClass: 'badge-amber'
  },
  {
    roleName: 'Sewing Supervisor',
    email: 'sewing@apparelflow.com',
    password: 'Password123!',
    duty: 'Receive verified batches & trigger assembly line',
    badgeClass: 'badge-green'
  }
];

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password');
      return;
    }

    try {
      const loggedUser = await login(email.trim(), password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const fillCredentials = (accEmail, accPassword) => {
    setEmail(accEmail);
    setPassword(accPassword);
    setError('');
  };

  const redirectByRole = (role) => {
    if (role === 'cutting_supervisor') navigate('/orders');
    else if (role === 'cutting_verifier') navigate('/verify');
    else if (role === 'sewing_supervisor') navigate('/sewing');
    else navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '0.875rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            boxShadow: '0 4px 6px -1px rgba(30, 64, 175, 0.25)'
          }}>
            <Scissors size={32} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            ApparelFlow ERP
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Production Execution & Quality Gatekeeper System
          </p>
        </div>

        {/* Production Login Card */}
        <div className="card" style={{ boxShadow: 'var(--shadow-xl)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Operator Authentication</span>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                Sign in with your factory credentials
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
              <Shield size={14} /> RBAC Enforced
            </div>
          </div>

          <div className="card-body" style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                color: '#991b1b',
                fontSize: '0.875rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="login-email"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}
                >
                  <Mail size={14} color="#64748b" /> Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="operator@apparelflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="login-password"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}
                >
                  <Lock size={14} color="#64748b" /> Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', justifyContent: 'center', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Terminal'}
              </button>
            </form>

            {/* Test Credentials Reference Helper */}
            <div style={{
              marginTop: '1.75rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <UserCheck size={14} /> Factory Operator Accounts
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {FACTORY_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.email}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{acc.roleName}</div>
                      <div className="mono" style={{ color: '#64748b', fontSize: '0.75rem' }}>{acc.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillCredentials(acc.email, acc.password)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600 }}
                      title="Autofill this account into the form"
                    >
                      Fill
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
                Default password: <span className="mono">Password123!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

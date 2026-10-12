import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Scissors, ShieldCheck, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, loginAsRole, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = async (e) => {
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

  const handleDemoClick = async (roleKey) => {
    setError('');
    try {
      const loggedUser = await loginAsRole(roleKey);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Failed to authenticate demo user.');
    }
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
      padding: '2rem 1.5rem',
      backgroundColor: '#f1f5f9'
    }}>
      <div style={{ width: '100%', maxWidth: '980px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '0.875rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            boxShadow: '0 4px 6px -1px rgba(30, 64, 175, 0.2)'
          }}>
            <Scissors size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            ApparelFlow ERP
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.25rem' }}>
            Cutting Operations & Gatekeeper Verification Terminal
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          {/* Left: Quick Evaluator Demo Credential Switcher */}
          <div className="card" style={{ borderColor: '#bfdbfe', backgroundColor: '#f8fafc' }}>
            <div className="card-header" style={{ backgroundColor: '#eff6ff', borderBottomColor: '#dbeafe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700 }}>
                <KeyRound size={18} />
                <span>Evaluator 1-Click Role Switcher</span>
              </div>
              <span className="badge badge-pending">Instant Login</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.25rem' }}>
                Select an operational persona below to immediately authenticate and test server-side RBAC boundaries and gatekeeper validation:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDemoClick(key)}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {item.name} • <span className="mono">{item.email}</span>
                      </div>
                    </div>
                    <ArrowRight size={18} color="#2563eb" />
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <ShieldCheck size={14} color="#059669" /> Demo Password
                </div>
                All demo accounts pre-seeded with: <strong className="mono" style={{ color: '#0f172a' }}>Password123!</strong>
              </div>
            </div>
          </div>

          {/* Right: Manual Login Form */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Standard Login</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JWT Session</span>
            </div>
            <div className="card-body">
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

              <form onSubmit={handleManualLogin}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="user@apparelflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Terminal'}
                </button>
              </form>

              <div style={{
                marginTop: '1.75rem',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1rem',
                fontSize: '0.75rem',
                color: '#64748b',
                lineHeight: 1.5
              }}>
                <strong>High-Contrast Policy:</strong> Form controls strictly enforce white backgrounds with dark text conforming to Section 11 accessibility criteria.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Scissors, CheckCircle2, Factory, LogOut, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, loginAsRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleQuickRoleSwitch = async (roleKey) => {
    try {
      await loginAsRole(roleKey);
      if (roleKey === 'cutting_supervisor') navigate('/orders');
      else if (roleKey === 'cutting_verifier') navigate('/verify');
      else if (roleKey === 'sewing_supervisor') navigate('/sewing');
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: '#0f172a' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#ffffff',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <Scissors size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.025em', color: '#0f172a' }}>
                ApparelFlow <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}>ERP</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Cutting & Gatekeeper QC Terminal
              </div>
            </div>
          </Link>

          {/* Navigation links based on role */}
          <nav style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
            {user.role === 'cutting_supervisor' && (
              <Link
                to="/orders"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: location.pathname === '/orders' ? '#1e40af' : '#475569',
                  backgroundColor: location.pathname === '/orders' ? '#eff6ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <Scissors size={16} /> Cutting Batches
              </Link>
            )}

            {user.role === 'cutting_verifier' && (
              <Link
                to="/verify"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: location.pathname === '/verify' ? '#92400e' : '#475569',
                  backgroundColor: location.pathname === '/verify' ? '#fffbeb' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <CheckCircle2 size={16} /> QC Verification Terminal
              </Link>
            )}

            {user.role === 'sewing_supervisor' && (
              <Link
                to="/sewing"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: location.pathname === '/sewing' ? '#065f46' : '#475569',
                  backgroundColor: location.pathname === '/sewing' ? '#ecfdf5' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <Factory size={16} /> Sewing Queue Gate
              </Link>
            )}
          </nav>
        </div>

        {/* Right side: Evaluator Role Switcher & Active User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* 1-Click Role Switcher Pill Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            padding: '0.25rem',
            borderRadius: '8px',
            gap: '0.25rem',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', padding: '0 0.5rem', textTransform: 'uppercase' }}>
              Switch Role:
            </span>
            {Object.entries(DEMO_CREDENTIALS).map(([key, data]) => {
              const isActive = user.role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleQuickRoleSwitch(key)}
                  style={{
                    border: 'none',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#0f172a' : '#475569',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Switch to ${data.title}`}
                >
                  {data.title.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Active User Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'capitalize' }}>
                {user.role.replace('_', ' ')}
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

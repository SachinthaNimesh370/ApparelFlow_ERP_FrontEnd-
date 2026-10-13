import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, CheckCircle2, Factory, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'cutting_supervisor':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', label: 'Cutting Supervisor' };
      case 'cutting_verifier':
        return { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: 'Cutting Verifier (QC)' };
      case 'sewing_supervisor':
        return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', label: 'Sewing Supervisor' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: role.replace('_', ' ') };
    }
  };

  const roleMeta = getRoleBadgeStyle(user.role);

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

          {/* Navigation link based strictly on authenticated role */}
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
                  gap: '0.375rem',
                  border: location.pathname === '/orders' ? '1px solid #bfdbfe' : '1px solid transparent'
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
                  gap: '0.375rem',
                  border: location.pathname === '/verify' ? '1px solid #fde68a' : '1px solid transparent'
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
                  gap: '0.375rem',
                  border: location.pathname === '/sewing' ? '1px solid #a7f3d0' : '1px solid transparent'
                }}
              >
                <Factory size={16} /> Sewing Queue Gate
              </Link>
            )}
          </nav>
        </div>

        {/* Right side: Authenticated User Information & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Active User Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                {user.full_name}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '0.15rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: roleMeta.bg,
                color: roleMeta.color,
                border: `1px solid ${roleMeta.border}`
              }}>
                {roleMeta.label}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                borderColor: '#cbd5e1'
              }}
              title="Sign Out of Session"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

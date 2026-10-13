import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <div className="card" style={{ maxWidth: '560px', padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#fee2e2', borderRadius: '50%', color: '#dc2626', marginBottom: '1.25rem' }}>
            <ShieldAlert size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
            Role-Based Access Restricted
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your account is assigned the role <strong style={{ color: '#0f172a' }}>{user.role.replace('_', ' ')}</strong>. Under ApparelFlow factory SOP, you do not have permission to access this workstation.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '360px',
            margin: '0 auto'
          }}>
            {user.role === 'cutting_supervisor' && (
              <Link to="/orders" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Return to Cutting Batches
              </Link>
            )}
            {user.role === 'cutting_verifier' && (
              <Link to="/verify" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Return to QC Verification Terminal
              </Link>
            )}
            {user.role === 'sewing_supervisor' && (
              <Link to="/sewing" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Return to Sewing Queue
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ justifyContent: 'center', marginTop: '0.25rem' }}
            >
              <LogOut size={16} /> Sign Out to Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

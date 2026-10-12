import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '540px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#fee2e2', borderRadius: '50%', color: '#dc2626', marginBottom: '1.25rem' }}>
            <ShieldAlert size={44} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Role-Based Access Restricted
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your active role (<strong>{user.role}</strong>) does not have authorization to view this terminal. Under ApparelFlow factory SOP, duties are strictly separated between Cutting and Sewing.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {user.role === 'cutting_supervisor' && (
              <a href="/orders" className="btn btn-primary">Go to Cutting Batches</a>
            )}
            {user.role === 'cutting_verifier' && (
              <a href="/verify" className="btn btn-primary">Go to Verifier Terminal</a>
            )}
            {user.role === 'sewing_supervisor' && (
              <a href="/sewing" className="btn btn-primary">Go to Sewing Queue</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

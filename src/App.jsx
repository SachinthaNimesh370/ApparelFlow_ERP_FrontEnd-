import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RoleGuard } from './components/RoleGuard';
import { LoginPage } from './pages/LoginPage';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { VerifierTerminal } from './pages/VerifierTerminal';
import { SewingQueue } from './pages/SewingQueue';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'cutting_supervisor') return <Navigate to="/orders" replace />;
  if (user.role === 'cutting_verifier') return <Navigate to="/verify" replace />;
  if (user.role === 'sewing_supervisor') return <Navigate to="/sewing" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Cutting Supervisor Dashboard (Strictly cutting_supervisor) */}
            <Route
              path="/orders"
              element={
                <RoleGuard allowedRoles={['cutting_supervisor']}>
                  <SupervisorDashboard />
                </RoleGuard>
              }
            />

            {/* QC Verifier Terminal (Strictly cutting_verifier) */}
            <Route
              path="/verify"
              element={
                <RoleGuard allowedRoles={['cutting_verifier']}>
                  <VerifierTerminal />
                </RoleGuard>
              }
            />

            {/* Sewing Floor Queue (Strictly sewing_supervisor) */}
            <Route
              path="/sewing"
              element={
                <RoleGuard allowedRoles={['sewing_supervisor']}>
                  <SewingQueue />
                </RoleGuard>
              }
            />

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

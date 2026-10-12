import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser, clearAuthStorage } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  cutting_supervisor: {
    email: 'supervisor@apparelflow.com',
    password: 'Password123!',
    role: 'cutting_supervisor',
    title: 'Cutting Supervisor',
    name: 'Kasun Perera',
    badgeColor: 'blue'
  },
  cutting_verifier: {
    email: 'verifier@apparelflow.com',
    password: 'Password123!',
    role: 'cutting_verifier',
    title: 'Cutting Verifier (QC)',
    name: 'Nadeeka Silva',
    badgeColor: 'amber'
  },
  sewing_supervisor: {
    email: 'sewing@apparelflow.com',
    password: 'Password123!',
    role: 'sewing_supervisor',
    title: 'Sewing Supervisor',
    name: 'Dinesh Fernando',
    badgeColor: 'emerald'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(false);

  // Validate session on initial mount
  useEffect(() => {
    if (token && !user) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          setStoredUser(userData);
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setStoredToken(data.token);
      setStoredUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const loginAsRole = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (!creds) throw new Error(`Unknown role: ${roleKey}`);
    return await login(creds.email, creds.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

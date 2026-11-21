import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('bidsphere_token');
    const storedUser = localStorage.getItem('bidsphere_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('bidsphere_token');
        localStorage.removeItem('bidsphere_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('bidsphere_token', newToken);
    localStorage.setItem('bidsphere_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('bidsphere_token', newToken);
    localStorage.setItem('bidsphere_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {}); // Fire and forget
    localStorage.removeItem('bidsphere_token');
    localStorage.removeItem('bidsphere_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('bidsphere_user', JSON.stringify(updatedUser));
    } catch {
      // Token may have expired
      logout();
    }
  }, [logout]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

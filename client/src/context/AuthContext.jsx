import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, setStoredToken, getStoredToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/auth/me');
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
      } else {
        setStoredToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setStoredToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Periodic heartbeat while logged in to maintain active online presence
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      apiRequest('/auth/heartbeat', { method: 'POST' }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    return data;
  };

  const register = async (formData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setStoredToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    setStoredToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
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

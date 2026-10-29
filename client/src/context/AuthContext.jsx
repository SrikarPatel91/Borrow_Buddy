import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('borrowbuddy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('borrowbuddy_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('borrowbuddy_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('borrowbuddy_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('borrowbuddy_token', userData.token);
      localStorage.setItem('borrowbuddy_user', JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (name, email, password, phone = '') => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('borrowbuddy_token', userData.token);
      localStorage.setItem('borrowbuddy_user', JSON.stringify(userData));
      return userData;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('borrowbuddy_token');
    localStorage.removeItem('borrowbuddy_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('borrowbuddy_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
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

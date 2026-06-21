import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const parseAxiosError = (err) => {
  const data = err.response?.data;
  if (data) {
    if (data.message) {
      if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
        const fieldErrors = Object.entries(data.errors)
          .map(([field, msgs]) => {
            const msgStr = Array.isArray(msgs) ? msgs.join(', ') : msgs;
            if (field === 'non_field_errors' || field === 'detail') {
              return msgStr;
            }
            return `${field}: ${msgStr}`;
          })
          .join(' | ');
        return fieldErrors || data.message;
      }
      return data.message;
    }
    if (data.detail) return data.detail;
    if (data.non_field_errors) {
      return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors;
    }
    const values = Object.values(data).flat();
    const stringValues = values.filter(val => typeof val === 'string');
    if (stringValues.length > 0) {
      return stringValues.join(' ');
    }
  }
  return err.message || 'An unknown error occurred';
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000;
  } catch (err) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
        } catch (err) {
          console.error('Error fetching profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const data = res.data;

      localStorage.setItem('token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setToken(data.tokens.access);
      setRefreshToken(data.tokens.refresh);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const errorMsg = parseAxiosError(err);
      throw new Error(errorMsg || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const data = res.data;

      localStorage.setItem('token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setToken(data.tokens.access);
      setRefreshToken(data.tokens.refresh);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const errorMsg = parseAxiosError(err);
      throw new Error(errorMsg || 'Registration failed');
    }
  };

  const logout = () => {
    if (refreshToken && !isTokenExpired(token)) {
      authAPI.logout(refreshToken).catch(err => {
        if (err.response?.status !== 401 && err.response?.status !== 400) {
          console.error('Logout request failed', err);
        }
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authAPI.updateProfile(profileData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      const errorMsg = parseAxiosError(err);
      throw new Error(errorMsg || 'Update profile failed');
    }
  };

  const updateAvatar = async (formData) => {
    try {
      const res = await authAPI.updateAvatar(formData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      const errorMsg = parseAxiosError(err);
      throw new Error(errorMsg || 'Avatar update failed');
    }
  };


  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

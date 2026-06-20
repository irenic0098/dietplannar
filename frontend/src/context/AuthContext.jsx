import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

const parseError = async (res) => {
  try {
    const data = await res.json();
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
  } catch (err) {
    // Ignore and fallback
  }
  return `Error ${res.status}: ${res.statusText || 'Unknown error'}`;
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
          const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Token might be expired
            logout();
          }
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
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorMsg = await parseError(res);
      throw new Error(errorMsg || 'Login failed');
    }

    const data = await res.json();

    localStorage.setItem('token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setToken(data.tokens.access);
    setRefreshToken(data.tokens.refresh);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorMsg = await parseError(res);
      throw new Error(errorMsg || 'Registration failed');
    }

    const data = await res.json();

    localStorage.setItem('token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setToken(data.tokens.access);
    setRefreshToken(data.tokens.refresh);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    if (refreshToken) {
      fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ refresh: refreshToken }),
      }).catch(err => console.error('Logout request failed', err));
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const errorMsg = await parseError(res);
      throw new Error(errorMsg || 'Update profile failed');
    }

    const data = await res.json();

    setUser(data);
    return data;
  };

  const updateAvatar = async (formData) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData, // FormData contains file
    });

    if (!res.ok) {
      const errorMsg = await parseError(res);
      throw new Error(errorMsg || 'Avatar update failed');
    }

    const data = await res.json();

    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

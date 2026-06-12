import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.non_field_errors || Object.values(data).flat().join(' ') || 'Login failed');
    }

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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(Object.values(data).flat().join(' ') || 'Registration failed');
    }

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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(Object.values(data).flat().join(' ') || 'Update profile failed');
    }

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

    const data = await res.json();
    if (!res.ok) {
      throw new Error('Avatar update failed');
    }

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

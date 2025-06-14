"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data) {
          setUser(response.data);
        }
      } catch (error: any) {
        console.error('Auth check error:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });

        if (error.response?.status === 401) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Sending login request to:', '/auth/login');
      const response = await api.post('/auth/login', {
        email,
        password,
      }, {
        withCredentials: true
      });

      console.log('Login response:', {
        status: response.status,
        data: response.data,
        cookies: document.cookie
      });

      if (!response.data) {
        throw new Error('No response data received');
      }

      if (!response.data.user) {
        throw new Error('Invalid response: user data missing');
      }

      // Check if we have the client_token cookie
      const token = document.cookie.split('; ').find(row => row.startsWith('client_token='))?.split('=')[1];
      if (!token) {
        throw new Error('Authentication token not set');
      }

      setUser(response.data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error: any) {
      console.error('Logout error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setUser(null);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post('/api/auth/register', {
        email,
        password,
        username,
      }, {
        withCredentials: true
      });

      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      setUser(response.data.user);
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
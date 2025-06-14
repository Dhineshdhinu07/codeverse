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
        const response = await api.get('/api/users/me');
        setUser(response.data);
      } catch (error: any) {
        console.error('Auth check error:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });
        setUser(null);
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

      // First check if the server is accessible
      try {
        await api.get('/api/test');
      } catch (error: any) {
        console.error('Server health check failed:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });
        throw new Error('Unable to connect to the server. Please check if the backend is running.');
      }

      // If server is accessible, attempt login
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      setUser(response.data.user);
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      // Even if the server request fails, clear the local state
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
      setError(error.message || 'Registration failed');
      throw error;
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
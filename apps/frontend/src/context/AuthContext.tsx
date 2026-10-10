import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { apiRequest } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('devtrack_token'),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiRequest<User>('/auth/me');
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('devtrack_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await apiRequest<{ user: User; accessToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: { email, password },
      },
    );

    localStorage.setItem('devtrack_token', response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiRequest<{ user: User; accessToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: { name, email, password },
      },
    );

    localStorage.setItem('devtrack_token', response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('devtrack_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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

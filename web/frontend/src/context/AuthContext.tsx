import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../api/services/auth.service';
import type { Customer, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');

      if (token && userId) {
        try {
          const userData = await authService.getCustomerInfo(parseInt(userId));
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_id', response.user_id.toString());

    const userData = await authService.getCustomerInfo(response.user_id);
    setUser(userData);
  };

  const register = async (data: RegisterRequest) => {
    const newUser = await authService.register(data);
    const loginResponse = await authService.login({
      email: data.email,
      password: data.password,
    });

    localStorage.setItem('access_token', loginResponse.access_token);
    localStorage.setItem('user_id', loginResponse.user_id.toString());
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setUser(null);
  };

  const refreshUser = async () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      const userData = await authService.getCustomerInfo(parseInt(userId));
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

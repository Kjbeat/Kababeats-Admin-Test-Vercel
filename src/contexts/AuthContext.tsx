import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AdminUser, AuthResponse, LoginCredentials } from '@/types';
import { apiService } from '@/services/api';

interface AuthContextType {
  admin: AdminUser | null;
  user: AdminUser | null; // Alias for admin for compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('admin_user');
        const token = localStorage.getItem('admin_access_token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setAdmin(userData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiService.login(credentials);
      setAdmin(response.admin);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiService.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin || !admin.permissions) return false;
    return admin.permissions.includes(permission as any);
  };

  const hasRole = (role: string): boolean => {
    if (!admin) return false;
    return admin.role === role;
  };

  const value: AuthContextType = {
    admin,
    user: admin, // Alias for compatibility
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    changePassword,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

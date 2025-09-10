import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storageService } from '../utils/tempStorage';
import ApiService, { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await ApiService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userProfile = await ApiService.getUserProfile();
      setUser(userProfile);
      await storageService.setItem('user', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If we can't fetch user profile, the token might be invalid
      await logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        const token = await storageService.getItem('accessToken');
        const storedUser = await storageService.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (token) {
          // If we have a token but no stored user, fetch user profile
          await refreshUser();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear any corrupted data
        await storageService.removeItem('accessToken');
        await storageService.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  const login = async (mobile: string, password: string) => {
    try {
      setIsLoading(true);
      await ApiService.login({ mobile, password });
      
      // After successful login, fetch user profile
      await refreshUser();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

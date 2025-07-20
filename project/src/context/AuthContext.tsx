import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      localStorage.removeItem('token');
      toast.error('Session expired. Please login again.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        setUser(userData);
        toast.success(response.data.message || `Welcome back, ${userData.name}!`);
        return true;
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || 'Login failed');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        setUser(userData);
        toast.success(response.data.message || `Welcome to QuizMaster, ${userData.name}!`);
        return true;
      } else {
        throw new Error(response.data.error?.message || 'Signup failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || 'Signup failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      // Update local state immediately for better UX
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      }
      
      // Try to sync with backend
      const response = await api.put('/user/profile', data);
      if (response.data.success) {
        setUser(response.data.user);
        return true;
      } else {
        throw new Error(response.data.error?.message || 'Update failed');
      }
    } catch (error: any) {
      // If backend update fails, keep local changes
      console.warn('Backend update failed, keeping local changes:', error);
      return true; // Return true since local update succeeded
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Alert } from 'react-native';
import { api } from '../services/api';
import { User, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure storage
const storage = new MMKV();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check for existing session on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = storage.getString('auth_token');
      if (token) {
        // Verify token with backend
        const userData = await api.get('/auth/me');
        setUser(userData.data);
      }
    } catch (error) {
      // Token invalid, clear storage
      storage.delete('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user: userData, token } = response.data;
      
      // Store token securely
      storage.set('auth_token', token);
      setUser(userData);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries(['user']);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha no login');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      const { user: userData, token } = response.data;
      
      // Store token securely
      storage.set('auth_token', token);
      setUser(userData);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries(['user']);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha no registro');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      storage.delete('auth_token');
      setUser(null);
      queryClient.clear();
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data);
      queryClient.invalidateQueries(['user']);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar perfil');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      // If refresh fails, logout user
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
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

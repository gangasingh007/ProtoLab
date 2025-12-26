'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { authAPI, LoginCredentials, RegisterData } from '@/lib/api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, token } = await authAPI.login(credentials);
      setAuth(user, token);
      toast.success('Welcome back!');
      router.push('/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const { user, token } = await authAPI.register(userData);
      setAuth(user, token);
      toast.success('Account created successfully!');
      router.push('/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
};

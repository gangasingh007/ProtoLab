'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, token, setAuth, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      // TODO: Validate token with backend
      initSocket(storedToken);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.login(email, password);
      setAuth(data.user, data.token);
      initSocket(data.token);
      toast.success('Logged in successfully!');
      router.push('/teams');
      return data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => {
    try {
      const { data } = await authAPI.register({ email, password, name, role });
      setAuth(data.user, data.token);
      initSocket(data.token);
      toast.success('Account created successfully!');
      router.push('/teams');
      return data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    storeLogout();
    disconnectSocket();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return { user, token, login, register, logout, isAuthenticated: !!token };
};

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import type { User, RegisterData } from '@fixai/shared';

const ACCESS_TOKEN_KEY = 'fixai_access_token';
const REFRESH_TOKEN_KEY = 'fixai_refresh_token';
const USER_KEY = 'fixai_user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        storage.getItem(ACCESS_TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData) as User;
        setState({ user, accessToken: token, isLoading: false });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { identifier, password });
    const { user, accessToken, refreshToken } = response.data;

    await Promise.all([
      storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setState({ user, accessToken, isLoading: false });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data;

    await Promise.all([
      storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setState({ user, accessToken, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue with local logout even if API call fails
    }

    await Promise.all([
      storage.removeItem(ACCESS_TOKEN_KEY),
      storage.removeItem(REFRESH_TOKEN_KEY),
      storage.removeItem(USER_KEY),
    ]);

    delete api.defaults.headers.common['Authorization'];
    setState({ user: null, accessToken: null, isLoading: false });
  }, []);

  const registerProvider = useCallback(async (data: Record<string, any>) => {
    const response = await api.post<LoginResponse>('/auth/register-provider', data);
    const { user, accessToken, refreshToken } = response.data;
    await Promise.all([
      storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setState({ user, accessToken, isLoading: false });
  }, []);

  const upgradeToPro = useCallback(async (data: Record<string, any>) => {
    const response = await api.patch<{ user: User }>('/users/me/upgrade-pro', data);
    const user = response.data as unknown as User;
    await storage.setItem(USER_KEY, JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
    return user;
  }, []);

  return {
    user: state.user,
    accessToken: state.accessToken,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    login,
    register,
    registerProvider,
    upgradeToPro,
    logout,
  };
}

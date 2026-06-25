import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';

const _configured = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const BASE_URL = _configured
  ?? (Platform.OS === 'web' ? '/api/v1' : 'http://localhost:3001/api/v1');

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getItem('fixai_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem('fixai_refresh_token');
        const userId = await storage.getItem('fixai_user').then((u) => {
          if (!u) return null;
          return (JSON.parse(u) as { id: string }).id;
        });

        if (!refreshToken || !userId) {
          throw new Error('No refresh token available');
        }

        const response = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
          userId,
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await Promise.all([
          storage.setItem('fixai_access_token', accessToken),
          storage.setItem('fixai_refresh_token', newRefreshToken),
        ]);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await Promise.all([
          storage.removeItem('fixai_access_token'),
          storage.removeItem('fixai_refresh_token'),
          storage.removeItem('fixai_user'),
        ]);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

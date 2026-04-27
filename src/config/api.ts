/**
 * src/config/api.ts
 *
 * Central HTTP client for the Laravel API.
 * - Injects `Authorization: Bearer <token>` from AsyncStorage on every request.
 * - Normalises error responses so callers always receive { message, status }.
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BASE_URL = 'https://providing-wisdom-favored.ngrok-free.dev';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_PROFILE: '@user_profile',
} as const;

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    // ngrok requires this header to skip the browser warning page
    'ngrok-skip-browser-warning': 'true',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  async (config: import('axios').InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — normalise errors
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: import('axios').AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? 0;
    const method = error.config?.method?.toUpperCase() ?? 'REQUEST';
    const url = error.config?.url ?? '';
    const serverMessage = error.response?.data?.message;
    const validationErrors = error.response?.data?.errors;

    // Flatten Laravel validation errors into a single string
    let message = serverMessage ?? 'An unexpected error occurred.';
    if (validationErrors) {
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey) {
        message = validationErrors[firstKey][0];
      }
    }

    // -----------------------------------------------------------------------
    // Structured console log — visible in Metro / Logcat / Xcode console
    // -----------------------------------------------------------------------
    console.error(
      `[API Error] ${method} ${url}\n` +
      `  Status  : ${status}\n` +
      `  Message : ${message}` +
      (validationErrors
        ? `\n  Validation: ${JSON.stringify(validationErrors, null, 2)}`
        : '') +
      (error.response?.data
        ? `\n  Raw Response: ${JSON.stringify(error.response.data, null, 2)}`
        : ''),
    );

    const normalised = Object.assign(new Error(message), {
      status,
      isApiError: true,
      validationErrors,
    });

    return Promise.reject(normalised);
  },
);

export default apiClient;

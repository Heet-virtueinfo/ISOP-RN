import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://isop.virtueinfo.com';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_PROFILE: '@user_profile',
} as const;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

apiClient.interceptors.request.use(
  async (config: import('axios').InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log('\n———————————————— API REQUEST ————————————————');
    console.log(`[Method]  : ${config.method?.toUpperCase()}`);
    console.log(`[URL]     : ${fullUrl}`);
    console.log(`[Headers] :`, JSON.stringify(config.headers, null, 2));

    if (config.data) {
      if (config.data instanceof FormData) {
        console.log('[Body]    : (FormData Upload)');
        console.log(config.data);
      } else {
        console.log('[Body]    :', JSON.stringify(config.data, null, 2));
      }
    }
    console.log('———————————————————————————————————————————————\n');

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (
    error: import('axios').AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>,
  ) => {
    const status = error.response?.status ?? 0;
    const method = error.config?.method?.toUpperCase() ?? 'REQUEST';
    const url = error.config?.url ?? '';
    const serverMessage = error.response?.data?.message;
    const validationErrors = error.response?.data?.errors;

    let message = serverMessage ?? 'An unexpected error occurred.';
    if (validationErrors) {
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey) {
        message = validationErrors[firstKey][0];
      }
    }

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

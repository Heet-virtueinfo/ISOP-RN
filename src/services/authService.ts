import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { STORAGE_KEYS } from '../config/api';
import { UserProfile } from '../types';
import { transformUser } from '../utils/transformUser';

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  countryCode: string;
  profileImage?: string | null;
}

const persistSession = async (
  token: string,
  user: UserProfile,
): Promise<void> => {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN, token],
    [STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)],
  ]);
};

const clearSession = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.USER_PROFILE,
  ]);
};

export const registerUser = async (
  data: RegisterPayload,
): Promise<{ success: boolean; user: UserProfile }> => {
  console.log('data', data);
  const payload = {
    full_name: data.fullName,
    email: data.email,
    password: data.password,
    country_code: data.countryCode,
    mobile: data.mobile,
    phone_number: `${data.countryCode}${data.mobile}`,
    profile_image:
      data.profileImage
        ? data.profileImage
        : 'https://api.isop.com/storage/media/profiles/default.jpg',
  };

  const response = await apiClient.post('/api/auth/register', payload);

  const token: string = response.data.token;
  const user: UserProfile = transformUser(response.data.user ?? response.data);

  try {
    await persistSession(token, user);
    return { success: true, user };
  } catch (error: any) {
    console.error('[Auth] registerUser failed:', error?.message, error);
    throw error;
  }
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ success: boolean; user: UserProfile }> => {
  try {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });

    const token: string = response.data.token;
    const user: UserProfile = transformUser(
      response.data.user ?? response.data,
    );

    await persistSession(token, user);
    return { success: true, user };
  } catch (error: any) {
    console.error('[Auth] loginUser failed:', error?.message, error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error: any) {
    console.error(
      '[Auth] logoutUser API call failed (clearing local session anyway):',
      error?.message,
    );
  } finally {
    await clearSession();
  }
};

export const resetPassword = async (
  email: string,
): Promise<{ success: boolean }> => {
  try {
    await apiClient.post('/api/auth/forgot-password', { email });
    return { success: true };
  } catch (error: any) {
    console.error('[Auth] resetPassword failed:', error?.message, error);
    throw error;
  }
};

export const fetchMe = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get('/api/user/profile');
    return transformUser(
      response.data.data ?? response.data.user ?? response.data,
    );
  } catch (error: any) {
    console.error(
      '[Auth] fetchMe failed (session restore may fall back to cache):',
      error?.message,
    );
    return null;
  }
};

export const updateFcmToken = async (
  fcmToken: string | null,
): Promise<void> => {
  try {
    await apiClient.post('/api/user/notifications/token', {
      fcm_token: fcmToken,
    });
  } catch (error: any) {
    console.error('[Auth] updateFcmToken failed:', error?.message);
  }
};

export const getStoredUser = async (): Promise<UserProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch (_) {
    return null;
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {
    await apiClient.delete('/api/user/profile');
  } catch (error: any) {
    console.error('[Auth] deleteAccount API call failed:', error?.message);
  } finally {
    await clearSession();
  }
};



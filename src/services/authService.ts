/**
 * src/services/authService.ts
 *
 * Auth operations against the Laravel API.
 * Token + profile are persisted in AsyncStorage so the session survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { STORAGE_KEYS } from '../config/api';
import { UserProfile } from '../types';
import { transformUser } from '../utils/transformUser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Persist auth token and user profile to AsyncStorage. */
const persistSession = async (token: string, user: UserProfile): Promise<void> => {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN, token],
    [STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)],
  ]);
};

/** Clear auth token and user profile from AsyncStorage. */
const clearSession = async (): Promise<void> => {
  await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_PROFILE]);
};

// ---------------------------------------------------------------------------
// Auth operations
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * Sends all fields (including the profile image as a local file) directly to
 * the Laravel API as multipart/form-data. No third-party image service is used.
 */
export const registerUser = async (data: RegisterPayload): Promise<{ success: boolean; user: UserProfile }> => {
  // Build multipart/form-data — send the local file path directly to Laravel
  const form = new FormData();
  form.append('full_name', data.fullName);
  form.append('email', data.email);
  form.append('password', data.password);
  form.append('mobile', `${data.countryCode}${data.mobile}`);

  if (data.profileImage) {
    // Extract filename + infer MIME type from path extension
    const filename = data.profileImage.split('/').pop() ?? 'profile.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    form.append('profile_image', {
      uri: data.profileImage,
      name: filename,
      type: mimeType,
    } as any);
  }

  const response = await apiClient.post('/api/auth/register', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

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

/**
 * Login an existing user.
 * Returns the UserProfile; navigation is driven by AuthContext state change.
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<{ success: boolean; user: UserProfile }> => {
  try {
    const response = await apiClient.post('/api/auth/login', { email, password });

    const token: string = response.data.token;
    const user: UserProfile = transformUser(response.data.user ?? response.data);

    await persistSession(token, user);
    return { success: true, user };
  } catch (error: any) {
    console.error('[Auth] loginUser failed:', error?.message, error);
    throw error;
  }
};

/**
 * Logout the current user.
 * Hits the Laravel logout endpoint (which invalidates the Sanctum token), then
 * removes the token and profile from AsyncStorage regardless of the API result.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error: any) {
    console.error('[Auth] logoutUser API call failed (clearing local session anyway):', error?.message);
  } finally {
    await clearSession();
  }
};

/**
 * Request a password-reset email.
 */
export const resetPassword = async (email: string): Promise<{ success: boolean }> => {
  try {
    await apiClient.post('/api/auth/forgot-password', { email });
    return { success: true };
  } catch (error: any) {
    console.error('[Auth] resetPassword failed:', error?.message, error);
    throw error;
  }
};

/**
 * Fetch the authenticated user's profile from the API.
 * Used to restore / refresh the session on app launch.
 */
export const fetchMe = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get('/api/user/profile');
    return transformUser(response.data.data ?? response.data.user ?? response.data);
  } catch (error: any) {
    console.error('[Auth] fetchMe failed (session restore may fall back to cache):', error?.message);
    return null;
  }
};

/**
 * Update the authenticated user's FCM token upon granting permission or refresh.
 */
export const updateFcmToken = async (fcmToken: string): Promise<void> => {
  try {
    await apiClient.post('/api/user/notifications/token', { fcm_token: fcmToken });
  } catch (error: any) {
    console.error('[Auth] updateFcmToken failed:', error?.message);
  }
};

/**
 * Read a persisted user profile from AsyncStorage (offline / quick-restore).
 */
export const getStoredUser = async (): Promise<UserProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch (_) {
    return null;
  }
};

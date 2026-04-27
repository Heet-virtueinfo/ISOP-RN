/**
 * src/contexts/AuthContext.tsx
 *
 * Token-based auth context for the Laravel API.
 * Replaces the Firebase onAuthStateChanged + Firestore onSnapshot listeners.
 *
 * Session restore flow (on mount):
 *   1. Read token from AsyncStorage.
 *   2. If token exists → call GET /api/auth/me to validate and get fresh profile.
 *   3. Fall back to cached profile in AsyncStorage if the API call fails (offline).
 *   4. If no token → user is logged out.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { STORAGE_KEYS } from '../config/api';
import { fetchMe, getStoredUser, logoutUser } from '../services/authService';
import { notificationService } from '../services/notificationService';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface AuthContextType {
  /** Raw user object (same shape as UserProfile for the Laravel API) */
  user: UserProfile | null;
  /** Full user profile from the API */
  userProfile: UserProfile | null;
  /** True while the initial session restore is in progress */
  loading: boolean;
  /** Log the user out */
  logout: () => Promise<void>;
  /** Re-fetch the user profile from the API */
  refreshProfile: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fcmInitialized = useRef(false);
  const tokenRefreshUnsubscribe = useRef<(() => void) | null>(null);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const applyProfile = async (profile: UserProfile) => {
    setUserProfile(profile);

    // Initialise FCM only for regular users
    if (profile.role === 'user' && !fcmInitialized.current) {
      fcmInitialized.current = true;
      const granted = await notificationService.requestPermission();
      if (granted) {
        notificationService.updateUserToken(profile.uid, profile.fcmToken);
      }
      if (!tokenRefreshUnsubscribe.current) {
        tokenRefreshUnsubscribe.current = notificationService.onTokenRefresh(
          profile.uid,
        );
      }
    }
  };

  const clearProfile = () => {
    setUserProfile(null);
    fcmInitialized.current = false;
    if (tokenRefreshUnsubscribe.current) {
      tokenRefreshUnsubscribe.current();
      tokenRefreshUnsubscribe.current = null;
    }
  };

  // -------------------------------------------------------------------------
  // Session restore on mount
  // -------------------------------------------------------------------------

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
          // No token — user is logged out
          return;
        }

        // Try to get a fresh profile from the API
        const freshProfile = await fetchMe();

        if (freshProfile) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_PROFILE,
            JSON.stringify(freshProfile),
          );
          await applyProfile(freshProfile);
        } else {
          // API unreachable — fall back to cached profile
          const cachedProfile = await getStoredUser();
          if (cachedProfile) {
            await applyProfile(cachedProfile);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Session restore error:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    return () => {
      if (tokenRefreshUnsubscribe.current) {
        tokenRefreshUnsubscribe.current();
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Public actions
  // -------------------------------------------------------------------------

  const refreshProfile = async () => {
    try {
      const fresh = await fetchMe();
      if (fresh) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(fresh),
        );
        setUserProfile(fresh);
      }
    } catch (error) {
      console.error('[AuthContext] refreshProfile error:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser(); // hits /api/auth/logout + clears AsyncStorage
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      clearProfile();
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // After login / register — called by authService which calls persistSession.
  // The navigator will re-render because userProfile changes.
  // We expose a helper so screens can push the profile into context immediately
  // after a successful login/register without waiting for a full restoreSession.
  // -------------------------------------------------------------------------

  // Listen for profile stored by authService (login / register set AsyncStorage,
  // so we poll once after those operations complete via the login / register hooks
  // in the screens themselves calling refreshProfile).

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user: userProfile, // keep `user` as alias for backward compat
        userProfile,
        loading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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


interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fcmInitialized = useRef(false);
  const tokenRefreshUnsubscribe = useRef<(() => void) | null>(null);

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

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
          return;
        }

        const freshProfile = await fetchMe();

        console.log('[AuthContext] Fresh profile:', freshProfile);

        if (freshProfile) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_PROFILE,
            JSON.stringify(freshProfile),
          );
          await applyProfile(freshProfile);
        } else {
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

  const refreshProfile = async () => {
    try {
      const fresh = await fetchMe();
      if (fresh) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(fresh),
        );
        await applyProfile(fresh);
      }
    } catch (error) {
      console.error('[AuthContext] refreshProfile error:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (userProfile?.role === 'user') {
        await notificationService.deleteUserToken();
      }
      await logoutUser();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      clearProfile();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

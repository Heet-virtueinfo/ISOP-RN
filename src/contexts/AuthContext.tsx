import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuth, firebaseFirestore } from '../config/firebase';
import { UserProfile, UserRole } from '../types';
import { COLLECTIONS } from '../constants/collections';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Constants for AsyncStorage
  const STORAGE_KEY_ROLE = '@user_role';

  const fetchProfile = async (uid: string) => {
    try {
      const doc = await firebaseFirestore
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .get();
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setUserProfile(data);
        // Cache role for faster initial loads
        await AsyncStorage.setItem(STORAGE_KEY_ROLE, data.role);
      } else {
        console.warn('No user profile found in Firestore for UID:', uid);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = firebaseAuth.onAuthStateChanged(async firebaseUser => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Stop any existing profile listener
        if (profileUnsubscribe) profileUnsubscribe();

        // Start a real-time listener for the user profile document
        profileUnsubscribe = firebaseFirestore
          .collection(COLLECTIONS.USERS)
          .doc(firebaseUser.uid)
          .onSnapshot(
            async doc => {
              if (doc.exists()) {
                const data = doc.data() as UserProfile;
                setUserProfile(data);
                // Cache role for faster initial loads
                await AsyncStorage.setItem(STORAGE_KEY_ROLE, data.role);
              } else {
                console.warn('No user profile found for UID:', firebaseUser.uid);
                setUserProfile(null);
              }
              setLoading(false);
            },
            error => {
              console.error('Real-time profile listener error:', error);
              setLoading(false);
            },
          );
      } else {
        // Cleanup on logout
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }
        setUserProfile(null);
        await AsyncStorage.removeItem(STORAGE_KEY_ROLE);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseAuth.signOut();
      // Note: State cleanup is handled within the onAuthStateChanged effect above
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, logout, refreshProfile }}
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

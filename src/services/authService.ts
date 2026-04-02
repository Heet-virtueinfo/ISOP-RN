import firestore from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseFirestore, ADMIN_UID } from '../config/firebase';
import { UserProfile, UserRole } from '../types';
import { COLLECTIONS } from '../constants/collections';

import { uploadImageToCloudinary } from './uploadService';

export const checkIsAdmin = (uid: string): boolean => {
  return uid === ADMIN_UID;
};

export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  countryCode: string;
  profileImage?: string | null;
}) => {
  try {
    // 1. Upload Image if present
    let uploadedImageUrl = null;
    if (data.profileImage) {
      uploadedImageUrl = await uploadImageToCloudinary(data.profileImage, 'ISOP/Profile');
    }

    // 2. Create Auth Account
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
      data.email,
      data.password,
    );

    const uid = userCredential.user.uid;
    const role: UserRole = checkIsAdmin(uid) ? 'admin' : 'user';

    // 3. Create Firestore Profile
    const profile: UserProfile = {
      uid,
      email: data.email,
      displayName: data.fullName,
      role,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      ...(data.mobile && {
        phoneNumber: `${data.countryCode}${data.mobile}`,
      }),
      ...(uploadedImageUrl && {
        profileImage: uploadedImageUrl,
      }),
    };

    await firebaseFirestore.collection(COLLECTIONS.USERS).doc(uid).set(profile);
    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Registration Error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(
      email,
      password,
    );
    const uid = userCredential.user.uid;

    // Fetch Profile
    const userDoc = await firebaseFirestore
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .get();
    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() as UserProfile };
    }

    // Fallback if doc doesn't exist (e.g. manually created auth user)
    const role: UserRole = checkIsAdmin(uid) ? 'admin' : 'user';
    return {
      success: true,
      user: {
        uid,
        email,
        role,
        displayName: '',
        createdAt: null,
      } as UserProfile,
    };
  } catch (error: any) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  return await firebaseAuth.signOut();
};

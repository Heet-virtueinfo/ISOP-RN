import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from '@react-native-firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
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
    let uploadedImageUrl = null;
    if (data.profileImage) {
      uploadedImageUrl = await uploadImageToCloudinary(
        data.profileImage,
        'ISOP/Profile',
      );
    }

    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      data.email,
      data.password,
    );

    const uid = userCredential.user.uid;
    const role: UserRole = checkIsAdmin(uid) ? 'admin' : 'user';

    const profile: UserProfile = {
      uid,
      email: data.email,
      displayName: data.fullName,
      role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...(data.mobile && {
        phoneNumber: `${data.countryCode}${data.mobile}`,
      }),
      ...(uploadedImageUrl && {
        profileImage: uploadedImageUrl,
      }),
    };

    await setDoc(doc(firebaseFirestore, COLLECTIONS.USERS, uid), profile);
    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Registration Error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(
      doc(firebaseFirestore, COLLECTIONS.USERS, uid),
    );

    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() as UserProfile };
    }
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
  return await signOut(firebaseAuth);
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    throw error;
  }
};

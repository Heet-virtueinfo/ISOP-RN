import firestore from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { uploadImageToCloudinary } from './uploadService';

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    let finalData = { ...data };

    if (data.profileImage && !data.profileImage.startsWith('http')) {
      const imageUrl = await uploadImageToCloudinary(
        data.profileImage,
        'ISOP/Profile',
      );
      if (imageUrl) {
        finalData.profileImage = imageUrl;
      }
    }

    const userRef = firebaseFirestore.collection(COLLECTIONS.USERS).doc(uid);

    const updateData = {
      ...finalData,
      updatedAt: firestore.Timestamp.now(),
    };

    await userRef.update(updateData);
    return { success: true };
  } catch (error) {
    console.error('Update User Profile Error:', error);
    throw error;
  }
};

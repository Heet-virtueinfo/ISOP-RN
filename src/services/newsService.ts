import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { NewsArticle } from '../types';
import { uploadImageToCloudinary } from './uploadService';

// Real-time listener for all news articles
export const listenToAllNews = (callback: (news: NewsArticle[]) => void) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.NEWS),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const newsList = snapshot.docs.map((doc: any) => {
      return { id: doc.id, ...doc.data() } as NewsArticle;
    });
    callback(newsList);
  }, error => {
    console.error("Error listening to news:", error);
  });
};

export const addNewsArticle = async (data: Partial<NewsArticle>) => {
  try {
    let finalData = { ...data };

    // Handle image upload if a local URI is provided
    if (data.imageUrl && !data.imageUrl.startsWith('http')) {
      const remoteUrl = await uploadImageToCloudinary(data.imageUrl, 'ISOP/News');
      if (remoteUrl) {
        finalData.imageUrl = remoteUrl;
      } else {
         throw new Error("Failed to upload image");
      }
    }

    const newsRef = doc(collection(firebaseFirestore, COLLECTIONS.NEWS));
    const newsItem: NewsArticle = {
      id: newsRef.id,
      title: finalData.title || '',
      content: finalData.content || '',
      type: finalData.type || 'news',
      imageUrl: finalData.imageUrl || null,
      linkUrl: finalData.linkUrl || null,
      createdBy: finalData.createdBy || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(newsRef, newsItem);
    return { success: true, id: newsRef.id };
  } catch (error) {
    console.error("Error adding news:", error);
    throw error;
  }
};

export const deleteNewsArticle = async (newsId: string) => {
  try {
    await deleteDoc(doc(firebaseFirestore, COLLECTIONS.NEWS, newsId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
};

export const updateNewsArticle = async (newsId: string, data: Partial<NewsArticle>) => {
  try {
    let finalData = { ...data };

    // Handle image upload if a local URI is provided
    if (data.imageUrl && !data.imageUrl.startsWith('http')) {
      const remoteUrl = await uploadImageToCloudinary(data.imageUrl, 'ISOP/News');
      if (remoteUrl) {
        finalData.imageUrl = remoteUrl;
      } else {
        throw new Error("Failed to upload image");
      }
    }

    const newsRef = doc(firebaseFirestore, COLLECTIONS.NEWS, newsId);
    await setDoc(newsRef, {
      ...finalData,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
};

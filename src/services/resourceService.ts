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
import { ResourceItem } from '../types';

export const listenToResources = (callback: (resources: ResourceItem[]) => void) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.RESOURCES),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const resourcesList = snapshot.docs.map((doc: any) => {
      return { id: doc.id, ...doc.data() } as ResourceItem;
    });
    callback(resourcesList);
  }, error => {
    console.error("Error listening to resources:", error);
  });
};

export const addResourceItem = async (data: Partial<ResourceItem>) => {
  try {
    const resourceRef = doc(collection(firebaseFirestore, COLLECTIONS.RESOURCES));
    const resource: ResourceItem = {
      id: resourceRef.id,
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'other',
      type: data.type || 'link',
      url: data.url || '',
      createdBy: data.createdBy || '',
      createdAt: Timestamp.now(),
    };

    await setDoc(resourceRef, resource);
    return { success: true, id: resourceRef.id };
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
};

export const deleteResourceItem = async (resourceId: string) => {
  try {
    await deleteDoc(doc(firebaseFirestore, COLLECTIONS.RESOURCES, resourceId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};

export const updateResourceItem = async (resourceId: string, data: Partial<ResourceItem>) => {
  try {
    const resourceRef = doc(firebaseFirestore, COLLECTIONS.RESOURCES, resourceId);
    await setDoc(resourceRef, {
      ...data,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
};

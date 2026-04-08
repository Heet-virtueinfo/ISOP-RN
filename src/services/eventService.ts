import {
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { AppEvent } from '../types';
import { COLLECTIONS } from '../constants/collections';
import { uploadImageToCloudinary } from './uploadService';

// CREATE EVENT
export const createEvent = async (
  data: Omit<
    AppEvent,
    'id' | 'createdAt' | 'updatedAt' | 'enrolledCount' | 'createdBy'
  > & { createdBy: string },
) => {
  try {
    const uploadedImages = await Promise.all(
      (data.images || []).map(async img => {
        if (img.startsWith('http')) return img;
        return await uploadImageToCloudinary(img, 'ISOP/event');
      }),
    );

    const finalImages = uploadedImages.filter(
      (img): img is string => img !== null,
    );

    const eventRef = doc(collection(firebaseFirestore, COLLECTIONS.EVENTS));
    const newEvent: AppEvent = {
      id: eventRef.id,
      ...data,
      images: finalImages,
      enrolledCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(eventRef, newEvent);
    return { success: true, event: newEvent };
  } catch (error) {
    console.error('Create Event Error:', error);
    throw error;
  }
};

// GET ALL EVENTS (Real-time listener for Admin Dashboard)
export const getEvents = (callback: (events: AppEvent[]) => void) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.EVENTS),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const eventsList = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as AppEvent,
      );
      callback(eventsList);
    },
    error => {
      console.error('Get Events Error:', error);
    },
  );
};

// GET ACTIVE EVENTS (For User Home / Events Screen)
export const getActiveEvents = (callback: (events: AppEvent[]) => void) => {
  const now = Timestamp.now();
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.EVENTS),
    orderBy('date', 'asc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const eventsList = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as AppEvent,
      );
      // Filter out ended events
      const activeEvents = eventsList.filter((event: AppEvent) => {
        const targetTimestamp = event.endDate || event.date;
        const targetTime =
          typeof targetTimestamp.toMillis === 'function'
            ? targetTimestamp.toMillis()
            : new Date(targetTimestamp as any).getTime();
        return targetTime > now.toMillis();
      });
      callback(activeEvents);
    },
    error => {
      console.error('Get Active Events Error:', error);
    },
  );
};

// LISTEN TO SINGLE EVENT (Real-time)
export const listenToEvent = (
  id: string,
  callback: (event: AppEvent | null) => void,
) => {
  return onSnapshot(
    doc(firebaseFirestore, COLLECTIONS.EVENTS, id),
    snapshot => {
      if (snapshot.exists()) {
        callback(snapshot.data() as AppEvent);
      } else {
        callback(null);
      }
    },
    error => {
      console.error('Listen To Event Error:', error);
    },
  );
};

// GET SINGLE EVENT (One-time fetch for static checks)
export const getEventById = async (id: string): Promise<AppEvent | null> => {
  try {
    const snapshot = await getDoc(
      doc(firebaseFirestore, COLLECTIONS.EVENTS, id),
    );
    if (snapshot.exists()) {
      return snapshot.data() as AppEvent;
    }
    return null;
  } catch (error) {
    console.error('Get Event By ID Error:', error);
    throw error;
  }
};

// Helper: commit batched writes in chunks of 499 (Firestore limit is 500)
const commitInChunks = async (
  docs: FirebaseFirestoreTypes.QueryDocumentSnapshot[],
  updater: (
    batch: FirebaseFirestoreTypes.WriteBatch,
    doc: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ) => void,
) => {
  const CHUNK_SIZE = 499;
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(firebaseFirestore);
    chunk.forEach(doc => updater(batch, doc));
    await batch.commit();
  }
};

// UPDATE EVENT
export const updateEvent = async (id: string, updates: Partial<AppEvent>) => {
  try {
    let finalUpdates = { ...updates };

    // Support image updates with upload
    if (updates.images) {
      const uploadedImages = await Promise.all(
        updates.images.map(async img => {
          if (img.startsWith('http')) return img;
          return await uploadImageToCloudinary(img, 'ISOP/event');
        }),
      );
      finalUpdates.images = uploadedImages.filter(
        (img): img is string => img !== null,
      );
    }

    // Update the event document
    await updateDoc(doc(firebaseFirestore, COLLECTIONS.EVENTS, id), {
      ...finalUpdates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update Event Error:', error);
    throw error;
  }
};

// DELETE EVENT
export const deleteEvent = async (id: string) => {
  try {
    // 1. Delete the event document
    await deleteDoc(doc(firebaseFirestore, COLLECTIONS.EVENTS, id));

    // 2. Cascade delete all enrollments for this event
    const enrollmentsQuery = query(
      collection(firebaseFirestore, COLLECTIONS.ENROLLMENTS),
      where('eventId', '==', id),
    );
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

    if (!enrollmentsSnapshot.empty) {
      await commitInChunks(enrollmentsSnapshot.docs, (batch, doc) => {
        batch.delete(doc.ref);
      });
    }

    // 3. Cascade delete all chatRequests for this event
    const chatReqQuery = query(
      collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
      where('eventId', '==', id),
    );
    const chatReqSnapshot = await getDocs(chatReqQuery);

    if (!chatReqSnapshot.empty) {
      await commitInChunks(chatReqSnapshot.docs, (batch, doc) => {
        batch.delete(doc.ref);
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Delete Event Error:', error);
    throw error;
  }
};

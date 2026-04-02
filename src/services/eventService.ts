import firestore from '@react-native-firebase/firestore';
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
    // 1. Upload Images to Cloudinary if they are local paths
    const uploadedImages = await Promise.all(
      (data.images || []).map(async (img) => {
        if (img.startsWith('http')) return img; // Already a URL
        return await uploadImageToCloudinary(img, 'ISOP/event');
      })
    );

    // Filter out any failed uploads
    const finalImages = uploadedImages.filter((img): img is string => img !== null);

    const eventRef = firebaseFirestore.collection(COLLECTIONS.EVENTS).doc();
    const newEvent: AppEvent = {
      id: eventRef.id,
      ...data,
      images: finalImages,
      enrolledCount: 0,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    };

    await eventRef.set(newEvent);
    return { success: true, event: newEvent };
  } catch (error) {
    console.error('Create Event Error:', error);
    throw error;
  }
};

// GET ALL EVENTS (Real-time listener for Admin Dashboard)
export const getEvents = (callback: (events: AppEvent[]) => void) => {
  return firebaseFirestore
    .collection(COLLECTIONS.EVENTS)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const eventsList = snapshot.docs.map(doc => doc.data() as AppEvent);
        callback(eventsList);
      },
      error => {
        console.error('Get Events Error:', error);
      },
    );
};

// GET ACTIVE EVENTS (For User Home / Events Screen)
export const getActiveEvents = (callback: (events: AppEvent[]) => void) => {
  const now = firestore.Timestamp.now();
  // Simplified query: Getting all events and filtering out past ones client-side
  // or using date field if index is available. Let's just fetch all ordered by date and
  // filter active ones for simplicity without requiring immediate composite index setup.
  return firebaseFirestore
    .collection(COLLECTIONS.EVENTS)
    .orderBy('date', 'asc')
    .onSnapshot(
      snapshot => {
        const eventsList = snapshot.docs.map(doc => doc.data() as AppEvent);
        // Filter out ended events
        const activeEvents = eventsList.filter(event => {
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

// GET SINGLE EVENT
export const getEventById = async (id: string): Promise<AppEvent | null> => {
  try {
    const doc = await firebaseFirestore
      .collection(COLLECTIONS.EVENTS)
      .doc(id)
      .get();
    if (doc.exists()) {
      return doc.data() as AppEvent;
    }
    return null;
  } catch (error) {
    console.error('Get Event By ID Error:', error);
    throw error;
  }
};

// UPDATE EVENT
export const updateEvent = async (id: string, updates: Partial<AppEvent>) => {
  try {
    let finalUpdates = { ...updates };

    // Support image updates with upload
    if (updates.images) {
      const uploadedImages = await Promise.all(
        updates.images.map(async (img) => {
          if (img.startsWith('http')) return img;
          return await uploadImageToCloudinary(img, 'ISOP/event');
        })
      );
      finalUpdates.images = uploadedImages.filter((img): img is string => img !== null);
    }

    await firebaseFirestore
      .collection(COLLECTIONS.EVENTS)
      .doc(id)
      .update({
        ...finalUpdates,
        updatedAt: firestore.Timestamp.now(),
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
    // Note: We also need a cloud function or batch process to delete enrollments for this event,
    // but for now we focus on the event document deletion on free tier.
    await firebaseFirestore.collection(COLLECTIONS.EVENTS).doc(id).delete();

    // Attempting to batch delete enrollments client side is possible but might be heavy.
    // For free tier simplicity, we just delete the event document now.
    const enrollmentsSnapshot = await firebaseFirestore
      .collection(COLLECTIONS.ENROLLMENTS)
      .where('eventId', '==', id)
      .get();

    if (!enrollmentsSnapshot.empty) {
      const batch = firebaseFirestore.batch();
      enrollmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    return { success: true };
  } catch (error) {
    console.error('Delete Event Error:', error);
    throw error;
  }
};

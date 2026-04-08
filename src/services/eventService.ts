import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
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
    // 1. Upload Main Event Images
    const uploadedImages = await Promise.all(
      (data.images || []).map(async img => {
        if (img.startsWith('http')) return img;
        return await uploadImageToCloudinary(img, 'ISOP/event');
      }),
    );

    // 2. Upload Speaker Images
    const finalSpeakers = await Promise.all(
      (data.speakers || []).map(async speaker => {
        if (!speaker.image || speaker.image.startsWith('http')) return speaker;
        const uploadedUrl = await uploadImageToCloudinary(
          speaker.image,
          'ISOP/speakers',
        );
        return { ...speaker, image: uploadedUrl };
      }),
    );

    // Filter out any failed uploads for main images
    const finalImages = uploadedImages.filter(
      (img): img is string => img !== null,
    );

    const eventRef = firebaseFirestore.collection(COLLECTIONS.EVENTS).doc();
    const newEvent: AppEvent = {
      id: eventRef.id,
      ...data,
      images: finalImages,
      speakers: finalSpeakers,
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

// LISTEN TO SINGLE EVENT (Real-time)
export const listenToEvent = (
  id: string,
  callback: (event: AppEvent | null) => void,
) => {
  return firebaseFirestore
    .collection(COLLECTIONS.EVENTS)
    .doc(id)
    .onSnapshot(
      doc => {
        if (doc.exists()) {
          callback(doc.data() as AppEvent);
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

// Helper: commit batched writes in chunks of 499 (Firestore limit is 500)
const commitInChunks = async (
  docs: FirebaseFirestoreTypes.QueryDocumentSnapshot[],
  updater: (batch: FirebaseFirestoreTypes.WriteBatch, doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => void,
) => {
  const CHUNK_SIZE = 499;
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = firebaseFirestore.batch();
    chunk.forEach(doc => updater(batch, doc));
    await batch.commit();
  }
};

// UPDATE EVENT
export const updateEvent = async (id: string, updates: Partial<AppEvent>) => {
  try {
    let finalUpdates = { ...updates };

    // 1. Support main image updates
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

    // 2. Support speaker image updates
    if (updates.speakers) {
      finalUpdates.speakers = await Promise.all(
        updates.speakers.map(async speaker => {
          if (!speaker.image || speaker.image.startsWith('http')) return speaker;
          const uploadedUrl = await uploadImageToCloudinary(
            speaker.image,
            'ISOP/speakers',
          );
          return { ...speaker, image: uploadedUrl };
        }),
      );
    }

    // 3. Update the event document itself
    await firebaseFirestore
      .collection(COLLECTIONS.EVENTS)
      .doc(id)
      .update({
        ...finalUpdates,
        updatedAt: firestore.Timestamp.now(),
      });

    // 2. Cascade denormalized fields to related collections
    const needsTitleSync = finalUpdates.title !== undefined;
    const needsDateSync = finalUpdates.date !== undefined;

    if (needsTitleSync || needsDateSync) {
      // 2a. Update enrollments (eventTitle + eventDate)
      try {
        const enrollSnap = await firebaseFirestore
          .collection(COLLECTIONS.ENROLLMENTS)
          .where('eventId', '==', id)
          .get();

        if (!enrollSnap.empty) {
          await commitInChunks(enrollSnap.docs, (batch, doc) => {
            const enrollUpdate: Record<string, any> = {};
            if (needsTitleSync) enrollUpdate.eventTitle = finalUpdates.title;
            if (needsDateSync) enrollUpdate.eventDate = finalUpdates.date;
            batch.update(doc.ref, enrollUpdate);
          });
        }
      } catch (cascadeErr) {
        console.warn('Enrollment cascade warning:', cascadeErr);
      }

      // 2b. Update chatRequests (eventTitle only)
      if (needsTitleSync) {
        try {
          const chatReqSnap = await firebaseFirestore
            .collection(COLLECTIONS.CHAT_REQUESTS)
            .where('eventId', '==', id)
            .get();

          if (!chatReqSnap.empty) {
            await commitInChunks(chatReqSnap.docs, (batch, doc) => {
              batch.update(doc.ref, { eventTitle: finalUpdates.title });
            });
          }
        } catch (cascadeErr) {
          console.warn('ChatRequests cascade warning:', cascadeErr);
        }
      }
    }

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
    await firebaseFirestore.collection(COLLECTIONS.EVENTS).doc(id).delete();

    // 2. Cascade delete all enrollments for this event
    const enrollmentsSnapshot = await firebaseFirestore
      .collection(COLLECTIONS.ENROLLMENTS)
      .where('eventId', '==', id)
      .get();

    if (!enrollmentsSnapshot.empty) {
      await commitInChunks(enrollmentsSnapshot.docs, (batch, doc) => {
        batch.delete(doc.ref);
      });
    }

    // 3. Cascade delete all chatRequests for this event
    const chatReqSnapshot = await firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .where('eventId', '==', id)
      .get();

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

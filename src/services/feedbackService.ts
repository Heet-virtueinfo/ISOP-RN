import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
  runTransaction,
  serverTimestamp,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { Feedback, AppEvent, UserProfile } from '../types';

export const submitFeedback = async (
  eventId: string,
  userProfile: UserProfile,
  rating: number,
  comment: string
): Promise<{ success: boolean; message?: string; newFeedback?: Feedback }> => {
  try {
    const eventRef = doc(firebaseFirestore, COLLECTIONS.EVENTS, eventId);
    const feedbackRef = doc(collection(firebaseFirestore, COLLECTIONS.FEEDBACKS));

    await runTransaction(firebaseFirestore, async transaction => {
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) {
        throw new Error('Event does not exist!');
      }

      const eventData = eventDoc.data() as AppEvent;
      const currentRatingCount = eventData.ratingCount || 0;
      const currentAvgRating = eventData.averageRating || 0;

      // Calculate new average rating
      const newRatingCount = currentRatingCount + 1;
      const newAvgRating =
        (currentAvgRating * currentRatingCount + rating) / newRatingCount;

      // Prepare feedback data
      const feedbackData: Omit<Feedback, 'id'> = {
        eventId,
        uid: userProfile.uid,
        userName: userProfile.displayName,
        userImage: userProfile.profileImage || null,
        rating,
        comment,
        createdAt: serverTimestamp() as any,
      };

      // Set new feedback doc
      transaction.set(feedbackRef, feedbackData);

      // Update event doc
      transaction.update(eventRef, {
        averageRating: newAvgRating,
        ratingCount: newRatingCount,
      });
    });

    const newFeedback: Feedback = {
      id: feedbackRef.id,
      eventId,
      uid: userProfile.uid,
      userName: userProfile.displayName,
      userImage: userProfile.profileImage || null,
      rating,
      comment,
      createdAt: new Date(), // Local fallback
    };

    return { success: true, newFeedback };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, message: 'Failed to submit feedback.' };
  }
};

export const checkUserFeedback = async (
  eventId: string,
  uid: string
): Promise<Feedback | null> => {
  try {
    const q = query(
      collection(firebaseFirestore, COLLECTIONS.FEEDBACKS),
      where('eventId', '==', eventId),
      where('uid', '==', uid),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const feedbackDoc = snapshot.docs[0];
    return {
      id: feedbackDoc.id,
      ...feedbackDoc.data(),
    } as Feedback;
  } catch (error) {
    console.error('Error checking user feedback:', error);
    return null;
  }
};

export const getEventFeedback = (
  eventId: string,
  callback: (feedbacks: Feedback[]) => void
) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.FEEDBACKS),
    where('eventId', '==', eventId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    snapshot => {
      if (!snapshot) {
        callback([]);
        return;
      }
      const feedbacks: Feedback[] = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as Feedback[];
      callback(feedbacks);
    },
    error => {
      console.error('Error listening to feedback:', error);
      callback([]);
    }
  );
};

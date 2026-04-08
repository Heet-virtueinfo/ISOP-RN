import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  Timestamp,
  increment,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { Enrollment, AppEvent, UserProfile } from '../types';
import { COLLECTIONS } from '../constants/collections';

// ENROLL IN EVENT
export const enrollInEvent = async (
  event: AppEvent,
  userProfile: UserProfile,
) => {
  try {
    const enrollmentRef = doc(
      collection(firebaseFirestore, COLLECTIONS.ENROLLMENTS),
    );
    const eventRef = doc(firebaseFirestore, COLLECTIONS.EVENTS, event.id);

    const enrollment: Enrollment = {
      id: enrollmentRef.id,
      eventId: event.id,
      uid: userProfile.uid,
      displayName: userProfile.displayName,
      email: userProfile.email,
      profileImage: userProfile.profileImage || null,
      enrolledAt: Timestamp.now(),
    };

    const batch = writeBatch(firebaseFirestore);
    batch.set(enrollmentRef, enrollment);
    batch.update(eventRef, {
      enrolledCount: increment(1),
      updatedAt: Timestamp.now(),
    });

    await batch.commit();
    return { success: true, enrollment };
  } catch (error) {
    console.error('Enroll In Event Error:', error);
    throw error;
  }
};

// UNENROLL FROM EVENT
export const unenrollFromEvent = async (
  enrollmentId: string,
  eventId: string,
) => {
  try {
    const enrollmentRef = doc(
      firebaseFirestore,
      COLLECTIONS.ENROLLMENTS,
      enrollmentId,
    );
    const eventRef = doc(firebaseFirestore, COLLECTIONS.EVENTS, eventId);

    const batch = writeBatch(firebaseFirestore);
    batch.delete(enrollmentRef);
    batch.update(eventRef, {
      enrolledCount: increment(-1),
      updatedAt: Timestamp.now(),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Unenroll From Event Error:', error);
    throw error;
  }
};

// CHECK ENROLLMENT STATUS
export const checkEnrollment = async (
  eventId: string,
  uid: string,
): Promise<Enrollment | null> => {
  try {
    const q = query(
      collection(firebaseFirestore, COLLECTIONS.ENROLLMENTS),
      where('eventId', '==', eventId),
      where('uid', '==', uid),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].data() as Enrollment;
    }
    return null;
  } catch (error) {
    console.error('Check Enrollment Error:', error);
    throw error;
  }
};

// GET EVENT PARTICIPANTS (Real-time)
export const getEventParticipants = (
  eventId: string,
  callback: (participants: Enrollment[]) => void,
) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.ENROLLMENTS),
    where('eventId', '==', eventId),
    orderBy('enrolledAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const participants = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as Enrollment,
      );
      callback(participants);
    },
    error => {
      console.error('Get Event Participants Error:', error);
    },
  );
};

// GET USER ENROLLMENTS (Real-time)
export const getUserEnrollments = (
  uid: string,
  callback: (enrollments: Enrollment[]) => void,
) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.ENROLLMENTS),
    where('uid', '==', uid),
    orderBy('enrolledAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const enrollments = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as Enrollment,
      );
      callback(enrollments);
    },
    error => {
      console.error('Get User Enrollments Error:', error);
    },
  );
};

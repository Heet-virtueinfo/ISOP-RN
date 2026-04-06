import firestore from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { Enrollment, AppEvent, UserProfile } from '../types';
import { COLLECTIONS } from '../constants/collections';

// ENROLL IN EVENT
export const enrollInEvent = async (
  event: AppEvent,
  userProfile: UserProfile,
) => {
  try {
    const enrollmentRef = firebaseFirestore
      .collection(COLLECTIONS.ENROLLMENTS)
      .doc();
    const eventRef = firebaseFirestore
      .collection(COLLECTIONS.EVENTS)
      .doc(event.id);

    const enrollment: Enrollment = {
      id: enrollmentRef.id,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      uid: userProfile.uid,
      displayName: userProfile.displayName,
      email: userProfile.email,
      profileImage: userProfile.profileImage || null,
      enrolledAt: firestore.Timestamp.now(),
    };

    const batch = firebaseFirestore.batch();
    batch.set(enrollmentRef, enrollment);
    batch.update(eventRef, {
      enrolledCount: firestore.FieldValue.increment(1),
      updatedAt: firestore.Timestamp.now(),
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
    const enrollmentRef = firebaseFirestore
      .collection(COLLECTIONS.ENROLLMENTS)
      .doc(enrollmentId);
    const eventRef = firebaseFirestore
      .collection(COLLECTIONS.EVENTS)
      .doc(eventId);

    const batch = firebaseFirestore.batch();
    batch.delete(enrollmentRef);
    batch.update(eventRef, {
      enrolledCount: firestore.FieldValue.increment(-1),
      updatedAt: firestore.Timestamp.now(),
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
    const snapshot = await firebaseFirestore
      .collection(COLLECTIONS.ENROLLMENTS)
      .where('eventId', '==', eventId)
      .where('uid', '==', uid)
      .limit(1)
      .get();

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
  return firebaseFirestore
    .collection(COLLECTIONS.ENROLLMENTS)
    .where('eventId', '==', eventId)
    .orderBy('enrolledAt', 'desc')
    .onSnapshot(
      snapshot => {
        const participants = snapshot.docs.map(doc => doc.data() as Enrollment);
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
  return firebaseFirestore
    .collection(COLLECTIONS.ENROLLMENTS)
    .where('uid', '==', uid)
    .orderBy('eventDate', 'asc')
    .onSnapshot(
      snapshot => {
        const enrollments = snapshot.docs.map(doc => doc.data() as Enrollment);
        callback(enrollments);
      },
      error => {
        console.error('Get User Enrollments Error:', error);
      },
    );
};

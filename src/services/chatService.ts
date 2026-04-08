import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  Timestamp,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { ChatRequest, Chat, Message, UserProfile, Enrollment } from '../types';
import { COLLECTIONS } from '../constants/collections';
import { apiService } from './apiService';

// SEND CHAT REQUEST
export const sendChatRequest = async (
  fromProfile: UserProfile,
  toParticipant: Enrollment,
  eventId: string,
) => {
  try {
    const fromUid = fromProfile.uid;
    const toUid = toParticipant.uid;

    if (fromUid === toUid)
      return { success: false, error: 'Cannot send request to yourself' };

    // Check if any request already exists between these two users (any status)
    const existingRequest = await getChatRequestStatus(fromUid, toUid);
    if (existingRequest && existingRequest.status !== 'declined') {
      return { success: false, error: 'Request already exists' };
    }

    // Fetch event title from source of truth
    const eventDoc = await getDoc(doc(firebaseFirestore, COLLECTIONS.EVENTS, eventId));
    const eventTitle = eventDoc.exists()
      ? (eventDoc.data() as any).title
      : 'an event';

    const requestId =
      existingRequest?.id ||
      doc(collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS)).id;
    const requestRef = doc(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS, requestId);
    const chatRequest: ChatRequest = {
      id: requestRef.id,
      fromUid,
      fromName: fromProfile.displayName,
      fromImage: fromProfile.profileImage || null,
      toUid,
      toName: toParticipant.displayName,
      toImage: toParticipant.profileImage || null,
      eventId,
      participants: [fromUid, toUid], // For single query listening
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(requestRef, chatRequest);

    // [NOTIFICATION] Send push notification to recipient
    try {
      const recipientDoc = await getDoc(doc(firebaseFirestore, COLLECTIONS.USERS, toUid));

      if (recipientDoc.exists()) {
        const recipientProfile = recipientDoc.data() as UserProfile;
        if (recipientProfile.fcmToken) {
          await apiService.sendNotification({
            fcmToken: recipientProfile.fcmToken,
            title: 'New Chat Request!',
            body: `${fromProfile.displayName || 'Someone'
              } wants to connect regarding ${eventTitle}`,
            data: {
              screen: 'RequestsTab', // Deep link to requests screen
              chatId: chatRequest.id,
              fromName: fromProfile.displayName,
            },
          });
        }
      }
    } catch (notifError) {
      console.warn('Silent failure on request notification:', notifError);
    }

    return { success: true, chatRequest };
  } catch (error) {
    console.error('Send Chat Request Error:', error);
    throw error;
  }
};

// GET INCOMING REQUESTS
export const getIncomingRequests = (
  uid: string,
  callback: (requests: ChatRequest[]) => void,
) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
    where('toUid', '==', uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const requests = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      );
      callback(requests);
    },
    error => {
      console.error('Get Incoming Requests Error:', error);
    },
  );
};

// GET SENT REQUESTS
export const getSentRequests = (
  uid: string,
  callback: (requests: ChatRequest[]) => void,
) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
    where('fromUid', '==', uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const requests = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      );
      callback(requests);
    },
    error => {
      console.error('Get Sent Requests Error:', error);
    },
  );
};

// GET CHAT REQUEST STATUS (To check existing connection)
export const getChatRequestStatus = async (
  uid1: string,
  uid2: string,
): Promise<ChatRequest | null> => {
  try {
    const shot1 = await getDocs(
      query(
        collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
        where('fromUid', '==', uid1),
        where('toUid', '==', uid2),
      ),
    );

    const shot2 = await getDocs(
      query(
        collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
        where('fromUid', '==', uid2),
        where('toUid', '==', uid1),
      ),
    );

    const requests = [
      ...shot1.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      ),
      ...shot2.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      ),
    ];

    const bestRequest =
      requests.find(r => r.status === 'accepted') ||
      requests.find(r => r.status === 'pending') ||
      requests[0] ||
      null;

    return bestRequest;
  } catch (error) {
    console.error('Get Chat Request Status Error:', error);
    return null;
  }
};

// LISTEN TO CHAT REQUEST STATUS (Real-time version)
export const listenToChatRequestStatus = (
  uid1: string,
  uid2: string,
  callback: (request: ChatRequest | null) => void,
) => {
  let sentData: ChatRequest[] = [];
  let receivedData: ChatRequest[] = [];

  const handleCombined = () => {
    const combined = [...sentData, ...receivedData];
    const bestRequest =
      combined.find(r => r.status === 'accepted') ||
      combined.find(r => r.status === 'pending') ||
      combined[0] ||
      null;
    callback(bestRequest);
  };

  const unsub1 = onSnapshot(
    query(
      collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
      where('fromUid', '==', uid1),
      where('toUid', '==', uid2),
    ),
    s => {
      sentData = s.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      );
      handleCombined();
    },
    error => console.error('Listen Chat Request Status Error:', error),
  );

  const unsub2 = onSnapshot(
    query(
      collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
      where('fromUid', '==', uid2),
      where('toUid', '==', uid1),
    ),
    s => {
      receivedData = s.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      );
      handleCombined();
    },
    error => console.error('Listen Chat Request Status Error:', error),
  );

  return () => {
    unsub1();
    unsub2();
  };
};

// ACCEPT CHAT REQUEST
export const acceptChatRequest = async (request: ChatRequest) => {
  try {
    const requestRef = doc(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS, request.id);
    const chatRef = doc(firebaseFirestore, COLLECTIONS.CHATS, request.id);

    const chat: Chat = {
      id: request.id,
      participants: [request.fromUid, request.toUid],
      participantNames: {
        [request.fromUid]: request.fromName,
        [request.toUid]: request.toName,
      },
      participantImages: {
        [request.fromUid]: request.fromImage || null,
        [request.toUid]: request.toImage || null,
      },
      createdAt: Timestamp.now(),
    };

    const batch = writeBatch(firebaseFirestore);
    batch.update(requestRef, {
      status: 'accepted',
      updatedAt: Timestamp.now(),
    });
    batch.set(chatRef, chat);

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Accept Chat Request Error:', error);
    throw error;
  }
};

// DECLINE CHAT REQUEST
export const declineChatRequest = async (requestId: string) => {
  try {
    await updateDoc(doc(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS, requestId), {
      status: 'declined',
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Decline Chat Request Error:', error);
    throw error;
  }
};

// GET ACCEPTED REQUESTS (Consolidated connections)
export const getAcceptedRequests = (
  uid: string,
  callback: (requests: ChatRequest[]) => void,
) => {
  const sentAcceptedRef = query(
    collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
    where('fromUid', '==', uid),
    where('status', '==', 'accepted'),
  );

  const receivedAcceptedRef = query(
    collection(firebaseFirestore, COLLECTIONS.CHAT_REQUESTS),
    where('toUid', '==', uid),
    where('status', '==', 'accepted'),
  );

  let sentData: ChatRequest[] = [];
  let receivedData: ChatRequest[] = [];

  const handleCombined = () => {
    const combined = [...sentData, ...receivedData].sort((a, b) => {
      const timeA = a.updatedAt
        ? typeof a.updatedAt.toMillis === 'function'
          ? a.updatedAt.toMillis()
          : new Date(a.updatedAt as any).getTime()
        : 0;
      const timeB = b.updatedAt
        ? typeof b.updatedAt.toMillis === 'function'
          ? b.updatedAt.toMillis()
          : new Date(b.updatedAt as any).getTime()
        : 0;
      return timeB - timeA;
    });

    // Unique by ID
    const unique = Array.from(new Map(combined.map(r => [r.id, r])).values());
    callback(unique);
  };

  const unsub1 = onSnapshot(
    sentAcceptedRef,
    s => {
      sentData = s.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      );
      handleCombined();
    },
    err => console.error('Sent Accepted Listener Error:', err),
  );

  const unsub2 = onSnapshot(
    receivedAcceptedRef,
    s => {
      receivedData = s.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as ChatRequest,
      );
      handleCombined();
    },
    err => console.error('Received Accepted Listener Error:', err),
  );

  return () => {
    unsub1();
    unsub2();
  };
};

// GET MY CHATS
export const getMyChats = (uid: string, callback: (chats: Chat[]) => void) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.CHATS),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const chats = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.data() as Chat,
      );
      callback(chats);
    },
    error => {
      console.error('Get My Chats Error:', error);
    },
  );
};

// SEND MESSAGE
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
) => {
  try {
    const chatRef = doc(firebaseFirestore, COLLECTIONS.CHATS, chatId);
    const messagesRef = collection(chatRef, COLLECTIONS.MESSAGES);

    const messageRef = doc(messagesRef);
    const newMessage: Message = {
      id: messageRef.id,
      senderId,
      text,
      createdAt: Timestamp.now(),
      read: false,
    };

    const batch = writeBatch(firebaseFirestore);
    batch.set(messageRef, newMessage);
    batch.update(chatRef, {
      lastMessage: text,
      lastMessageAt: Timestamp.now(),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Send Message Error:', error);
    throw error;
  }
};

// GET MESSAGES
export const getMessages = (
  chatId: string,
  callback: (messages: Message[]) => void,
) => {
  const q = query(
    collection(firebaseFirestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    snapshot => {
      const messages = snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          doc.data() as Message,
      );
      callback(messages);
    },
    error => {
      console.error('Get Messages Error:', error);
    },
  );
};

// MARK MESSAGES AS READ
export const markMessagesRead = async (chatId: string, uid: string) => {
  try {
    const q = query(
      collection(firebaseFirestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
      where('senderId', '!=', uid),
      where('read', '==', false),
    );
    const unreadSnapshot = await getDocs(q);

    if (!unreadSnapshot.empty) {
      const batch = writeBatch(firebaseFirestore);
      unreadSnapshot.docs.forEach(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          batch.update(doc.ref, { read: true });
        },
      );
      await batch.commit();
    }
  } catch (error) {
    console.error('Mark Messages Read Error:', error);
  }
};

import firestore from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { ChatRequest, Chat, Message, UserProfile, Enrollment } from '../types';
import { COLLECTIONS } from '../constants/collections';
import { apiService } from './apiService';

// SEND CHAT REQUEST
export const sendChatRequest = async (
  fromProfile: UserProfile,
  toParticipant: Enrollment,
  eventId: string,
  eventTitle: string,
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

    const requestId =
      existingRequest?.id ||
      firebaseFirestore.collection(COLLECTIONS.CHAT_REQUESTS).doc().id;
    const requestRef = firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .doc(requestId);
    const chatRequest: ChatRequest = {
      id: requestRef.id,
      fromUid,
      fromName: fromProfile.displayName,
      fromImage: fromProfile.profileImage || null,
      toUid,
      toName: toParticipant.displayName,
      eventId,
      eventTitle,
      participants: [fromUid, toUid], // For single query listening
      status: 'pending',
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    };

    await requestRef.set(chatRequest);

    // [NOTIFICATION] Send push notification to recipient
    try {
      const recipientDoc = await firebaseFirestore
        .collection(COLLECTIONS.USERS)
        .doc(toUid)
        .get();

      if (recipientDoc.exists()) {
        const recipientProfile = recipientDoc.data() as UserProfile;
        if (recipientProfile.fcmToken) {
          await apiService.sendNotification({
            fcmToken: recipientProfile.fcmToken,
            title: 'New Chat Request!',
            body: `${
              fromProfile.displayName || 'Someone'
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
  return firebaseFirestore
    .collection(COLLECTIONS.CHAT_REQUESTS)
    .where('toUid', '==', uid)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const requests = snapshot.docs.map(doc => doc.data() as ChatRequest);
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
  return firebaseFirestore
    .collection(COLLECTIONS.CHAT_REQUESTS)
    .where('fromUid', '==', uid)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const requests = snapshot.docs.map(doc => doc.data() as ChatRequest);
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
    const shot = await firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .where('participants', 'array-contains', uid1)
      .get();

    const request = shot.docs
      .map(doc => doc.data() as ChatRequest)
      .find(req => req.participants.includes(uid2));

    return request || null;
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
  return firebaseFirestore
    .collection(COLLECTIONS.CHAT_REQUESTS)
    .where('participants', 'array-contains', uid1)
    .onSnapshot(
      snapshot => {
        const requests = snapshot.docs.map(doc => doc.data() as ChatRequest);
        // Find the specific request between these two users
        const request = requests.find(req => req.participants.includes(uid2));
        callback(request || null);
      },
      error => {
        console.error('Listen Chat Request Status Error:', error);
      },
    );
};

// ACCEPT CHAT REQUEST
export const acceptChatRequest = async (request: ChatRequest) => {
  try {
    const requestRef = firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .doc(request.id);
    const chatRef = firebaseFirestore
      .collection(COLLECTIONS.CHATS)
      .doc(request.id);

    const chat: Chat = {
      id: request.id,
      participants: [request.fromUid, request.toUid],
      participantNames: {
        [request.fromUid]: request.fromName,
        [request.toUid]: request.toName,
      },
      participantImages: {
        [request.fromUid]: request.fromImage || null,
        [request.toUid]: null,
      },
      createdAt: firestore.Timestamp.now(),
    };

    const batch = firebaseFirestore.batch();
    batch.update(requestRef, {
      status: 'accepted',
      updatedAt: firestore.Timestamp.now(),
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
    await firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .doc(requestId)
      .update({ status: 'declined', updatedAt: firestore.Timestamp.now() });
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
  const sentAcceptedRef = firebaseFirestore
    .collection(COLLECTIONS.CHAT_REQUESTS)
    .where('fromUid', '==', uid)
    .where('status', '==', 'accepted');

  const receivedAcceptedRef = firebaseFirestore
    .collection(COLLECTIONS.CHAT_REQUESTS)
    .where('toUid', '==', uid)
    .where('status', '==', 'accepted');

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

  const unsub1 = sentAcceptedRef.onSnapshot(
    s => {
      sentData = s.docs.map(doc => doc.data() as ChatRequest);
      handleCombined();
    },
    err => console.error('Sent Accepted Listener Error:', err),
  );

  const unsub2 = receivedAcceptedRef.onSnapshot(
    s => {
      receivedData = s.docs.map(doc => doc.data() as ChatRequest);
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
  return firebaseFirestore
    .collection(COLLECTIONS.CHATS)
    .where('participants', 'array-contains', uid)
    .orderBy('lastMessageAt', 'desc')
    .onSnapshot(
      snapshot => {
        const chats = snapshot.docs.map(doc => doc.data() as Chat);
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
    const messagesRef = firebaseFirestore
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES);
    const chatRef = firebaseFirestore.collection(COLLECTIONS.CHATS).doc(chatId);

    const messageRef = messagesRef.doc();
    const newMessage: Message = {
      id: messageRef.id,
      senderId,
      text,
      createdAt: firestore.Timestamp.now(),
      read: false,
    };

    const batch = firebaseFirestore.batch();
    batch.set(messageRef, newMessage);
    batch.update(chatRef, {
      lastMessage: text,
      lastMessageAt: firestore.Timestamp.now(),
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
  return firebaseFirestore
    .collection(COLLECTIONS.CHATS)
    .doc(chatId)
    .collection(COLLECTIONS.MESSAGES)
    .orderBy('createdAt', 'desc') // Inverted list, hence desc for newest at bottom
    .onSnapshot(
      snapshot => {
        const messages = snapshot.docs.map(doc => doc.data() as Message);
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
    const unreadSnapshot = await firebaseFirestore
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .where('senderId', '!=', uid)
      .where('read', '==', false)
      .get();

    if (!unreadSnapshot.empty) {
      const batch = firebaseFirestore.batch();
      unreadSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Mark Messages Read Error:', error);
  }
};

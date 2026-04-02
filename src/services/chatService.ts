import firestore from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../config/firebase';
import { ChatRequest, Chat, Message, UserProfile, Enrollment } from '../types';
import { COLLECTIONS } from '../constants/collections';

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
    if (existingRequest) {
      return { success: false, error: 'Request already exists' };
    }

    const requestRef = firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .doc();
    const chatRequest: ChatRequest = {
      id: requestRef.id,
      fromUid,
      fromName: fromProfile.displayName,
      fromImage: fromProfile.profileImage || null,
      toUid,
      toName: toParticipant.displayName,
      eventId,
      eventTitle,
      status: 'pending',
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    };

    await requestRef.set(chatRequest);
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
    // Query requests where sender is uid1 and recipient is uid2
    const shot1 = await firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .where('fromUid', '==', uid1)
      .where('toUid', '==', uid2)
      .get();

    if (!shot1.empty) return shot1.docs[0].data() as ChatRequest;

    // Query requests where sender is uid2 and recipient is uid1
    const shot2 = await firebaseFirestore
      .collection(COLLECTIONS.CHAT_REQUESTS)
      .where('fromUid', '==', uid2)
      .where('toUid', '==', uid1)
      .get();

    if (!shot2.empty) return shot2.docs[0].data() as ChatRequest;

    return null;
  } catch (error) {
    console.error('Get Chat Request Status Error:', error);
    return null;
  }
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
        [request.toUid]: null, // Note: Recipient's image could be fetched if needed
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

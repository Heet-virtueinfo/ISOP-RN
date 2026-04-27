import apiClient from '../config/api';
import { ChatRequest, Chat, Message, UserProfile, Enrollment } from '../types';

// Normalizer utilities
const normalizeChatRequest = (data: any): ChatRequest => ({
  id: String(data.id),
  fromUid: String(data.from_user_id || data.fromUid),
  fromName: data.from_user?.name || data.fromName || '',
  fromImage: data.from_user?.profile_image || data.fromImage || null,
  toUid: String(data.to_user_id || data.toUid),
  toName: data.to_user?.name || data.toName || '',
  toImage: data.to_user?.profile_image || data.toImage || null,
  eventId: String(data.event_id || data.eventId || ''),
  participants: [String(data.from_user_id), String(data.to_user_id)],
  status: data.status,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString(),
});

// SEND CHAT REQUEST
export const sendChatRequest = async (
  fromProfile: UserProfile,
  toParticipant: Enrollment,
  eventId: string,
) => {
  try {
    const response = await apiClient.post('/api/user/chat-requests', {
      to_user_id: toParticipant.uid,
      event_id: eventId,
    });
    return { success: true, chatRequest: normalizeChatRequest(response.data.data || response.data) };
  } catch (error: any) {
    console.error('Send Chat Request Error:', error?.response?.data || error);
    return { success: false, error: 'Could not send request' };
  }
};

// GET INCOMING REQUESTS
export const getIncomingRequests = async (): Promise<ChatRequest[]> => {
  try {
    const response = await apiClient.get('/api/user/chat-requests/incoming');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(normalizeChatRequest) : [];
  } catch (error) {
    console.error('Get Incoming Requests Error:', error);
    return [];
  }
};

// GET SENT REQUESTS
export const getSentRequests = async (): Promise<ChatRequest[]> => {
  try {
    const response = await apiClient.get('/api/user/chat-requests/sent');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(normalizeChatRequest) : [];
  } catch (error) {
    console.error('Get Sent Requests Error:', error);
    return [];
  }
};

// GET CHAT REQUEST STATUS (To check existing connection)
export const getChatRequestStatus = async (
  uid1: string,
  uid2: string,
): Promise<ChatRequest | null> => {
  try {
    const res = await apiClient.get('/api/user/chat-requests/status', {
      params: { user_id: uid2 }
    });
    const data = res.data.data || res.data.request || res.data;
    if (data && data.id) {
       return normalizeChatRequest(data);
    }
    return null;
  } catch (error) {
    return null; // 404 naturally means no request exists
  }
};

// SHIM for listenToChatRequestStatus - we fetch initially and map a standard clearable interval
export const listenToChatRequestStatus = (
  uid1: string,
  uid2: string,
  callback: (request: ChatRequest | null) => void,
) => {
   let isValid = true;
   const poll = async () => {
       if (!isValid) return;
       const status = await getChatRequestStatus(uid1, uid2);
       if (isValid) callback(status);
   };
   poll();
   const interval = setInterval(poll, 15000); // 15s poll
   return () => {
       isValid = false;
       clearInterval(interval);
   };
};

// ACCEPT CHAT REQUEST
export const acceptChatRequest = async (request: ChatRequest) => {
  try {
    await apiClient.patch(`/api/user/chat-requests/${request.id}/accept`);
    return { success: true };
  } catch (error) {
    console.error('Accept Chat Request Error:', error);
    throw error;
  }
};

// DECLINE CHAT REQUEST
export const declineChatRequest = async (requestId: string) => {
  try {
    await apiClient.patch(`/api/user/chat-requests/${requestId}/decline`);
    return { success: true };
  } catch (error) {
    console.error('Decline Chat Request Error:', error);
    throw error;
  }
};

// GET ACCEPTED REQUESTS
export const getAcceptedRequests = async (): Promise<ChatRequest[]> => {
  try {
    const response = await apiClient.get('/api/user/chat-requests/accepted');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(normalizeChatRequest) : [];
  } catch (error) {
    console.error('[ChatService] getAcceptedRequests Error:', error);
    return [];
  }
};

// GET MY CHATS
export const getMyChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get('/api/user/chats');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map((c: any) => {
      // Mocking the structure as the backend likely returns a different participant tree
      const fromUid = String(c.user1_id || c.participant1_id || c.from_user_id || '');
      const toUid = String(c.user2_id || c.participant2_id || c.to_user_id || '');
      return {
        id: String(c.id),
        participants: [fromUid, toUid],
        participantNames: {
          [fromUid]: c.user1?.name || c.from_name || '',
          [toUid]: c.user2?.name || c.to_name || '',
        },
        participantImages: {
          [fromUid]: c.user1?.profile_image || null,
          [toUid]: c.user2?.profile_image || null,
        },
        lastMessage: c.last_message || '',
        lastMessageAt: c.last_message_at || c.updated_at || '',
        createdAt: c.created_at || '',
      } as Chat;
    }) : [];
  } catch (error) {
    console.error('Get My Chats Error:', error);
    return [];
  }
};

// SEND MESSAGE
export const sendMessage = async (
  chatId: string,
  senderId: string, // Kept for compatibility, backend uses token
  text: string,
) => {
  try {
    await apiClient.post(`/api/user/chats/${chatId}/messages`, {
      message: text,
    });
    return { success: true };
  } catch (error) {
    console.error('Send Message Error:', error);
    throw error;
  }
};

// GET MESSAGES
export const getMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/api/user/chats/${chatId}/messages`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map((m: any) => ({
      id: String(m.id),
      senderId: String(m.sender_id || m.user_id),
      text: m.message || m.text,
      createdAt: m.created_at || new Date().toISOString(),
      read: m.is_read || m.read || false,
    })) as Message[] : [];
  } catch (error) {
    console.error('Get Messages Error:', error);
    return [];
  }
};

// MARK MESSAGES AS READ
export const markMessagesRead = async (chatId: string, uid: string) => {
  try {
     // The backend likely expects a call like this.
     await apiClient.patch(`/api/user/chats/${chatId}/messages/read`);
  } catch (error) {
    console.error('Mark Messages Read Error:', error);
  }
};


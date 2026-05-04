import apiClient from '../config/api';
import { ChatRequest, Chat, Message, UserProfile, Enrollment } from '../types';

// Normalizer utilities
const normalizeChatRequest = (data: any): ChatRequest => {
  const fromUser = data.from_user || data.sender || {};
  const toUser = data.to_user || data.receiver || data.recipient || {};

  return {
    id: String(data.id),
    fromUid: String(
      data.from_user_id || data.fromUid || fromUser.id || fromUser.uid,
    ),
    fromName:
      fromUser.name ||
      fromUser.display_name ||
      fromUser.displayName ||
      fromUser.full_name ||
      data.from_name ||
      data.fromName ||
      '',
    fromImage:
      fromUser.profile_image ||
      fromUser.image ||
      data.from_image ||
      data.fromImage ||
      null,
    toUid: String(data.to_user_id || data.toUid || toUser.id || toUser.uid),
    toName:
      toUser.name ||
      toUser.display_name ||
      toUser.displayName ||
      toUser.full_name ||
      data.to_name ||
      data.toName ||
      '',
    toImage:
      toUser.profile_image ||
      toUser.image ||
      data.to_image ||
      data.toImage ||
      null,
    eventId: String(data.event_id || data.eventId || ''),
    participants: data.participants || [
      String(data.from_user_id || data.fromUid || fromUser.id || fromUser.uid),
      String(data.to_user_id || data.toUid || toUser.id || toUser.uid),
    ],
    status: data.status,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
  };
};

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
    console.log('[ChatService] sendChatRequest response:', response.data);

    const data = response.data.data || response.data.request || response.data;

    // If the backend returns a success but no clear request object, we should still reflect success in UI
    if (data && (data.id || data.status)) {
      return { success: true, chatRequest: normalizeChatRequest(data) };
    }

    // Fallback: the backend might just return { success: true, message: "..." }
    // We create a temporary object so the UI updates to 'Pending'
    return {
      success: true,
      chatRequest: {
        id: 'temp-' + Date.now(),
        fromUid: fromProfile.uid,
        fromName: fromProfile.displayName,
        toUid: toParticipant.uid,
        toName: toParticipant.displayName,
        eventId: eventId,
        status: 'pending',
        participants: [fromProfile.uid, toParticipant.uid],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ChatRequest,
    };
  } catch (error: any) {
    const isConflict =
      error.status === 409 ||
      error.response?.status === 409 ||
      error.message?.includes('already exists') ||
      error.response?.data?.message?.includes('already exists');

    if (isConflict) {
      console.log('[ChatService] Request already exists, treating as success');
      return {
        success: true,
        chatRequest: {
          id: 'existing-' + Date.now(),
          fromUid: fromProfile.uid,
          fromName: fromProfile.displayName,
          toUid: toParticipant.uid,
          toName: toParticipant.displayName,
          eventId: eventId,
          status: 'pending',
          participants: [fromProfile.uid, toParticipant.uid],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as ChatRequest,
      };
    }

    console.error('Send Chat Request Error:', error?.response?.data || error);
    return { success: false, error: 'Could not send request' };
  }
};

// GET INCOMING REQUESTS
export const getIncomingRequests = async (): Promise<ChatRequest[]> => {
  try {
    const response = await apiClient.get('/api/user/chat-requests/incoming');
    const data = response.data.requests || response.data;
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
    const data = response.data.requests || response.data;
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
  eventId?: string,
): Promise<ChatRequest | null> => {
  try {
    const res = await apiClient.get('/api/user/chat-requests/status', {
      params: {
        other_user_id: uid2,
        event_id: eventId,
      },
    });
    const data = res.data.data || res.data.request || res.data;
    if (data && data.id) {
      return normalizeChatRequest(data);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// SHIM for listenToChatRequestStatus - we fetch initially and map a standard clearable interval
export const listenToChatRequestStatus = (
  uid1: string,
  uid2: string,
  callback: (request: ChatRequest | null) => void,
  eventId?: string,
) => {
  let isValid = true;
  const poll = async () => {
    if (!isValid) return;
    const status = await getChatRequestStatus(uid1, uid2, eventId);
    if (isValid) callback(status);
  };
  poll();
  const interval = setInterval(poll, 15000);
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
    const data = response.data.requests || response.data;
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
    const data = response.data.chats || response.data;
    return Array.isArray(data)
      ? data.map((c: any) => {
          const participantNames: Record<string, string> = {};
          const participantImages: Record<string, string | null> = {};

          if (Array.isArray(c.users)) {
            c.users.forEach((user: any) => {
              const uid = String(user.id);
              participantNames[uid] = user.display_name || user.name || '';
              participantImages[uid] = user.profile_image || null;
            });
          }

          return {
            id: String(c.id),
            participants: Array.isArray(c.participants)
              ? c.participants.map(String)
              : [],
            participantNames,
            participantImages,
            lastMessage: c.last_message || '',
            lastMessageAt: c.last_message_at || c.updated_at || '',
            createdAt: c.created_at || '',
          } as Chat;
        })
      : [];
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
      text: text,
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
    console.log('messages', response.data);
    const data = response.data.messages || response.data;
    return Array.isArray(data)
      ? (data.map((m: any) => ({
          id: String(m.id),
          senderId: String(m.sender_id || m.user_id),
          text: m.message || m.text,
          createdAt: m.created_at || new Date().toISOString(),
          read: m.is_read || m.read || false,
        })) as Message[])
      : [];
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

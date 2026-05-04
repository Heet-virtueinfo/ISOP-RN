import apiClient from '../config/api';
import { Feedback, UserProfile } from '../types';

export const submitFeedback = async (
  eventId: string,
  userProfile: UserProfile,
  rating: number,
  comment: string
): Promise<{ success: boolean; message?: string; newFeedback?: Feedback }> => {
  try {
    const response = await apiClient.post('/api/user/feedback', {
      event_id: eventId,
      rating,
      comment,
    });
    const feedback = response.data.feedback || response.data;

    const newFeedback: Feedback = {
      id: String(feedback.id),
      eventId,
      uid: userProfile.uid,
      userName: userProfile.displayName,
      userImage: userProfile.profileImage || null,
      rating,
      comment,
      createdAt: new Date(),
    };

    return { success: true, newFeedback };
  } catch (error: any) {
    console.error('[UserFeedback] submit error:', error?.response?.data || error);
    return { success: false, message: 'Failed to submit feedback.' };
  }
};

export const checkUserFeedback = async (
  eventId: string,
  uid: string
): Promise<Feedback | null> => {
  try {
    const response = await apiClient.get('/api/user/feedback/check', {
      params: { event_id: eventId }
    });
    const data = response.data.feedback || response.data.data;
    if (data && data.id) {
      return {
        id: String(data.id),
        eventId: eventId,
        uid,
        userName: '',
        userImage: null,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getEventFeedback = async (eventId: string): Promise<Feedback[]> => {
  try {
    const response = await apiClient.get(`/api/user/events/${eventId}/feedback`);
    console.log('Data of getEventFeedback:', response.data);
    const raw = response.data.feedbacks || response.data.data || response.data;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((fb: any) => ({
      id: String(fb.id),
      eventId,
      uid: String(fb.user_id || fb.uid),
      userName: fb.user_name || fb.user?.name || fb.user?.full_name || '',
      userImage: fb.user_image || fb.user?.profile_image || null,
      rating: fb.rating,
      comment: fb.comment,
      status: fb.status || 'pending',
      createdAt: fb.created_at || new Date().toISOString(),
    })) as Feedback[];
  } catch (error) {
    console.error('[UserFeedback] getEventFeedback error', error);
    return [];
  }
};

export const updateFeedbackStatus = async (feedbackId: string, status: 'pending' | 'reviewed' | 'resolved') => {
  try {
    const response = await apiClient.patch(`/api/admin/feedback/${feedbackId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('[UserFeedback] updateFeedbackStatus error', error);
    throw error;
  }
};

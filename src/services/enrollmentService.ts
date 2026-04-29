import apiClient from '../config/api';
import { Enrollment, AppEvent, UserProfile } from '../types';
import { normalizeEvent } from './eventService';

const normalizeEnrollment = (
  data: any,
  eventId?: string,
  uid?: string,
): Enrollment => {
  return {
    id: String(data.id || ''),
    eventId: String(data.event_id || data.eventId || eventId || ''),
    uid: String(data.user_id || data.uid || uid || ''),
    displayName: data.display_name || data.displayName || 'User',
    email: data.email || '',
    profileImage: data.profile_image || data.profileImage || null,
    enrolledAt: data.enrolled_at || data.enrolledAt || new Date().toISOString(),
    chatStatus: data.chat_status || data.chatStatus || 'none',
    chatDirection: data.chat_direction || data.chatDirection || null,
    chatRequestId: String(data.chat_request_id || data.chatRequestId || ''),
  };
};

export const enrollInEvent = async (
  event: AppEvent,
  userProfile: UserProfile,
) => {
  try {
    const response = await apiClient.post('/api/user/enrollments', {
      event_id: event.id,
    });
    console.log('[UserEnrollment] enrollInEvent response:', response.data);

    const data =
      response.data.enrollment || response.data.data || response.data;
    const enrollment = normalizeEnrollment(data, event.id, userProfile.uid);

    return { success: true, enrollment };
  } catch (error: any) {
    console.error(
      '[UserEnrollment] enrollInEvent error:',
      error?.response?.data || error,
    );
    throw error;
  }
};

export const unenrollFromEvent = async (enrollmentId: string) => {
  try {
    await apiClient.delete(`/api/user/enrollments/${enrollmentId}`);
    return { success: true };
  } catch (error: any) {
    console.error(
      '[UserEnrollment] unenrollFromEvent error:',
      error?.response?.data || error,
    );
    throw error;
  }
};

export const checkEnrollment = async (
  eventId: string,
  uid: string,
): Promise<Enrollment | null> => {
  try {
    const response = await apiClient.get('/api/user/enrollments/check', {
      params: { event_id: eventId },
    });
    console.log(
      '[UserEnrollment] checkEnrollment raw response:',
      response.data,
    );

    const data =
      response.data.enrollment || response.data.data || response.data;
    console.log('[UserEnrollment] checkEnrollment extracted data:', data);

    if (data && (data.id || data.is_enrolled)) {
      return normalizeEnrollment(data, eventId, uid);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getUserEnrollments = async (
  uid: string,
): Promise<(Enrollment & { event?: AppEvent })[]> => {
  try {
    const response = await apiClient.get('/api/user/enrollments');
    const records =
      response.data.enrollments || response.data.data || response.data;
    console.log('Data of getUserEnrollments:', records);

    if (!Array.isArray(records)) return [];

    return records.map((pt: any) => ({
      ...normalizeEnrollment(pt),
      event: pt.event ? normalizeEvent(pt.event) : undefined,
    }));
  } catch (error) {
    console.error('[UserEnrollment] getUserEnrollments error:', error);
    return [];
  }
};

export const getEventParticipants = async (
  eventId: string,
): Promise<Enrollment[]> => {
  try {
    const response = await apiClient.get(
      `/api/user/events/${eventId}/participants`,
    );
    const records =
      response.data.participants || response.data.data || response.data;
    console.log('Data of getEventParticipants:', records);
    return Array.isArray(records)
      ? records.map((pt: any) => normalizeEnrollment(pt, eventId))
      : [];
  } catch (error) {
    console.error('[UserEnrollment] getEventParticipants error:', error);
    return [];
  }
};

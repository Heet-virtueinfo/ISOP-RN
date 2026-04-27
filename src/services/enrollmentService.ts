import apiClient from '../config/api';
import { Enrollment, AppEvent, UserProfile } from '../types';
import { normalizeEvent } from './eventService';

export const enrollInEvent = async (
  event: AppEvent,
  userProfile: UserProfile,
) => {
  try {
    const response = await apiClient.post('/api/user/enrollments', {
      event_id: event.id,
    });
    return { success: true, enrollment: response.data };
  } catch (error: any) {
    console.error(
      '[UserEnrollment] enrollInEvent error:',
      error?.response?.data || error,
    );
    throw error;
  }
};

export const unenrollFromEvent = async (
  enrollmentId: string,
  eventId: string,
) => {
  try {
    await apiClient.delete(`/api/user/enrollments/${eventId}`);
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
    const data =
      response.data.data || response.data.enrollment || response.data;
    if (data && data.is_enrolled) {
      return {
        id: 'mocked',
        eventId: eventId,
        uid: uid,
        displayName: 'User',
        email: 'user@example.com',
        enrolledAt: new Date(),
      } as Enrollment;
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
      id: String(pt.id),
      eventId: String(pt.event_id),
      uid: String(pt.user_id || pt.uid),
      displayName: pt.display_name || pt.user?.name || pt.displayName || '',
      email: pt.email || pt.user?.email || '',
      enrolledAt: pt.enrolled_at || pt.created_at || new Date().toISOString(),
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
    const records = response.data.data || response.data;
    return Array.isArray(records)
      ? (records.map((pt: any) => ({
          id: String(pt.id),
          eventId: eventId,
          uid: String(pt.user_id || pt.uid),
          displayName: pt.user?.name || pt.full_name || pt.name || '',
          email: pt.user?.email || pt.email || '',
          profileImage: pt.user?.profile_image || pt.profile_image || null,
          enrolledAt: pt.created_at || new Date().toISOString(),
        })) as Enrollment[])
      : [];
  } catch (error) {
    console.error('[UserEnrollment] getEventParticipants error:', error);
    return [];
  }
};

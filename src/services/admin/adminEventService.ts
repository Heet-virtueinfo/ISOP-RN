import apiClient from '../../config/api';
import { AppEvent } from '../../types';
import { normalizeEvent } from '../eventService';

export type EventPayload = Omit<
  AppEvent,
  'id' | 'createdAt' | 'updatedAt' | 'enrolledCount' | 'createdBy'
>;

/** GET /api/admin/events — list all events */
export const adminGetEvents = async (): Promise<AppEvent[]> => {
  try {
    const res = await apiClient.get('/api/admin/events');
    console.log('[Admin] adminGetEvents response:', res.data);
    const raw = res.data.events ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw.map(normalizeEvent) : [];
  } catch (error: any) {
    console.error('[Admin] adminGetEvents failed:', error?.message);
    throw error;
  }
};

/** GET /api/admin/events/:id — get a single event */
export const adminGetEventById = async (id: string): Promise<AppEvent> => {
  try {
    const res = await apiClient.get(`/api/admin/events/${id}`);
    const raw = res.data.event ?? res.data.data ?? res.data;
    return normalizeEvent(raw);
  } catch (error: any) {
    console.error('[Admin] adminGetEventById failed:', error?.message);
    throw error;
  }
};

/** POST /api/admin/events — create a new event */
export const adminCreateEvent = async (
  data: EventPayload,
): Promise<AppEvent> => {
  try {
    const form = new FormData();

    if (data.title) form.append('title', data.title);
    if (data.description) form.append('description', data.description);
    if (data.location) form.append('location', data.location);
    if (data.type) form.append('type', data.type);

    if (data.date) {
      const d = new Date(data.date);
      form.append('date', d.toISOString().replace('T', ' ').substring(0, 19));
    }

    if (data.endDate) {
      const d = new Date(data.endDate);
      form.append(
        'end_date',
        d.toISOString().replace('T', ' ').substring(0, 19),
      );
    }

    const capacity = data.maxCapacity ?? data.capacity;
    if (capacity !== undefined) {
      form.append('max_capacity', String(capacity));
    }

    if (data.speakers && data.speakers.length > 0) {
      form.append('speakers', JSON.stringify(data.speakers));
    }

    if (data.agenda && data.agenda.length > 0) {
      form.append('agenda', JSON.stringify(data.agenda));
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        if (!img.startsWith('http')) {
          const filename = img.split('/').pop() ?? `image_${index}.jpg`;
          const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
          const mimeType =
            ext === 'png'
              ? 'image/png'
              : ext === 'webp'
              ? 'image/webp'
              : 'image/jpeg';
          form.append('image_files[]', {
            uri: img,
            name: filename,
            type: mimeType,
          } as any);
        }
      });
    }

    const res = await apiClient.post('/api/admin/events', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const raw = res.data.event ?? res.data.data ?? res.data;
    return normalizeEvent(raw);
  } catch (error: any) {
    console.error('[Admin] adminCreateEvent failed:', error?.message);
    throw error;
  }
};

export const adminUpdateEvent = async (
  id: string,
  data: Partial<EventPayload>,
): Promise<AppEvent> => {
  try {
    const form = new FormData();
    form.append('_method', 'PUT');

    if (data.title) form.append('title', data.title);
    if (data.description) form.append('description', data.description);
    if (data.location) form.append('location', data.location);
    if (data.type) form.append('type', data.type);

    if (data.date) {
      const d = new Date(data.date);
      form.append('date', d.toISOString().replace('T', ' ').substring(0, 19));
    }

    if (data.endDate) {
      const d = new Date(data.endDate);
      form.append(
        'end_date',
        d.toISOString().replace('T', ' ').substring(0, 19),
      );
    }

    const capacity = data.maxCapacity ?? data.capacity;
    if (capacity !== undefined) {
      form.append('max_capacity', String(capacity));
    }

    if (data.speakers && data.speakers.length > 0) {
      form.append('speakers', JSON.stringify(data.speakers));
    }

    if (data.agenda && data.agenda.length > 0) {
      form.append('agenda', JSON.stringify(data.agenda));
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        if (img.startsWith('http')) {
          // Existing URL to keep
          form.append('images[]', img);
        } else {
          // New file to upload
          const filename = img.split('/').pop() ?? `image_${index}.jpg`;
          const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
          const mimeType =
            ext === 'png'
              ? 'image/png'
              : ext === 'webp'
              ? 'image/webp'
              : 'image/jpeg';
          form.append('image_files[]', {
            uri: img,
            name: filename,
            type: mimeType,
          } as any);
        }
      });
    }

    const res = await apiClient.post(`/api/admin/events/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const raw = res.data.event ?? res.data.data ?? res.data;
    return normalizeEvent(raw);
  } catch (error: any) {
    console.error('[Admin] adminUpdateEvent failed:', error?.message);
    throw error;
  }
};

/** DELETE /api/admin/events/:id — delete an event */
export const adminDeleteEvent = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/events/${id}`);
  } catch (error: any) {
    console.error('[Admin] adminDeleteEvent failed:', error?.message);
    throw error;
  }
};

/** GET /api/admin/events/:eventId/participants — list participants of an event */
export const adminGetEventParticipants = async (
  eventId: string,
): Promise<any[]> => {
  try {
    const res = await apiClient.get(
      `/api/admin/events/${eventId}/participants`,
    );
    const raw = res.data.participants ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error: any) {
    console.error('[Admin] adminGetEventParticipants failed:', error?.message);
    throw error;
  }
};

/** GET /api/admin/events/:eventId/feedback — list feedback for an event */
export const adminGetEventFeedback = async (
  eventId: string,
): Promise<any[]> => {
  try {
    const res = await apiClient.get(`/api/admin/events/${eventId}/feedback`);
    const raw = res.data.feedback ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error: any) {
    console.error('[Admin] adminGetEventFeedback failed:', error?.message);
    throw error;
  }
};

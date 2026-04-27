import apiClient from '../config/api';
import { AppEvent } from '../types';

export const normalizeEvent = (eventData: any): AppEvent => {
  return {
    id: String(eventData.id || eventData.uid || ''),
    title: eventData.title || '',
    date: eventData.date || new Date().toISOString(),
    location: eventData.location || '',
    platform: eventData.platform || 'offline',
    meetingLink: eventData.meeting_link || eventData.meetingLink || '',
    type: eventData.type || 'conference',
    createdBy: String(eventData.created_by || eventData.createdBy || ''),
    description: eventData.description || '',
    images: eventData.images || [],
    speakers: (eventData.speakers || []).map((s: any) => ({
      id: s.id || String(Math.random()),
      name: s.name || 'Unknown Speaker',
      role: s.role || '',
      bio: s.bio || '',
      image: s.image || null,
    })),
    ticketPrice: eventData.ticket_price || eventData.ticketPrice || 0,
    tags: eventData.tags || [],
    status: eventData.status || 'upcoming',
    capacity: eventData.capacity || 0,
    maxCapacity:
      eventData.max_capacity ||
      eventData.maxCapacity ||
      eventData.capacity ||
      0,
    enrolledCount: eventData.enrolled_count || eventData.enrolledCount || 0,
    registrationDeadline:
      eventData.registration_deadline ||
      eventData.registrationDeadline ||
      new Date().toISOString(),
    createdAt: eventData.created_at || eventData.createdAt || '',
    updatedAt: eventData.updated_at || eventData.updatedAt || '',
    ratingCount: eventData.rating_count || eventData.ratingCount || 0,
    averageRating: eventData.average_rating || eventData.averageRating || 0,
    endDate: eventData.end_date || eventData.endDate || null,
    agenda: (eventData.agenda || []).map((a: any) => ({
      id: a.id || String(Math.random()),
      startTime: a.startTime || a.time || '',
      endTime: a.endTime || '',
      title: a.title || a.topic || 'Untitled Session',
      description: a.description || '',
    })),
  };
};

export const getEvents = async (): Promise<AppEvent[]> => {
  try {
    const response = await apiClient.get('/api/user/events');
    const data = response.data.events || response.data.data || response.data;
    console.log('Data of getEvents:', data);
    return Array.isArray(data) ? data.map(normalizeEvent) : [];
  } catch (error) {
    console.error('[UserEvent] getEvents failed:', error);
    return [];
  }
};

export const getActiveEvents = async (): Promise<AppEvent[]> => {
  try {
    const events = await getEvents();
    return events;
  } catch (error) {
    console.error('[UserEvent] getActiveEvents failed:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<AppEvent | null> => {
  try {
    const response = await apiClient.get(`/api/user/events/${id}`);
    const data = response.data.event || response.data.data || response.data;
    console.log(`[UserEvent] getEventById(${id}) success:`, data);
    return normalizeEvent(data);
  } catch (error) {
    console.error(`[UserEvent] getEventById(${id}) failed:`, error);
    return null;
  }
};

export const fetchEventById = getEventById;

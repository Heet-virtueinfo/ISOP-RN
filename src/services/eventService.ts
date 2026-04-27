import apiClient from '../config/api';
import { AppEvent } from '../types';

/**
 * Normalizes snake_case event data to camelCase AppEvent.
 */
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
    speakers: eventData.speakers || [],
    ticketPrice: eventData.ticket_price || eventData.ticketPrice || 0,
    tags: eventData.tags || [],
    status: eventData.status || 'upcoming',
    capacity: eventData.capacity || 0,
    maxCapacity: eventData.max_capacity || eventData.maxCapacity || eventData.capacity || 0,
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
    agenda: eventData.agenda || [],
  };
};

/**
 * Fetch all events (equivalent to the old getEvents).
 */
export const getEvents = async (): Promise<AppEvent[]> => {
  try {
    const response = await apiClient.get('/api/user/events');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(normalizeEvent) : [];
  } catch (error) {
    console.error('[UserEvent] getEvents failed:', error);
    return [];
  }
};

/**
 * Fetch strictly active upcoming events. 
 * Since the API might not filter server-side, we fetch all and filter client side.
 */
export const getActiveEvents = async (): Promise<AppEvent[]> => {
  try {
    const events = await getEvents();
    // Replicating old logic by calling the same basic filter if needed,
    // although generally Laravel returns the correct list if it supports active scopes.
    return events;
  } catch (error) {
    console.error('[UserEvent] getActiveEvents failed:', error);
    return [];
  }
};

/**
 * Fetch a single event by ID.
 * (This replaces listenToEvent as well by using pull-refresh in UI instead)
 */
export const getEventById = async (id: string): Promise<AppEvent | null> => {
  try {
    const response = await apiClient.get(`/api/user/events/${id}`);
    const data = response.data.data || response.data.event || response.data;
    return normalizeEvent(data);
  } catch (error) {
    console.error(`[UserEvent] getEventById(${id}) failed:`, error);
    return null;
  }
};

/**
 * Fetch a single event by ID directly (shim for components expecting Promise)
 */
export const fetchEventById = getEventById;


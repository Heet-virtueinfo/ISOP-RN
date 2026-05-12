import { getImageSource } from './imageHelpers';
import { AppEvent, EventType } from '../types';

export const getEventPlaceholder = (type: EventType) => {
  switch (type) {
    case 'conference':
      return require('../assets/images/event_conference.png');
    case 'webinar':
      return require('../assets/images/event_webinar.png');
    case 'training':
      return require('../assets/images/event_training.png');
    case 'meeting':
      return require('../assets/images/event_meeting.png');
    default:
      return require('../assets/images/event_default.png');
  }
};

export const getEventImage = (event: AppEvent) => {
  if (event.images && event.images.length > 0) {
    const source = getImageSource(event.images[0]);
    return source || getEventPlaceholder(event.type);
  }
  return getEventPlaceholder(event.type);
};

/**
* Parses a date/time value from the backend without timezone conversion.
*
* Problem: The API returns dates like "2026-05-04T04:30:00.000000Z" (UTC),
* but when the admin entered "4:30 AM" they meant local time. JavaScript's
* `new Date("...Z")` automatically shifts by the device timezone (+5:30 IST),
* turning 4:30 AM into 10:00 AM — wrong!
*
* Fix: Strip the trailing Z (and any offset) so JS parses the bare datetime
* as local wall-clock time, preserving the original entered value.
*
* Also handles Firestore Timestamps and legacy "09:00 AM" time-only strings.
*/
const parseEventDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;

  // Firestore Timestamp object
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }

  const str = String(timestamp).trim();

  // Legacy time-only strings like "09:00 AM" or "09:00" — return null, not renderable as a full date
  if (/^[0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?$/i.test(str)) {
    return null;
  }

  // ISO string with Z or offset — strip timezone part so JS reads it as local time
  // e.g. "2026-05-04T04:30:00.000000Z" -> "2026-05-04T04:30:00"
  const stripped = str
    .replace(/\.\d+Z$/, '')     // remove fractional seconds + Z
    .replace(/Z$/, '')           // remove bare Z
    .replace(/[+-]\d{2}:\d{2}$/, ''); // remove +05:30 style offset

  const parsed = new Date(stripped);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
* Format a date for display. Uses the as-stored time (no timezone shift).
* For legacy time-only strings like "09:00 AM", returns the string as-is.
*/
export const formatEventDate = (timestamp: any): string => {
  if (!timestamp) return '';

  const str = String(timestamp).trim();

  // Legacy time-only string — show as-is
  if (/^[0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?$/i.test(str)) {
    return str;
  }

  const date = parseEventDate(timestamp);
  if (!date) return '';

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
* Cleans HTML strings (e.g., from rich text editors) into plain text suitable for React Native <Text>
* Handles paragraphs, lists, and basic HTML entities before stripping the rest of the tags.
*/
export const cleanHtml = (htmlStr: string | undefined | null): string => {
  if (!htmlStr) return '';

  let text = htmlStr;

  // Replace specific blocks with newlines
  text = text.replace(/<\/?(p|div|br)[^>]*>/gi, '\n');

  // Replace list items with bullets
  text = text.replace(/<li[^>]*>/gi, '\n• ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Clean up excess whitespace/newlines
  text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return text.trim();
};

/**
* Formats just the time portion (no date). Returns empty string for invalid/missing values.
*/
export const formatEventTime = (timestamp: any): string => {
  if (!timestamp) return '';

  const str = String(timestamp).trim();

  // Legacy time-only string — show as-is
  if (/^[0-9]{1,2}:[0-9]{2}(\s?(AM|PM))?$/i.test(str)) {
    return str;
  }

  const date = parseEventDate(timestamp);
  if (!date) return '';

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatEventDateRange = (start: any, end?: any): string => {
  if (!start) return '';

  const startStr = formatEventDate(start);
  if (!end) return startStr;

  const startDate = parseEventDate(start);
  const endDate = parseEventDate(end);

  if (!startDate || !endDate) return startStr;

  // Same calendar day → show "date – end time" only
  if (
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${startStr} – ${formatEventTime(end)}`;
  }

  return `${startStr} – ${formatEventDate(end)}`;
};


export const getEventTypeLabel = (type: EventType) => {
  const labels: Record<EventType, string> = {
    conference: 'Conference',
    webinar: 'Webinar',
    training: 'Training',
    meeting: 'Meeting',
  };
  return labels[type] || 'Event';
};

export const getEventTypeColor = (type: EventType, themeColors: any) => {
  const colors: Record<EventType, string> = {
    conference: themeColors.brand.primary,
    webinar: themeColors.brand.secondary,
    training: themeColors.status.success,
    meeting: themeColors.brand.accent,
  };
  return colors[type] || themeColors.brand.primary;
};

export const getEventStatus = (event: AppEvent): 'UPCOMING' | 'ONGOING' | 'COMPLETED' => {
  if (!event || !event.date) return 'UPCOMING';

  const now = new Date();
  const start = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  // If endDate is missing, assume a 3-hour duration for the "Ongoing" window
  const end = event.endDate
    ? (event.endDate.toDate ? event.endDate.toDate() : new Date(event.endDate))
    : new Date(start.getTime() + 3 * 60 * 60 * 1000);

  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'ONGOING';
  return 'COMPLETED';
};

export const isEventActive = (event: AppEvent) => {
  const status = getEventStatus(event);
  return status === 'UPCOMING' || status === 'ONGOING';
};

export const isEventFull = (event: AppEvent) => {
  if (event.maxCapacity === undefined || event.maxCapacity === null)
    return false;
  return event.enrolledCount >= event.maxCapacity;
};
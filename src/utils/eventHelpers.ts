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
    return { uri: event.images[0] };
  }
  return getEventPlaceholder(event.type);
};

export const formatEventDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatEventDateRange = (start: any, end?: any) => {
  if (!start) return '';
  const startDateStr = formatEventDate(start);
  if (!end) return startDateStr;

  const startDateObj = start.toDate ? start.toDate() : new Date(start);
  const endDateObj = end.toDate ? end.toDate() : new Date(end);

  // Same day check
  if (
    startDateObj.getDate() === endDateObj.getDate() &&
    startDateObj.getMonth() === endDateObj.getMonth() &&
    startDateObj.getFullYear() === endDateObj.getFullYear()
  ) {
    return `${startDateStr} - ${endDateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return `${startDateStr} - ${formatEventDate(end)}`;
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

export const isEventActive = (event: AppEvent) => {
  const now = new Date();
  const targetDate = event.endDate
    ? event.endDate.toDate
      ? event.endDate.toDate()
      : new Date(event.endDate)
    : event.date.toDate
    ? event.date.toDate()
    : new Date(event.date);
  return targetDate > now;
};

export const isEventFull = (event: AppEvent) => {
  if (event.maxCapacity === undefined || event.maxCapacity === null)
    return false;
  return event.enrolledCount >= event.maxCapacity;
};

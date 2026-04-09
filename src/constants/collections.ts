export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  ENROLLMENTS: 'enrollments',
  CHAT_REQUESTS: 'chatRequests',
  CHATS: 'chats',
  MESSAGES: 'messages',
  FEEDBACKS: 'feedbacks',
  NEWS: 'news',
  RESOURCES: 'resources',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  ENROLLMENTS: 'enrollments',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

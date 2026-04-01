export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export type EventType = 'conference' | 'webinar' | 'training' | 'meeting';

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  date: any; // Firestore Timestamp
  endDate?: any; // Firestore Timestamp
  location: string;
  type: EventType;
  images: string[];
  enrolledCount: number;
  maxCapacity?: number;
  createdBy: string; // Admin UID
  createdAt: any;
  updatedAt: any;
}

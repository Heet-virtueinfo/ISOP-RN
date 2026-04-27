export type UserRole = 'admin' | 'user';

/**
 * UserProfile now maps to the Laravel API user object shape.
 *
 * Laravel → App field mapping:
 *   id            → uid
 *   name          → displayName
 *   phone         → phoneNumber
 *   profile_image → profileImage
 *   created_at    → createdAt (ISO string)
 *   updated_at    → updatedAt (ISO string)
 */
export interface UserProfile {
  uid: string;           // maps from `id` in the API response
  email: string;
  displayName: string;   // maps from `name`
  role: UserRole;
  phoneNumber?: string;  // maps from `phone`
  profileImage?: string | null; // maps from `profile_image`
  fcmToken?: string;
  createdAt: string | null; // ISO date string from Laravel
  updatedAt: string | null; // ISO date string from Laravel
}

export type EventType = 'conference' | 'webinar' | 'training' | 'meeting';

export interface Speaker {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string | null;
}

export interface AgendaItem {
  id: string;
  startTime: any;
  endTime?: any;
  title: string;
  description?: string;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  date: any;
  time?: string;
  endDate?: any;
  location: string;
  platform?: string;
  meetingLink?: string;
  type: EventType;
  ticketPrice?: number;
  tags?: string[];
  status?: string;
  capacity?: number;
  registrationDeadline?: any;
  images: string[];
  enrolledCount: number;
  maxCapacity?: number;
  createdBy: string;
  speakers?: Speaker[];
  agenda?: AgendaItem[];
  averageRating?: number;
  ratingCount?: number;
  createdAt: any;
  updatedAt: any;
}

export interface Enrollment {
  id: string;
  eventId: string;
  uid: string;
  displayName: string;
  email: string;
  profileImage?: string | null;
  enrolledAt: any;
}

export type ChatRequestStatus = 'pending' | 'accepted' | 'declined';

export interface ChatRequest {
  id: string;
  fromUid: string;
  fromName: string;
  fromImage?: string | null;
  toUid: string;
  toName: string;
  toImage?: string | null;
  eventId: string;
  participants: string[];
  status: ChatRequestStatus;
  createdAt: any;
  updatedAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantImages: Record<string, string | null | undefined>;
  lastMessage?: string;
  lastMessageAt?: any;
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

export interface Feedback {
  id: string;
  eventId: string;
  uid: string;
  userName: string;
  userImage?: string | null;
  rating: number;
  comment: string;
  status?: 'pending' | 'reviewed' | 'resolved';
  createdAt: any;
}

export type NewsType = 'news' | 'alert';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  type: NewsType;
  imageUrl?: string | null;
  linkUrl?: string | null;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export type ResourceCategory = 'guideline' | 'training' | 'presentation' | 'other';
export type ResourceType = 'pdf' | 'video' | 'link';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  url: string;
  createdBy: string;
  createdAt: any;
}

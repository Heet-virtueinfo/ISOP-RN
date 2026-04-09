export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string | null;
  fcmToken?: string;
  createdAt: any;
  updatedAt: any;
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
  endDate?: any;
  location: string;
  type: EventType;
  images: string[];
  enrolledCount: number;
  maxCapacity?: number;
  createdBy: string; // Admin UID
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
  participants: string[]; // [fromUid, toUid] for efficient querying
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
  createdBy: string; // User ID / Admin ID
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



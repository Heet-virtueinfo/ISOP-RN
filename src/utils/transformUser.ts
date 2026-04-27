import { UserProfile } from '../types';

export const transformUser = (raw: any): UserProfile => ({
  uid: String(raw.id ?? raw.uid ?? ''),
  email: raw.email ?? '',
  displayName:
    raw.display_name ?? raw.full_name ?? raw.name ?? raw.displayName ?? '',
  role: raw.role ?? 'user',
  phoneNumber: raw.phone_number ?? raw.phone ?? raw.phoneNumber ?? undefined,
  profileImage: raw.profile_image ?? raw.profileImage ?? null,
  fcmToken: raw.fcm_token ?? raw.fcmToken ?? undefined,
  createdAt: raw.created_at ?? raw.createdAt ?? null,
  updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
});

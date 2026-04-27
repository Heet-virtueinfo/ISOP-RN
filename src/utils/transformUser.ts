/**
 * src/utils/transformUser.ts
 *
 * Transforms the raw Laravel API user object into the app's UserProfile shape.
 *
 * Laravel API typically returns:
 * {
 *   id: number | string,
 *   name: string,
 *   email: string,
 *   role: 'admin' | 'user',
 *   phone?: string,
 *   profile_image?: string,
 *   fcm_token?: string,
 *   created_at: string,
 *   updated_at: string,
 * }
 */

import { UserProfile } from '../types';

export const transformUser = (raw: any): UserProfile => ({
    uid: String(raw.id ?? raw.uid ?? ''),
    email: raw.email ?? '',
    displayName: raw.display_name ?? '',
    role: raw.role ?? 'user',
    phoneNumber: raw.phone_number ?? raw.phone ?? raw.phoneNumber ?? undefined,
    profileImage: raw.profile_image ?? raw.profileImage ?? null,
    fcmToken: raw.fcm_token ?? raw.fcmToken ?? undefined,
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
});

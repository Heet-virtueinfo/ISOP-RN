/**
 * src/services/admin/adminUserService.ts
 *
 * Admin user-management operations against the Laravel API.
 */

import apiClient from '../../config/api';
import { UserProfile } from '../../types';
import { transformUser } from '../../utils/transformUser';

/** GET /api/admin/users — list all registered users */
export const adminGetUsers = async (): Promise<UserProfile[]> => {
  try {
    const res = await apiClient.get('/api/admin/users');
    const raw = res.data.users ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw.map(transformUser) : [];
  } catch (error: any) {
    console.error('[Admin] adminGetUsers failed:', error?.message);
    throw error;
  }
};

/** DELETE /api/admin/users/:id — delete a user account */
export const adminDeleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/users/${id}`);
  } catch (error: any) {
    console.error('[Admin] adminDeleteUser failed:', error?.message);
    throw error;
  }
};

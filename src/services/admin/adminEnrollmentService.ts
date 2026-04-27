/**
 * src/services/admin/adminEnrollmentService.ts
 *
 * Admin enrollment operations against the Laravel API.
 */

import apiClient from '../../config/api';

/** DELETE /api/admin/enrollments/:id — remove a participant from an event */
export const adminDeleteEnrollment = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/enrollments/${id}`);
  } catch (error: any) {
    console.error('[Admin] adminDeleteEnrollment failed:', error?.message);
    throw error;
  }
};

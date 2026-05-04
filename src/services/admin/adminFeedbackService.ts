/**
 * src/services/admin/adminFeedbackService.ts
 *
 * Admin feedback operations against the Laravel API.
 */

import apiClient from '../../config/api';

export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved';

/** PATCH /api/admin/feedback/:id/status — update the status of a feedback entry */
export const adminUpdateFeedbackStatus = async (
  id: string,
  status: FeedbackStatus,
): Promise<void> => {
  try {
    await apiClient.patch(`/api/admin/feedback/${id}/status`, { status });
  } catch (error: any) {
    console.error('[Admin] adminUpdateFeedbackStatus failed:', error?.message);
    throw error;
  }
};

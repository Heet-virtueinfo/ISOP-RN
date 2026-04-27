/**
 * src/services/admin/adminNotificationService.ts
 *
 * Admin notification operations against the Laravel API.
 * Replaces the old apiService.ts sendNotification that hit an Express backend.
 */

import apiClient from '../../config/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendNotificationPayload {
  /** FCM token(s) for targeted notification */
  fcmToken?: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Notification actions
// ---------------------------------------------------------------------------

/**
 * POST /api/admin/notifications/send
 * Send a push notification to one or more specific users (by FCM token).
 */
export const adminSendNotification = async (
  payload: SendNotificationPayload,
): Promise<void> => {
  try {
    await apiClient.post('/api/admin/notifications/send', payload);
  } catch (error: any) {
    console.error('[Admin] adminSendNotification failed:', error?.message);
    throw error;
  }
};

/**
 * POST /api/admin/notifications/broadcast
 * Broadcast a push notification to ALL users.
 */
export const adminBroadcastNotification = async (
  payload: BroadcastNotificationPayload,
): Promise<void> => {
  try {
    await apiClient.post('/api/admin/notifications/broadcast', payload);
  } catch (error: any) {
    console.error('[Admin] adminBroadcastNotification failed:', error?.message);
    throw error;
  }
};

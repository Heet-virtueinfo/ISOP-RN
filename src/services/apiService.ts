const BACKEND_URL = 'https://ebf3-122-170-29-141.ngrok-free.app';

interface NotificationPayload {
  fcmToken?: string | string[];
  isBroadcast?: boolean;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const apiService = {
  sendNotification: async (payload: NotificationPayload) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }

      return result;
    } catch (error) {
      console.error('API Service - sendNotification Error:', error);
      throw error;
    }
  },

  getBackendUrl: () => BACKEND_URL,
};

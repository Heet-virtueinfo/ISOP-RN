const BACKEND_URL = 'https://isop-rn.onrender.com';
// const BACKEND_URL = 'https://e59b-122-170-29-141.ngrok-free.app';

interface NotificationPayload {
  fcmToken?: string | string[];
  isBroadcast?: boolean;
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface EnrollmentEmailPayload {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  eventStartDate: string;
  eventEndDate: string;
  eventDescription: string;
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

  sendEnrollmentEmail: async (payload: EnrollmentEmailPayload) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/emails/enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send enrollment email');
      }

      return result;
    } catch (error) {
      console.error('API Service - sendEnrollmentEmail Error:', error);
      throw error;
    }
  },

  getBackendUrl: () => BACKEND_URL,
};

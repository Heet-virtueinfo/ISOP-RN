import { Pusher } from '@pusher/pusher-websocket-react-native';
import { BASE_URL } from '../config/api';

const pusher = Pusher.getInstance();

let isInitialized = false;

export const initEcho = async (token: string) => {
  try {
    await pusher.init({
      apiKey: '26e5652890b01c6568a6',
      cluster: 'ap2',
      onAuthorizer: async (channelName: string, socketId: string) => {
        const response = await fetch(`${BASE_URL}/api/broadcasting/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channelName,
          }),
        });
        return await response.json();
      },
    });

    await pusher.connect();
    isInitialized = true;
    console.log('[PusherService] Native Pusher Connected');
    return pusher;
  } catch (e) {
    console.error('[PusherService] Error initializing native pusher:', e);
  }
};

export const getEcho = () => {
  return isInitialized ? pusher : null;
};

export const disconnectEcho = async () => {
  try {
    await pusher.disconnect();
    isInitialized = false;
    console.log('[PusherService] Native Pusher Disconnected');
  } catch (e) {
    console.error('[PusherService] Error disconnecting native pusher:', e);
  }
};

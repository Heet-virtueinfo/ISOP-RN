import { firebaseMessaging } from '../config/firebase';
import { updateFcmToken } from './authService';
import {
  onMessage,
  onTokenRefresh,
  setBackgroundMessageHandler,
  getInitialNotification,
  onNotificationOpenedApp,
  requestPermission,
  getToken,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import * as navigationRef from '../utils/navigationRef';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(firebaseMessaging);
        const enabled = authStatus === 1 || authStatus === 2;
        return enabled;
      }
      return true;
    } catch (error) {
      console.error('Request Permission Error:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (
        Platform.OS === 'ios' &&
        !isDeviceRegisteredForRemoteMessages(firebaseMessaging)
      ) {
        await registerDeviceForRemoteMessages(firebaseMessaging);
      }

      const token = await getToken(firebaseMessaging);
      if (token) {
        console.log('FCM Token:', token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Get FCM Token Error:', error);
      return null;
    }
  }

  async updateUserToken(uid: string, existingToken?: string) {
    try {
      const newToken = await this.getFCMToken();

      if (newToken && uid) {
        if (newToken !== existingToken) {
          console.log(
            `[NotificationService] Token mismatch detected (Server: ${existingToken?.slice(
              0,
              10,
            )}... Device: ${newToken.slice(0, 10)}...). Updating...`,
          );
        } else {
          console.log(
            '[NotificationService] Token matches local profile. Syncing with API anyway for reliability...',
          );
        }

        await updateFcmToken(newToken);
        console.log('[NotificationService] FCM Token synced successfully.');
      } else {
        console.warn(
          '[NotificationService] Cannot update token: newToken or uid is missing.',
          { hasToken: !!newToken, hasUid: !!uid },
        );
      }
    } catch (error) {
      console.error('[NotificationService] Update User Token Error:', error);
    }
  }

  async deleteUserToken() {
    try {
      console.log('[NotificationService] Clearing FCM token from server...');
      await updateFcmToken(null);
      console.log('[NotificationService] FCM token cleared successfully.');
    } catch (error) {
      console.error('[NotificationService] Error clearing FCM token:', error);
    }
  }

  onTokenRefresh(uid: string) {
    return onTokenRefresh(firebaseMessaging, async token => {
      console.log('FCM Token Refreshed:', token);
      if (uid) {
        await updateFcmToken(token);
      }
    });
  }

  async createDefaultChannel() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }
  }

  setupForegroundHandler() {
    // 1. Listen for FCM messages
    const unsubscribeFCM = onMessage(firebaseMessaging, async remoteMessage => {
      console.log('A new FCM message arrived (Foreground)!', remoteMessage);

      if (remoteMessage.notification) {
        const { title, body } = remoteMessage.notification;

        // Create channel for Android
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Notifications',
          importance: AndroidImportance.HIGH,
        });

        // Display the notification using Notifee
        await notifee.displayNotification({
          title: title || 'New Notification',
          body: body || '',
          data: remoteMessage.data,
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
          },
        });
      }

      // If it's a chat request, emit an event to update the badge immediately
      if (remoteMessage.data && remoteMessage.data.type === 'CHAT_REQUEST') {
        DeviceEventEmitter.emit('NEW_CHAT_REQUEST', remoteMessage.data);
      }
    });

    // 2. Listen for Notifee foreground events (e.g. user tapping the notification)
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log(
            'User pressed notification in foreground',
            detail.notification,
          );
          // If you have a callback for navigation, you can trigger it here
          if (detail.notification?.data?.screen) {
            // handle navigation
          }
          break;
      }
    });

    return () => {
      unsubscribeFCM();
      unsubscribeNotifee();
    };
  }

  setBackgroundMessageHandler() {
    setBackgroundMessageHandler(firebaseMessaging, async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }

  async handleInitialNotification(
    callback: (screen: string, data?: any) => void,
  ) {
    // 1. If app was opened from a "quit" state via FCM
    const initialNotification = await getInitialNotification(firebaseMessaging);
    if (initialNotification) {
      console.log('Opened from quit state (FCM):', initialNotification);
      await this.processNotificationData(initialNotification, callback);
    }

    // 2. If app was opened from a "quit" state via Notifee
    const initialNotifee = await notifee.getInitialNotification();
    if (initialNotifee) {
      console.log(
        'Opened from quit state (Notifee):',
        initialNotifee.notification,
      );
      await this.processNotificationData(initialNotifee.notification, callback);
    }

    // 3. If app was in background
    return onNotificationOpenedApp(firebaseMessaging, remoteMessage => {
      console.log('Opened from background (FCM):', remoteMessage);
      this.processNotificationData(remoteMessage, callback);
    });
  }

  private async processNotificationData(
    remoteMessage: any,
    callback?: (screen: string, data?: any) => void,
  ) {
    const { data, messageId, notification } = remoteMessage;
    const currentId =
      messageId ||
      (notification && notification.id) ||
      (remoteMessage && remoteMessage.id);

    if (currentId) {
      const lastId = await AsyncStorage.getItem('LAST_NOTIFICATION_ID');
      if (lastId === currentId) {
        console.log(
          '[NotificationService] Notification already handled, skipping:',
          currentId,
        );
        return;
      }
      await AsyncStorage.setItem('LAST_NOTIFICATION_ID', currentId);
    }

    console.log('[NotificationService] Processing data:', data);

    // 1. New Event Created
    if (data && (data.type === 'EVENT_PUBLISHED' || data.eventId)) {
      console.log(
        `[NotificationService] Navigating to Event Detail: ${data.eventId}`,
      );
      navigationRef.navigate('User', {
        screen: 'HomeTab',
        params: {
          screen: 'EventDetail',
          params: { eventId: data.eventId },
        },
      });
    }

    // 2. Incoming Chat Request
    if (
      data &&
      (data.type === 'CHAT_REQUEST' || data.screen === 'RequestsTab')
    ) {
      console.log('[NotificationService] Navigating to Requests (Networking)');
      navigationRef.navigate('User', {
        screen: 'RequestsTab',
        params: { screen: 'ChatRequests' },
      });
    }

    // 3. Request Accepted
    if (
      data &&
      (data.type === 'REQUEST_ACCEPTED' || data.screen === 'ChatsTab')
    ) {
      console.log('[NotificationService] Navigating to Chat Inbox (Accepted)');
      navigationRef.navigate('User', {
        screen: 'ChatsTab',
        params: { screen: 'ChatInbox' },
      });
    }

    // 4. Request Rejected - Redirect to Participants List
    if (
      data &&
      (data.type === 'REQUEST_REJECTED' || data.screen === 'HomeTab')
    ) {
      console.log(
        '[NotificationService] Navigating to Participants list (Rejected)',
      );
      navigationRef.navigate('User', {
        screen: 'HomeTab',
        params: {
          screen: 'Participants',
          params: { eventId: data.eventId, eventTitle: data.eventTitle },
        },
      });
    }

    // 5. New Message - Redirect to Specific Chat
    if (data && (data.type === 'NEW_MESSAGE' || data.screen === 'Chat')) {
      console.log(`[NotificationService] Navigating to Chat: ${data.chatId}`);
      navigationRef.navigate('User', {
        screen: 'ChatsTab',
        params: {
          screen: 'Chat',
          params: {
            chatId: data.chatId,
            otherUserName: data.otherUserName || data.fromName,
            otherUserImage: data.otherUserImage || data.fromImage,
          },
        },
      });
    }

    // 6. News Broadcast - Redirect to News Screen
    if (
      data &&
      (data.type === 'NEWS_BROADCAST' || data.screen === 'NewsScreen')
    ) {
      console.log('[NotificationService] Navigating to NewsScreen');
      navigationRef.navigate('User', {
        screen: 'HomeTab',
        params: {
          screen: 'NewsScreen',
          params: { articleId: data.newsId },
        },
      });
    }

    if (callback && data && data.screen) {
      callback(data.screen, data);
    }
  }
}

export const notificationService = new NotificationService();

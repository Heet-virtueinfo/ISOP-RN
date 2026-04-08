import { doc, updateDoc, Timestamp } from '@react-native-firebase/firestore';
import { firebaseMessaging, firebaseFirestore } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { PermissionsAndroid, Platform } from 'react-native';
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
        const authStatus = await firebaseMessaging.requestPermission();
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
        !firebaseMessaging.isDeviceRegisteredForRemoteMessages
      ) {
        await firebaseMessaging.registerDeviceForRemoteMessages();
      }

      const token = await firebaseMessaging.getToken();
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
      
      // Only update if we have a token AND it's different from the existing one
      if (newToken && uid && newToken !== existingToken) {
        console.log('[NotificationService] New token detected. Updating Firestore...');
        await updateDoc(doc(firebaseFirestore, COLLECTIONS.USERS, uid), {
          fcmToken: newToken,
          updatedAt: Timestamp.now(),
        });
      } else {
        console.log('[NotificationService] Token matches existing one. Skipping update.');
      }
    } catch (error) {
      console.error('Update User Token Error:', error);
    }
  }


  onTokenRefresh(uid: string) {
    return firebaseMessaging.onTokenRefresh(async token => {
      console.log('FCM Token Refreshed:', token);
      if (uid) {
        await updateDoc(doc(firebaseFirestore, COLLECTIONS.USERS, uid), {
          fcmToken: token,
          updatedAt: Timestamp.now(),
        });
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
    const unsubscribeFCM = firebaseMessaging.onMessage(async remoteMessage => {
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
    firebaseMessaging.setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }

  async handleInitialNotification(
    callback: (screen: string, data?: any) => void,
  ) {
    // 1. If app was opened from a "quit" state via FCM
    const initialNotification =
      await firebaseMessaging.getInitialNotification();
    if (initialNotification) {
      console.log('Opened from quit state (FCM):', initialNotification);
      this.processNotificationData(initialNotification, callback);
    }

    // 2. If app was opened from a "quit" state via Notifee
    const initialNotifee = await notifee.getInitialNotification();
    if (initialNotifee) {
      console.log(
        'Opened from quit state (Notifee):',
        initialNotifee.notification,
      );
      this.processNotificationData(initialNotifee.notification, callback);
    }

    // 3. If app was in background
    return firebaseMessaging.onNotificationOpenedApp(remoteMessage => {
      console.log('Opened from background (FCM):', remoteMessage);
      this.processNotificationData(remoteMessage, callback);
    });
  }

  private processNotificationData(
    remoteMessage: any,
    callback?: (screen: string, data?: any) => void,
  ) {
    const { data } = remoteMessage;
    console.log('[NotificationService] Processing data:', data);

    if (data && data.screen === 'Participants') {
      console.log('[NotificationService] Navigating to Participants screen');
      navigationRef.navigate('User', {
        screen: 'HomeTab',
        params: {
          screen: 'Participants',
          params: { eventId: data.eventId, eventTitle: data.eventTitle },
        },
      });
    } else if (data && data.screen === 'RequestsTab') {
      console.log('[NotificationService] Navigating to RequestsTab');
      navigationRef.navigate('User', {
        screen: 'RequestsTab',
        params: { screen: 'ChatRequests' },
      });
    } else if (data && data.screen === 'Chat') {
      console.log('[NotificationService] Navigating to Chat screen');
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
    } else if (data && data.eventId) {
      console.log(`[NotificationService] Attempting deep-link to event: ${data.eventId}`);
      // Navigate through the hierarchy: Root (User) -> Tab (HomeTab) -> Screen (EventDetail)
      navigationRef.navigate('User', {
        screen: 'HomeTab',
        params: {
          screen: 'EventDetail',
          params: { eventId: data.eventId },
        },
      });
    } else if (data && data.screen) {
      console.log(`[NotificationService] Attempting generic screen-link to: ${data.screen}`);
      navigationRef.navigate(data.screen, data);
    }

    if (callback && data && data.screen) {
      callback(data.screen, data);
    }
  }
}

export const notificationService = new NotificationService();

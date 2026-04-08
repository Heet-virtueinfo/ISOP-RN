import auth from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const ADMIN_UID = 'E8aGjE9fKkRJzxJvsiCtZ4QYZon2';

export const firebaseAuth = auth();
export const firebaseFirestore = getFirestore();
export const firebaseMessaging = messaging();

# Firebase Cloud Messaging (FCM) — Complete Integration Plan

## Project Overview

**App**: ISoP (International Society of Pharmacovigilance)
**Frontend**: React Native 0.84.1 (New Architecture enabled)
**Backend**: Node.js (separate project, not in this workspace)
**Firebase SDK**: `@react-native-firebase` v23.8.8

---

## 1. Current Project Status — What's Already Installed

### ✅ Already Installed (Frontend — React Native)

| Package | Version | Status |
| :--- | :--- | :--- |
| `@react-native-firebase/app` | ^23.8.8 | ✅ Installed |
| `@react-native-firebase/messaging` | ^23.8.8 | ✅ Installed |
| `@react-native-firebase/auth` | ^23.8.8 | ✅ Installed |
| `@react-native-firebase/firestore` | ^23.8.8 | ✅ Installed |
| `@react-native-firebase/analytics` | ^23.8.8 | ✅ Installed |

### ❌ Not Yet Installed (Frontend)

| Package | Purpose |
| :--- | :--- |
| `@notifee/react-native` | For local notification display, custom notification channels, styling, and foreground notifications |

### ❌ Not Yet Done (Code-level)

| Item | Status |
| :--- | :--- |
| FCM Token retrieval | ❌ No code exists |
| FCM Token stored in Firestore `users` collection | ❌ Not implemented |
| Permission request (Android 13+ / iOS) | ❌ Not implemented |
| Foreground notification handler | ❌ Not implemented |
| Background notification handler | ❌ Not implemented |
| Notification tap/open handler | ❌ Not implemented |
| `notificationService.ts` | ❌ File does not exist |

### ❌ Not Yet Done (Native Configuration)

| Item | Android | iOS |
| :--- | :--- | :--- |
| `POST_NOTIFICATIONS` permission (Android 13+) | ❌ Not in `AndroidManifest.xml` | N/A |
| Push Notification Capability | N/A | ❌ Not enabled in Xcode |
| Background Modes (Remote notifications) | N/A | ❌ Not enabled in Xcode |
| APNs Key uploaded to Firebase Console | N/A | ❌ Not done |
| SHA fingerprints in Firebase Console | ✅ Just completed | N/A |

### ❌ Not Yet Done (Backend — Node.js)

| Item | Status |
| :--- | :--- |
| `firebase-admin` SDK installed | ⚠️ Check your backend |
| Send notification API endpoint | ❌ Not implemented |
| Trigger notification on events (event created, chat request, etc.) | ❌ Not implemented |

---

## 2. Architecture — How FCM Will Work

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │  React Native App │                                      │
│  │                    │                                      │
│  │  1. Request Permission                                   │
│  │  2. Get FCM Token                                        │
│  │  3. Store token in Firestore → users/{uid}/fcmToken      │
│  │  4. Listen for notifications (FG + BG)                   │
│  │  5. Handle notification tap → Navigate to screen         │
│  └──────────┬───────────────────────────────────────────┘   │
│             │                                               │
│             ▼                                               │
│  ┌──────────────────┐                                       │
│  │  Firestore DB      │                                     │
│  │                    │                                      │
│  │  users/{uid}       │                                      │
│  │    └─ fcmToken: "xxx"                                    │
│  │    └─ fcmTokens: ["xxx", "yyy"] (multi-device)           │
│  └──────────┬───────────────────────────────────────────┘   │
│             │                                               │
│             ▼                                               │
│  ┌──────────────────┐                                       │
│  │  Node.js Backend   │                                     │
│  │                    │                                      │
│  │  1. Read fcmToken from Firestore                         │
│  │  2. Use firebase-admin to send notification              │
│  │  3. Triggered by: event creation, chat request, etc.     │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Native Platform Setup

#### Step 1.1 — Android: Add `POST_NOTIFICATIONS` Permission
- **File**: [AndroidManifest.xml](file:///Users/apple/Desktop/Heet/ISOP_RN/android/app/src/main/AndroidManifest.xml)
- Add `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` for Android 13+ (API 33+)
- The `@react-native-firebase/messaging` library handles the notification channel automatically on Android

#### Step 1.2 — Android: Notification Channel (Optional, for Notifee)
- If using `@notifee/react-native`, create a default notification channel for Android 8+ (API 26+)
- Channel name: `"ISoP Notifications"`

#### Step 1.3 — iOS: Enable Push Notification Capability
- Open Xcode → ISOP_RN target → **Signing & Capabilities**
- Click **"+ Capability"** → Add **"Push Notifications"**
- Also add **"Background Modes"** → Check **"Remote notifications"**

#### Step 1.4 — iOS: Upload APNs Key to Firebase Console
- Go to **Apple Developer Console** → Keys → Create a new key with **"Apple Push Notifications service (APNs)"**
- Download the `.p8` file
- Go to **Firebase Console** → Project Settings → Cloud Messaging → iOS app → Upload the APNs Auth Key (.p8)

#### Step 1.5 — iOS: Update AppDelegate for Push Notifications
- **File**: [AppDelegate.swift](file:///Users/apple/Desktop/Heet/ISOP_RN/ios/ISOP_RN/AppDelegate.swift)
- Register for remote notifications in `didFinishLaunchingWithOptions`
- Add `application:didRegisterForRemoteNotificationsWithDeviceToken:` delegate method

---

### Phase 2: React Native — FCM Service Layer

#### Step 2.1 — Create `src/services/notificationService.ts`
This is the core service file. It will contain:

| Function | Purpose |
| :--- | :--- |
| `requestNotificationPermission()` | Request permission on iOS & Android 13+ |
| `getFCMToken()` | Get the device FCM token |
| `saveFCMTokenToFirestore(uid, token)` | Save token to `users/{uid}` document |
| `onTokenRefresh(uid)` | Listen for token refresh and update Firestore |
| `setupForegroundHandler()` | Display notification when app is in foreground |
| `setupBackgroundHandler()` | Handle notification when app is in background/killed |
| `handleNotificationOpen(remoteMessage)` | Navigate to specific screen based on notification data |

#### Step 2.2 — Update `src/types/index.ts`
- Add `fcmToken?: string` field to `UserProfile` interface
- Optionally add `fcmTokens?: string[]` for multi-device support

#### Step 2.3 — Update `src/contexts/AuthContext.tsx`
- After user login (inside `onAuthStateChanged`), call:
  - `requestNotificationPermission()`
  - `getFCMToken()` → `saveFCMTokenToFirestore(uid, token)`
  - `onTokenRefresh(uid)`
- On logout, optionally remove the FCM token from Firestore

#### Step 2.4 — Update `App.tsx`
- Register the background message handler at the **top level** (outside of any React component)
- This is required by `@react-native-firebase/messaging`

#### Step 2.5 — Update `src/config/firebase.ts`
- Add `import messaging from '@react-native-firebase/messaging';`
- Export `firebaseMessaging = messaging();`

---

### Phase 3: Notification Triggers — When to Send Notifications

Based on the current app features, here are the recommended notification triggers:

| Trigger Event | Who Receives | Notification Title | Notification Body |
| :--- | :--- | :--- | :--- |
| **New Event Created** | All users | "New Event 🎉" | "{eventTitle} on {date}" |
| **Event Updated** | Enrolled users | "Event Updated 📝" | "{eventTitle} has been updated" |
| **Event Reminder** | Enrolled users | "Event Reminder ⏰" | "{eventTitle} starts tomorrow" |
| **Chat Request Received** | Target user | "New Chat Request 💬" | "{fromName} wants to connect" |
| **Chat Request Accepted** | Requester | "Request Accepted ✅" | "{toName} accepted your request" |
| **New Chat Message** | Recipient | "New Message 💬" | "{senderName}: {messagePreview}" |
| **Enrollment Confirmation** | Enrolled user | "Enrolled Successfully ✅" | "You're enrolled in {eventTitle}" |

---

### Phase 4: Node.js Backend — Sending Notifications

#### Step 4.1 — Install `firebase-admin` (if not already installed)
```bash
npm install firebase-admin
```

#### Step 4.2 — Create Notification Utility
Create a utility function in the backend that:
1. Accepts `userId` (or `fcmToken`) + notification payload
2. Fetches the user's `fcmToken` from Firestore
3. Sends the notification using `admin.messaging().send()`

#### Step 4.3 — FCM V1 API Payload Structure
```json
{
  "token": "<FCM_TOKEN>",
  "notification": {
    "title": "New Event 🎉",
    "body": "AI in Pharmacovigilance Conference on April 15"
  },
  "data": {
    "type": "new_event",
    "eventId": "abc123",
    "screen": "EventDetail"
  },
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "isop_notifications",
      "sound": "default"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1
      }
    }
  }
}
```

#### Step 4.4 — Integrate with Existing Backend Routes
- After `createEvent()` → Send notification to all users
- After `sendChatRequest()` → Send notification to target user
- After `acceptChatRequest()` → Send notification to requester
- After `sendMessage()` → Send notification to recipient

---

### Phase 5: Topic-Based Notifications (Optional Enhancement)

For broadcast notifications (e.g., new event created → notify ALL users), instead of fetching every user's token, use **FCM Topics**:

| Topic | Who Subscribes | When |
| :--- | :--- | :--- |
| `all_users` | Every user | On login |
| `event_{eventId}` | Enrolled users | On enrollment |
| `admin` | Admin users | On admin login |

This avoids fetching all user tokens from Firestore and scales better.

---

## 4. Files to be Created / Modified

### New Files
| File | Purpose |
| :--- | :--- |
| `src/services/notificationService.ts` | Core FCM service (permission, token, handlers) |

### Modified Files
| File | Changes |
| :--- | :--- |
| [App.tsx](file:///Users/apple/Desktop/Heet/ISOP_RN/App.tsx) | Register background handler |
| [AuthContext.tsx](file:///Users/apple/Desktop/Heet/ISOP_RN/src/contexts/AuthContext.tsx) | Initialize FCM on login, cleanup on logout |
| [firebase.ts](file:///Users/apple/Desktop/Heet/ISOP_RN/src/config/firebase.ts) | Export `messaging()` instance |
| [types/index.ts](file:///Users/apple/Desktop/Heet/ISOP_RN/src/types/index.ts) | Add `fcmToken` to `UserProfile` |
| [AndroidManifest.xml](file:///Users/apple/Desktop/Heet/ISOP_RN/android/app/src/main/AndroidManifest.xml) | Add `POST_NOTIFICATIONS` permission |
| [AppDelegate.swift](file:///Users/apple/Desktop/Heet/ISOP_RN/ios/ISOP_RN/AppDelegate.swift) | Register for remote notifications |

### Backend Files (Node.js — Separate Project)
| File | Purpose |
| :--- | :--- |
| `utils/sendNotification.js` | Utility to send FCM notifications |
| Integration in existing routes | Trigger notifications on event/chat actions |

---

## 5. Firestore Schema Update

### `users/{uid}` — Add FCM Token Field

```
users/{uid}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── role: "admin" | "user"
  ├── phoneNumber?: string
  ├── profileImage?: string
  ├── fcmToken?: string          ← NEW
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

---

## 6. Prerequisite Checklist (Before Coding)

> [!IMPORTANT]
> Complete these manual steps before we start writing code:

- [ ] **Firebase Console**: Add SHA-1 & SHA-256 fingerprints (✅ Already done in this session)
- [ ] **Firebase Console**: Download updated `google-services.json` and place in `android/app/`
- [ ] **Firebase Console**: Download updated `GoogleService-Info.plist` and place in `ios/ISOP_RN/`
- [ ] **Firebase Console** (iOS): Upload APNs Auth Key (.p8 file) from Apple Developer Console
- [ ] **Xcode**: Enable Push Notifications capability
- [ ] **Xcode**: Enable Background Modes → Remote notifications
- [ ] **Firebase Console**: Ensure **Cloud Messaging API (V1)** is enabled in Google Cloud Console
- [ ] **Backend**: Confirm `firebase-admin` is installed and service account is configured

---

## 7. Testing Plan

| Test Case | How to Verify |
| :--- | :--- |
| Permission request shows on Android 13+ | Install on Android 13+ device |
| Permission request shows on iOS | Install on iOS device |
| FCM token is saved in Firestore | Check `users/{uid}` document in Firebase Console |
| Foreground notification displays | Send test notification from Firebase Console while app is open |
| Background notification displays | Send test notification while app is in background |
| Notification tap opens correct screen | Tap notification → verify navigation |
| Token refresh updates Firestore | Force token refresh → check Firestore |
| Backend can send notification | Call backend API → verify notification received |

---

## 8. Dependencies Summary

### Frontend (React Native)
| Package | Status | Required For |
| :--- | :--- | :--- |
| `@react-native-firebase/app` | ✅ Installed | Firebase core |
| `@react-native-firebase/messaging` | ✅ Installed | FCM token, handlers |
| `@notifee/react-native` | ❌ Optional | Custom foreground notification display |

### Backend (Node.js)
| Package | Status | Required For |
| :--- | :--- | :--- |
| `firebase-admin` | ⚠️ Verify | Sending notifications via FCM V1 API |

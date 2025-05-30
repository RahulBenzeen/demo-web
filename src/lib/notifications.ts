import {
  messaging,
  auth,
  db
} from "./firebase";
import {
  getToken,
  onMessage,
  MessagePayload
} from "firebase/messaging";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  DocumentData
} from "firebase/firestore";
import { User } from "firebase/auth";


// Request notification permission
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await getFCMToken();
    }
    return null;
  } catch (error) {
    console.error("Notification permission error:", error);
    return null;
  }
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_APP_VAPID_KEY });
    await saveTokenToFirestore(token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

const saveTokenToFirestore = async (token: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  try {
    await updateDoc(userRef, {
      [`fcmTokens.${token}`]: true
    });
  } catch {
    // fallback: create doc if it doesn't exist
    await setDoc(userRef, {
      fcmTokens: { [token]: true }
    }, { merge: true });
  }
};

// Handle foreground messages
export const setupForegroundHandler = (): void => {
  onMessage(messaging, (payload: MessagePayload) => {

    if (payload.notification) {
      new Notification(payload.notification.title || "New Message", {
        body: payload.notification.body,
        icon: payload.notification.icon || '/logo192.png'
      });
    }
  });
};

// Send notification to user
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string
): Promise<void> => {
  try {
    // Create notification document
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      body,
      timestamp: new Date(),
      read: false
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Listen for new notifications
export const setupNotificationListener = (
  userId: string,
  callback: (notification: DocumentData) => void
): Unsubscribe => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        callback(change.doc.data());
      }
    });
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await setDoc(doc(db, "notifications", notificationId), { read: true }, { merge: true });
};

// Setup notifications for current user
export const setupNotifications = (): void => {
  auth.onAuthStateChanged((user: User | null) => {
    if (user) {
      requestNotificationPermission();
      setupForegroundHandler();

      // Setup listener for new notifications
      setupNotificationListener(user.uid, (notification) => {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/logo192.png'
        });
      });
    }
  });
};
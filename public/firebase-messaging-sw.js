importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAA7_iSwmZVTmX_syVDA7G-qzLEcfQxK1U",
  authDomain: "blog-608f8.firebaseapp.com",
  projectId: "blog-608f8",
  storageBucket: "blog-608f8.appspot.com",
  messagingSenderId: "414402225078",
  appId: "1:414402225078:web:7e4a2faf4182f1b55ed717",
  measurementId: "G-NM0CMD6G9L"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: '/logo192.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
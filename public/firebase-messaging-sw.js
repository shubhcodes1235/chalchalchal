importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCFSkTxo0LFJo_Q7zTato7shPivnLBBbwQ",
  authDomain: "chalchalchal-bd143.firebaseapp.com",
  projectId: "chalchalchal-bd143",
  storageBucket: "chalchalchal-bd143.firebasestorage.app",
  messagingSenderId: "558655070579",
  appId: "1:558655070579:web:d1e29192b2c3a904d62506"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

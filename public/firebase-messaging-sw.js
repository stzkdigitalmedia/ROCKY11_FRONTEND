importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyArDfW1ksEOCIZOEmLPLctl6_fWG28hsZA",
  authDomain: "rocky-io.firebaseapp.com",
  projectId: "rocky-io",
  storageBucket: "rocky-io.firebasestorage.app",
  messagingSenderId: "888195894847",
  appId: "1:888195894847:web:a2817226bcaddc958b328a",
  measurementId: "G-B55XFZ4WJ3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.data?.logoUrl || payload.notification?.icon || '/logo192.png',
    image: payload.data?.imageUrl || payload.notification?.imageUrl || '',
    data: payload.data,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.actionUrl || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

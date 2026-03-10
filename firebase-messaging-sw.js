importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCFCS5Epty691ONqtUqcngfV-Fz53j6x_o",
  authDomain: "fixzen-73d68.firebaseapp.com",
  projectId: "fixzen-73d68",
  messagingSenderId: "816193738840",
  appId: "1:816193738840:web:7ba3545e56d3538bf7522d"
});

const messaging = firebase.messaging();

// Background Notification Handler
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const notificationTitle = payload.notification?.title || "New Job Alert! 🛠️";
  const notificationOptions = {
    body: payload.notification?.body || "A new service request is available in your area.",
    icon: "icon-192.png", // Ensure this exists in your root folder
    badge: "icon-192.png",
    tag: "job-notification", // Prevents stacking multiple notifications
    renotify: true,
    data: {
      url: payload.fcm_options?.link || "/techniciandashboard.html"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Click (Redirect user to dashboard)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
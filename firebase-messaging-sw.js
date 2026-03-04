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

messaging.onBackgroundMessage(function(payload) {
  console.log("✅ Background message received:", payload);

  const notificationTitle = payload.notification?.title || "New Job Available";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new service job",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      {
        action: 'accept',
        title: '✅ Accept Job'
      },
      {
        action: 'reject',
        title: '❌ Reject'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event.action);
  event.notification.close();
  
  const urlToOpen = 'https://shantu2912.github.io/techniciandashboard.html';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // If already open, focus the tab
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(urlToOpen);
    })
  );
});
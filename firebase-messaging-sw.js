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

// ✅ CRITICAL: Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log("✅ Background message received:", payload);

  const notificationTitle = payload.data?.title || payload.notification?.title || "New Job Available";
  const notificationBody = payload.data?.body || payload.notification?.body || "You have a new service job";
  
  const notificationOptions = {
    body: notificationBody,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'accept',
        title: 'Accept Job'
      },
      {
        action: 'reject',
        title: 'Reject'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'accept') {
    // Handle accept action
    event.waitUntil(
      clients.openWindow('/techniciandashboard.html?action=accept&job=' + event.notification.data?.jobId)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/techniciandashboard.html')
    );
  }
});
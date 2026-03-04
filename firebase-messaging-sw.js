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

// Background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log("✅ Background message received:", payload);

  // Extract data from payload
  const data = payload.data || {};
  const notification = payload.notification || {};
  
  const notificationTitle = notification.title || data.title || "New Job Available";
  const notificationBody = notification.body || data.body || "You have a new service job";
  
  const notificationOptions = {
    body: notificationBody,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    requireInteraction: true, // Keep notification until user interacts
    data: {
      ...data,
      click_action: "OPEN_JOB",
      url: "/techniciandashboard.html"
    },
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
  console.log('🔔 Notification clicked:', event.action);
  event.notification.close();
  
  const data = event.notification.data || {};
  
  if (event.action === 'accept') {
    // Handle accept action
    event.waitUntil(
      clients.openWindow('/techniciandashboard.html?action=accept&job=' + (data.jobId || ''))
    );
  } else if (event.action === 'reject') {
    // Handle reject action
    event.waitUntil(
      clients.openWindow('/techniciandashboard.html?action=reject&job=' + (data.jobId || ''))
    );
  } else {
    // Default click - open dashboard
    event.waitUntil(
      clients.openWindow('/techniciandashboard.html')
    );
  }
});
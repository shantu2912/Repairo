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

// Background message handler - works when app is closed
messaging.onBackgroundMessage(function(payload) {
  console.log('📱 [BACKGROUND] Received background message:', payload);

  const notificationTitle = payload.notification?.title || '🔧 New Job Available';
  const notificationOptions = {
    body: payload.notification?.body || 'A new service job is waiting',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    requireInteraction: true, // Notification stays until user interacts
    actions: [
      {
        action: 'accept',
        title: '✅ Accept'
      },
      {
        action: 'reject',
        title: '❌ Reject'
      }
    ],
    tag: 'new-job-' + Date.now(), // Unique tag to prevent duplicates
    renotify: true
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('📱 [NOTIFICATION CLICK]', event.action);
  
  event.notification.close();

  // Get job data from notification
  const jobData = event.notification.data;

  // Handle action buttons
  if (event.action === 'accept') {
    // Open dashboard with accept action
    event.waitUntil(
      clients.openWindow('https://fixzen-73d68.firebaseapp.com/techniciandashboard.html?action=accept&job_id=' + (jobData?.job_id || ''))
    );
  } else if (event.action === 'reject') {
    // Handle reject silently
    console.log('Job rejected');
  } else {
    // Default click - open dashboard
    event.waitUntil(
      clients.openWindow('https://fixzen-73d68.firebaseapp.com/techniciandashboard.html')
    );
  }
});

// Service worker installation
self.addEventListener('install', function(event) {
  console.log('📱 [SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('📱 [SW] Service Worker activated');
  return self.clients.claim();
});
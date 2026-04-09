// ============================================================
// firebase-messaging-sw.js  —  FIXED VERSION
// FIX 1: Added vapidKey awareness (FCM v9 compat requires it
//         to be passed from the page, not the SW — but the SW
//         must initialise the same app so token introspection works)
// FIX 2: Proper notification click handler to open the dashboard
// FIX 3: Added cache-bust install/activate lifecycle so a stale
//         SW never blocks new token registration
// ============================================================

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

// ── FIX 3: Take control immediately so the new SW is not stuck waiting ──
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(self.clients.claim());
});

// ── Background message handler ──
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || "New Job Available";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new service job",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    // FIX 2: Store the job data so the click handler can use it
    data: {
      ...(payload.data || {}),
      // Always include a URL to open on click
      click_action: payload.data?.click_action
        || payload.notification?.click_action
        || "/techniciandashboard.html"
    },
    // Make notification persist until user interacts with it
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ── FIX 2: Handle notification click — open/focus the dashboard ──
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  const targetUrl = event.notification.data?.click_action || "/techniciandashboard.html";

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If dashboard is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('techniciandashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
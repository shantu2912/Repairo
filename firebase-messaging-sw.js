
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCFCS5Epty691ONqtUqcngfV-Fz53j6x_o",
  authDomain: "fixzen-73d68.firebaseapp.com",
  projectId: "fixzen-73d68",
  messagingSenderId: "816193738840",
  appId: "1:816193738840:web:7ba3545e56d3538bf7522d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("[SW] Background message", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icon-192.png"
    }
  );
});
self.addEventListener("message", event => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: "/Repairo/icon.png",
      badge: "/Repairo/icon.png",
      vibrate: [200, 100, 200]
    });
  }
});


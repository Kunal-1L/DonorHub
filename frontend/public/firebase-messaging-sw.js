importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCN04bYLD64QELGJVERFC6Boee-IfPztlw", 
  authDomain: "donorhub-87520.firebaseapp.com",
  projectId: "donorhub-87520",
  storageBucket: "donorhub-87520.firebasestorage.app",
  messagingSenderId: "1001208287897",
  appId: "1:1001208287897:web:31366a5a4f80801f311e08",
  measurementId: "G-QDWCH40X07",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
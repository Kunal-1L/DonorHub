importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js"
);

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
  const notificationTitle =
    payload.notification?.title || "New Emergency Blood Request!";
  const notificationBody =
    payload.notification?.body ||
    `Location: ${payload.data.location}, Blood Type: ${payload.data.bloodGroup}`;
  const notificationOptions = {
    body: notificationBody,
    icon: "/Main.jpeg",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

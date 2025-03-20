import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCN04bYLD64QELGJVERFC6Boee-IfPztlw",
  authDomain: "donorhub-87520.firebaseapp.com",
  projectId: "donorhub-87520",
  storageBucket: "donorhub-87520.firebasestorage.app",
  messagingSenderId: "1001208287897",
  appId: "1:1001208287897:web:31366a5a4f80801f311e08",
  measurementId: "G-QDWCH40X07"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
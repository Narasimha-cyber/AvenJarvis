import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAITlkoZIsMx99BDrj14I1S-ZtdEMsd1kc",
  authDomain: "pulse360-news.firebaseapp.com",
  projectId: "pulse360-news",
  storageBucket: "pulse360-news.firebasestorage.app",
  messagingSenderId: "789441397313",
  appId: "1:789441397313:web:ff3abd4184818b23d13cc0"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

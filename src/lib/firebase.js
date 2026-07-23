import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBymRFtSHgAmYMtP65ssKzzPqCO8BhwtqE",
  authDomain: "share-trading-tracker.firebaseapp.com",
  projectId: "share-trading-tracker",
  storageBucket: "share-trading-tracker.firebasestorage.app",
  messagingSenderId: "375931057008",
  appId: "1:375931057008:web:d889e0b33c1f275b5855b5",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

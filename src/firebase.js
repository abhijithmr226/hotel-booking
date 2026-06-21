import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBrHAvwmbRkVefZIa8IYU7SiQmRQhN-Ne8",
  authDomain: "hotel-booking-808e8.firebaseapp.com",
  projectId: "hotel-booking-808e8",
  storageBucket: "hotel-booking-808e8.firebasestorage.app",
  messagingSenderId: "725316147972",
  appId: "1:725316147972:web:b71441cab273697367ce51",
  measurementId: "G-30NNKW9MXH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {}

const useFirebase = true;

export {
  app,
  auth,
  analytics,
  useFirebase,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile
};

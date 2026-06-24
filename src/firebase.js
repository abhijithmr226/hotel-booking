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
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
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
const db = getFirestore(app);
const storage = getStorage(app);

// ─── Auth Persistence: keep user logged in across page refreshes ──────────────
setPersistence(auth, browserLocalPersistence).catch(() => {});

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {}

const useFirebase = true;

// ─── Auth Observer Helper ─────────────────────────────────────────────────────
/**
 * Registers a single listener that fires immediately with the current user
 * (or null) and on every subsequent auth state change.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} unsubscribe function
 */
function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────
/**
 * Upload a File to Firebase Storage.
 * @param {File} file
 * @param {string} storagePath  e.g. "hotels/hotel-001/main.jpg"
 * @param {(progress: number) => void} [onProgress]  0–100
 * @returns {Promise<string>} download URL
 */
async function uploadFile(file, storagePath, onProgress) {
  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file);
  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage by its full gs:// or https:// URL.
 * @param {string} fileUrl
 */
async function deleteFile(fileUrl) {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (e) {
    console.warn("deleteFile: could not remove", fileUrl, e.message);
  }
}

export {
  app,
  auth,
  db,
  storage,
  analytics,
  useFirebase,
  // Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  watchAuthState,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  // Firestore
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  // Storage
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadFile,
  deleteFile
};

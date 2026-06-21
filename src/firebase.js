// Mock Firebase SDK connecting to local Node/Express backend APIs
const useFirebase = false;

function getLocalUser() {
  try {
    const userJson = localStorage.getItem("hbooking_user");
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

const listeners = [];

export function onAuthStateChanged(auth, callback) {
  listeners.push(callback);
  const user = getLocalUser();
  callback(user ? { uid: user.uid, email: user.email, displayName: user.name, photoURL: user.photoURL } : null);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function triggerAuthStateChanged(user) {
  listeners.forEach(cb => {
    try {
      cb(user ? { uid: user.uid, email: user.email, displayName: user.name, photoURL: user.photoURL } : null);
    } catch (e) {
      console.error("Auth listener error:", e);
    }
  });
}

export async function signInWithEmailAndPassword(auth, email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw { code: err.code || "auth/invalid-credential", message: err.message };
  }
  const user = await res.json();
  localStorage.setItem("hbooking_session_type", "local");
  localStorage.setItem("hbooking_user", JSON.stringify(user));
  triggerAuthStateChanged(user);
  return { user: { uid: user.uid, email: user.email, displayName: user.name, photoURL: user.photoURL } };
}

export async function createUserWithEmailAndPassword(auth, email, password) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw { code: err.code || "auth/email-already-in-use", message: err.message };
  }
  const user = await res.json();
  localStorage.setItem("hbooking_session_type", "local");
  localStorage.setItem("hbooking_user", JSON.stringify(user));
  triggerAuthStateChanged(user);
  return { user: { uid: user.uid, email: user.email, displayName: user.name, photoURL: user.photoURL } };
}

export async function signOut() {
  localStorage.removeItem("hbooking_user");
  localStorage.removeItem("hbooking_session_type");
  triggerAuthStateChanged(null);
}

export async function signInWithPopup(auth, provider) {
  const mockGoogleUser = {
    uid: "google_" + Date.now(),
    email: "google.user@gmail.com",
    displayName: "Google Traveler",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
  };
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mockGoogleUser)
  });
  if (!res.ok) {
    throw { code: "auth/network-request-failed", message: "Google Sign-In failed on backend" };
  }
  const user = await res.json();
  localStorage.setItem("hbooking_session_type", "local");
  localStorage.setItem("hbooking_user", JSON.stringify(user));
  triggerAuthStateChanged(user);
  return { user: { uid: user.uid, email: user.email, displayName: user.name, photoURL: user.photoURL } };
}

export class GoogleAuthProvider {}

export async function sendPasswordResetEmail(auth, email) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const err = await res.json();
    throw { code: err.code || "auth/user-not-found", message: err.message };
  }
}

// Emptied mock db structure
const app = {};
const db = null;
const auth = {};
const analytics = null;

export { app, db, auth, analytics, useFirebase };

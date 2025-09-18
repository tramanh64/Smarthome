import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Keep login state even after reload
setPersistence(auth, browserLocalPersistence);

// Watch user state (callback sẽ nhận user hoặc null)
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Sign up
export async function registerEmailPassword(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Login
export async function loginEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Logout
export async function logout() {
  await signOut(auth);
}

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for Google Auth (Firebase Auth)
const firebaseAuthConfig = {
  apiKey: "AIzaSyDAQggqn21lqfI3O754By_WMvizSWLNvIo",
  authDomain: "skillnaav-authentication.firebaseapp.com",
  projectId: "skillnaav-authentication",
  storageBucket: "skillnaav-authentication.firebasestorage.app",
  messagingSenderId: "533152822891",
  appId: "1:533152822891:web:60b4c15d5f6dad05b9a32e",
  measurementId: "G-KQTBM0VC93",
};

// Firebase configuration for Photo Storage
const firebaseStorageConfig = {
  apiKey: "AIzaSyBC8-dTj7LeZdDEJ55skgrSK-KqaJu8VIE",
  authDomain: "skillnaav-doc.firebaseapp.com",
  projectId: "skillnaav-doc",
  storageBucket: "skillnaav-doc.appspot.com",  // Ensure this matches the bucket URL
  messagingSenderId: "805153616143",
  appId: "1:805153616143:web:94acbd7436dbd620b44e7a",
  measurementId: "G-78JJ8PRQSR",
};


// Initialize Firebase app for Google Auth
const firebaseAuthApp = initializeApp(firebaseAuthConfig, "googleAuthApp");

// Initialize Firebase app for Photo Storage
const firebaseStorageApp = initializeApp(firebaseStorageConfig, "photoStorageApp");

// Get Firebase services for Google Auth
const auth = getAuth(firebaseAuthApp);
const googleAuthProvider = new GoogleAuthProvider();
const db = getFirestore(firebaseAuthApp);

// Get Firebase services for Photo Storage (Make sure you specify the correct app instance)
const storage = getStorage(firebaseStorageApp);

// Export services
export { auth, googleAuthProvider, signInWithPopup, storage, db };

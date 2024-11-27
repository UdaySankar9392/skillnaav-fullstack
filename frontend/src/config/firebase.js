// Import specific functions from Firebase's modular SDK
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';  // Added signInWithPopup
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAQggqn21lqfI3O754By_WMvizSWLNvIo",
  authDomain: "skillnaav-authentication.firebaseapp.com",
  projectId: "skillnaav-authentication",
  storageBucket: "skillnaav-authentication.firebasestorage.app", // Retained the original value
  messagingSenderId: "533152822891",
  appId: "1:533152822891:web:60b4c15d5f6dad05b9a32e",
  measurementId: "G-KQTBM0VC93"
};

// Initialize Firebase app (only if not initialized already)
const firebaseApp = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

// Export Firebase services and utility functions
export { firebaseApp, auth, googleAuthProvider, signInWithPopup, storage, db };

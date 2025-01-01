import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for Google Auth
const firebaseAuthConfig = {
  apiKey: "AIzaSyDAQggqn21lqfI3O754By_WMvizSWLNvIo",
  authDomain: "skillnaav-authentication.firebaseapp.com",
  projectId: "skillnaav-authentication",
  storageBucket: "skillnaav-authentication.firebasestorage.app",
  messagingSenderId: "533152822891",
  appId: "1:533152822891:web:60b4c15d5f6dad05b9a32e",
  measurementId: "G-KQTBM0VC93"
};

// Firebase configuration for Photo Storage
const firebaseStorageConfig = {
  apiKey: "AIzaSyBC8-dTj7LeZdDEJ55skgrSK-KqaJu8VIE",
  authDomain: "skillnaav-doc.firebaseapp.com",
  projectId: "skillnaav-doc",
  storageBucket: "skillnaav-doc.appspot.com",
  messagingSenderId: "805153616143",
  appId: "1:805153616143:web:94acbd7436dbd620b44e7a",
  measurementId: "G-78JJ8PRQSR",
};

// Firebase configuration for Resume Uploads
const firebaseResumeConfig = {
  apiKey: "AIzaSyDz-_d-VRXrdwF-lMcglCMeQxFP7tAXhdc",
  authDomain: "skillnaav-res.firebaseapp.com",
  projectId: "skillnaav-res",
  storageBucket: "skillnaav-res.appspot.com",
  messagingSenderId: "932905658316",
  appId: "1:932905658316:web:432d22ba31f6e26ab11f69",
  measurementId: "G-6Q71S6P03M",
};

// Initialize Firebase app for Google Auth
const firebaseAuthApp = initializeApp(firebaseAuthConfig, "googleAuthApp");

// Initialize Firebase app for Photo Storage
const firebaseStorageApp = initializeApp(firebaseStorageConfig, "photoStorageApp");

// Initialize Firebase app for Resume Uploads
const firebaseResumeApp = initializeApp(firebaseResumeConfig, "resumeApp");

// Get Firebase services for Google Auth
const auth = getAuth(firebaseAuthApp);
const googleAuthProvider = new GoogleAuthProvider();
const db = getFirestore(firebaseAuthApp);

// Get Firebase services for Photo Storage
const storage = getStorage(firebaseStorageApp);

// Get Firebase services for Resume Uploads
const resumeStorage = getStorage(firebaseResumeApp); // Storage instance for resumes

// Export services
export { auth, googleAuthProvider, signInWithPopup, storage, resumeStorage, db };

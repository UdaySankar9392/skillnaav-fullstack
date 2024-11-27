import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { initializeApp, getApp, getApps } from "firebase/app"; // Import modular SDK methods
import { getStorage } from "firebase/storage"; // Import getStorage for Firebase Storage
import store from "./redux/store";
import { Provider } from "react-redux";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC8-dTj7LeZdDEJ55skgrSK-KqaJu8VIE",
  authDomain: "skillnaav-doc.firebaseapp.com",
  projectId: "skillnaav-doc",
  storageBucket: "skillnaav-doc.appspot.com",
  messagingSenderId: "805153616143",
  appId: "1:805153616143:web:94acbd7436dbd620b44e7a",
  measurementId: "G-78JJ8PRQSR",
};

// Initialize Firebase only once
if (!getApps().length) {  // Check if Firebase apps have been initialized
  initializeApp(firebaseConfig); // Initialize Firebase if not yet initialized
} else {
  getApp(); // Use the existing app if already initialized
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();

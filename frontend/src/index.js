import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import firebase from "firebase/compat/app";
import "firebase/compat/storage"; // Ensure Firebase Storage is imported
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();

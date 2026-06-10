
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCg4YvDCkWNbziN55qPXO7kIrBb3OHAYs",
  authDomain: "tcs-nqt-tracker.firebaseapp.com",
  projectId: "tcs-nqt-tracker",
  storageBucket: "tcs-nqt-tracker.firebasestorage.app",
  messagingSenderId: "699981635234",
  appId: "1:699981635234:web:e5a070559ce4046d1241fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

// ✅ Save user data
export async function saveUserData(username, data) {

  try {

    await setDoc(
      doc(db, "users", username),
      {
        data: data,
        updatedAt: Date.now()
      }
    );

    console.log("✅ Firebase Save Success");

  } catch (err) {

    console.error("❌ Firebase Save Error:", err);

  }
}

// ✅ Load user data
export async function loadUserData(username) {

  try {

    const snap = await getDoc(
      doc(db, "users", username)
    );

    if (snap.exists()) {

      console.log("✅ Firebase Load Success");

      return snap.data().data;
    }

    console.log("⚠️ No Firebase data found");

    return null;

  } catch (err) {

    console.error("❌ Firebase Load Error:", err);

    return null;
  }
}


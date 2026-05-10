import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClxUVVXF5dxUCqdVN-lcIgpCsH0ZVU4BU",
  authDomain: "thesis-printing.firebaseapp.com",
  projectId: "thesis-printing",
  storageBucket: "thesis-printing.firebasestorage.app",
  messagingSenderId: "914044768472",
  appId: "1:914044768472:web:13184ebb9f346a7b78c7ad",
  measurementId: "G-EKSMK9DFVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

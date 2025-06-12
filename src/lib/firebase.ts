
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// If you plan to use Firebase Analytics, uncomment the line below
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA60fFosiSuXCNqAk84l-3bHgy9Bhcud_w",
  authDomain: "project-1-2e67a.firebaseapp.com",
  // databaseURL: "https://project-1-2e67a-default-rtdb.firebaseio.com", // Only if using Realtime Database
  projectId: "project-1-2e67a",
  storageBucket: "project-1-2e67a.appspot.com", // Corrected common pattern, ensure this is accurate for your project
  messagingSenderId: "852442832278",
  appId: "1:852442832278:web:840eefe3c452d1f20111b7",
  // measurementId: "G-MFBX0FZQQ8" // Only if using Firebase Analytics
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// If you plan to use Firebase Analytics, uncomment the lines below
// let analytics;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

export { db };
// If using analytics, you might want to export it too: export { db, analytics };

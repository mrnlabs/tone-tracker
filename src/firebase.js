import { initializeApp } from 'firebase/app'

// Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyDvUvbH2h0-PrLf6FCMynK4U0gSig3zCNc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // apiKey: "AIzaSyDvUvbH2h0-PrLf6FCMynK4U0gSig3zCNc",
  // authDomain: "tone-tracker-180fe.firebaseapp.com",
  // projectId: "tone-tracker-180fe",
  // storageBucket: "tone-tracker-180fe.appspot.com",
  // messagingSenderId:"561688668921",
  // appId: "1:561688668921:web:2c0557140daa3e64409028",
//}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
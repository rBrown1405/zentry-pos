// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// Note: Using compat mode for better compatibility with existing code

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3VrvARQ8Am4uRAQUxOk0BeVGUvcRIGLs",
  authDomain: "zentry-pos-d10b5.firebaseapp.com",
  projectId: "zentry-pos-d10b5",
  storageBucket: "zentry-pos-d10b5.appspot.com",
  messagingSenderId: "129749186855",
  appId: "1:129749186855:web:9197c7d4717616d0d99102",
  measurementId: "G-SKRP6M7Y88"
};

// Initialize Firebase using compat mode
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
let auth, db, storage;

function initializeFirebase() {
  // Initialize Firebase
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  
  // Enable offline persistence for Firestore (optional but recommended for POS systems)
  db.enablePersistence()
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      }
    });
    
  console.log('Firebase initialized successfully');
}

// Initialize Firebase when the script loads
initializeFirebase();

// Export Firebase services
window.firebaseServices = {
  getApp: () => app,
  getAuth: () => auth,
  getDb: () => db,
  getStorage: () => storage
};

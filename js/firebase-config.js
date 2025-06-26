// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

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

// Export Firebase services
window.firebaseServices = {
  getApp: () => app,
  getAuth: () => auth,
  getDb: () => db,
  getStorage: () => storage
};

// Firebase Configuration for Zentry POS
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual Firebase API Key
  authDomain: "your-project-id.firebaseapp.com", // Replace with your Firebase Auth Domain
  projectId: "your-project-id", // Replace with your Firebase Project ID
  storageBucket: "your-project-id.appspot.com", // Replace with your Firebase Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your Firebase App ID
  measurementId: "YOUR_MEASUREMENT_ID" // Replace with your Firebase Measurement ID (optional)
};

// Initialize Firebase
// Make sure to include the Firebase SDK in your HTML before using this file
// You'll need: firebase-app.js, firebase-auth.js, firebase-firestore.js, and firebase-storage.js

// To use this configuration, add the following script tags to your HTML head:
/*
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
<script src="js/firebase-config.js"></script>
*/

// Initialize Firebase services
let app, auth, db, storage;

function initializeFirebase() {
  // Initialize Firebase
  app = firebase.initializeApp(firebaseConfig);
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

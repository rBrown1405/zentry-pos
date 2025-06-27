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
  return new Promise((resolve, reject) => {
    try {
      console.log('🔥 Starting Firebase initialization...');
      
      // Initialize Firebase services with timeout protection
      const initTimeout = setTimeout(() => {
        reject(new Error('Firebase initialization timeout after 5 seconds'));
      }, 5000);

      // Initialize core services
      auth = firebase.auth();
      db = firebase.firestore();
      
      // Storage is optional - only initialize if available
      try {
        storage = firebase.storage();
        console.log('✅ Firebase Storage initialized');
      } catch (storageError) {
        console.warn('⚠️ Firebase Storage not available:', storageError.message);
        storage = null;
      }
      
      console.log('✅ Firebase core services initialized');
      
      // Clear timeout since initialization succeeded
      clearTimeout(initTimeout);
      
      // Enable offline persistence for Firestore (optional but recommended for POS systems)
      db.enablePersistence({ synchronizeTabs: true })
        .then(() => {
          console.log('✅ Firestore offline persistence enabled');
          resolve();
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('⚠️ The current browser does not support all of the features required to enable persistence');
          } else {
            console.warn('⚠️ Persistence error:', err);
          }
          // Don't let persistence errors block initialization
          resolve();
        });
        
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      reject(error);
    }
  });
}

// Enhanced initialization with retry mechanism
async function initializeFirebaseWithRetry() {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`🔥 Firebase initialization attempt ${attempts}...`);
      await initializeFirebase();
      console.log('🎉 Firebase initialized successfully');
      return;
    } catch (error) {
      console.error(`❌ Firebase initialization attempt ${attempts} failed:`, error);
      
      if (attempts < maxAttempts) {
        const delay = attempts * 1000; // Increasing delay
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('💥 Firebase initialization failed after all attempts');
        throw error;
      }
    }
  }
}

// Initialize Firebase when the script loads
initializeFirebaseWithRetry()
  .then(() => {
    console.log('✅ Firebase configuration script loaded successfully');
  })
  .catch((error) => {
    console.error('💥 Failed to initialize Firebase:', error);
  });

// Enhanced Firebase initialization with better error handling and timing
let initializationAttempts = 0;
const maxInitAttempts = 3;

function initializeFirebase() {
  return new Promise((resolve, reject) => {
    try {
      initializationAttempts++;
      console.log(`🔥 Starting Firebase initialization (attempt ${initializationAttempts})...`);
      
      // Initialize Firebase services with timeout protection
      const initTimeout = setTimeout(() => {
        reject(new Error('Firebase initialization timeout after 5 seconds'));
      }, 5000);

      // Initialize core services
      auth = firebase.auth();
      db = firebase.firestore();
      
      // Storage is optional - only initialize if available
      try {
        storage = firebase.storage();
        console.log('✅ Firebase Storage initialized');
      } catch (storageError) {
        console.warn('⚠️ Firebase Storage not available:', storageError.message);
        storage = null;
      }
      
      console.log('✅ Firebase core services initialized');
      
      // Clear timeout since initialization succeeded
      clearTimeout(initTimeout);
      
      // Enable offline persistence for Firestore (optional but recommended for POS systems)
      db.enablePersistence({ synchronizeTabs: true })
        .then(() => {
          console.log('✅ Firestore offline persistence enabled');
          resolve();
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('⚠️ The current browser does not support all of the features required to enable persistence');
          } else {
            console.warn('⚠️ Persistence error:', err);
          }
          // Don't let persistence errors block initialization
          resolve();
        });
        
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      reject(error);
    }
  });
}

// Retry mechanism for Firebase initialization
async function initializeFirebaseWithRetry() {
  while (initializationAttempts < maxInitAttempts) {
    try {
      await initializeFirebase();
      console.log('🎉 Firebase initialized successfully');
      return;
    } catch (error) {
      console.error(`❌ Firebase initialization attempt ${initializationAttempts} failed:`, error);
      
      if (initializationAttempts < maxInitAttempts) {
        const delay = initializationAttempts * 1000; // Increasing delay
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('💥 Firebase initialization failed after all attempts');
        throw error;
      }
    }
  }
}

// Initialize Firebase when the script loads
initializeFirebaseWithRetry()
  .then(() => {
    console.log('✅ Firebase configuration script loaded successfully');
  })
  .catch((error) => {
    console.error('💥 Failed to initialize Firebase:', error);
  });

// Export Firebase services with better error handling
window.firebaseServices = {
  getApp: () => app,
  getAuth: () => {
    if (!auth) {
      console.warn('Firebase Auth not initialized');
      return null;
    }
    return auth;
  },
  getDb: () => {
    if (!db) {
      console.warn('Firestore not initialized');
      return null;
    }
    return db;
  },
  getStorage: () => {
    if (!storage) {
      console.warn('Firebase Storage not available');
      return null;
    }
    return storage;
  },
  // Add initialization check method
  isInitialized: () => {
    return !!(auth && db);
  }
};

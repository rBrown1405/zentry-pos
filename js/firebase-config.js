// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHgBZ2pZmXuubRXN1gTLb_kQctmLusNkM",
  authDomain: "zentry-pos-demo.firebaseapp.com",
  projectId: "zentry-pos-demo",
  storageBucket: "zentry-pos-demo.firebasestorage.app",
  messagingSenderId: "1034151152516",
  appId: "1:1034151152516:web:2d67a0e860b3ae42106bd1",
  measurementId: "G-ZR8GSW7LQE"
};

// Initialize Firebase using compat mode
console.log('🔥 Firebase config script loading...');

// Initialize Firebase services variables
let app, auth, db, storage;

// Clear any existing Firebase apps to prevent conflicts
if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
  console.log('🔄 Clearing existing Firebase apps to prevent conflicts...');
  firebase.apps.forEach(app => {
    try {
      app.delete();
    } catch (error) {
      console.warn('Warning: Could not delete existing Firebase app:', error);
    }
  });
}

// Check if Firebase is available
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK not loaded! Make sure Firebase scripts are included before firebase-config.js');
} else {
  try {
    app = firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully with API key:', firebaseConfig.apiKey.substring(0, 10) + '...');
    
    // Make app available globally
    window.firebaseApp = app;
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase app:', error);
    // Set app to null to indicate failure
    app = null;
  }
}

function initializeFirebase() {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔥 Starting Firebase services initialization...');
      
      // Check if Firebase app was successfully initialized
      if (!app) {
        reject(new Error('Firebase app not initialized'));
        return;
      }
      
      // Initialize Firebase services with timeout protection
      const initTimeout = setTimeout(() => {
        reject(new Error('Firebase initialization timeout after 5 seconds'));
      }, 5000);

      // Initialize core services
      auth = firebase.auth();
      db = firebase.firestore();
      
      console.log('✅ Auth and Firestore initialized');
      
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
    
    // Debug: Check variable states before creating provider
    console.log('🔍 Firebase state before provider creation:', {
      app: !!app,
      auth: !!auth, 
      db: !!db,
      storage: !!storage
    });
    
    // Create Firebase provider object
    window.firebaseProvider = {
      initialized: true,
      ready: true,
      app: app,
      auth: auth,
      db: db,
      storage: storage,
      isReady: () => {
        const ready = !!(auth && db && app);
        if (!ready) {
          console.debug('Firebase provider not ready:', { 
            app: !!app, 
            auth: !!auth, 
            db: !!db,
            storage: !!storage 
          });
        }
        return ready;
      },
      getApp: () => app,
      getAuth: () => auth,
      getDb: () => db,
      getStorage: () => storage
    };
    
    // Expose Firebase services to window AFTER successful initialization
    window.firebaseServices = {
      getApp: () => {
        if (!app) {
          console.warn('🚫 Firebase App not initialized');
          return null;
        }
        return app;
      },
      getAuth: () => {
        if (!auth) {
          console.warn('🚫 Firebase Auth not initialized');
          return null;
        }
        return auth;
      },
      getDb: () => {
        if (!db) {
          console.warn('🚫 Firestore not initialized');
          return null;
        }
        return db;
      },
      getStorage: () => {
        if (!storage) {
          console.warn('🚫 Firebase Storage not available');
          return null;
        }
        return storage;
      },
      // Add initialization check method
      isInitialized: () => {
        return !!(auth && db && app);
      }
    };
    
    console.log('🎉 Firebase services exposed to window.firebaseServices');
    console.log('🎉 Firebase provider exposed to window.firebaseProvider');
    
    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('firebaseServicesReady'));
    window.dispatchEvent(new CustomEvent('firebaseProviderReady'));
  })
  .catch((error) => {
    console.error('💥 Failed to initialize Firebase:', error);
    
    // Create fallback provider object that indicates failure
    window.firebaseProvider = {
      initialized: false,
      ready: false,
      error: error,
      isReady: () => false,
      getApp: () => null,
      getAuth: () => null,
      getDb: () => null,
      getStorage: () => null
    };
  });

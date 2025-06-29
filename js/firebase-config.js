// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLDZV5wXtWzrCcs8GknPyH_OxB_9uhjzg",
  authDomain: "zentry-pos-2dc89.firebaseapp.com",
  projectId: "zentry-pos-2dc89",
  storageBucket: "zentry-pos-2dc89.firebasestorage.app",
  messagingSenderId: "215458190528",
  appId: "1:215458190528:web:61365cce55690e8983c925",
  measurementId: "G-QEYMJQE480"
};

// Initialize Firebase using compat mode
console.log('🔥 Firebase config script loading...');

// Initialize Firebase services variables
let app, auth, db, storage;

// Function to wait for Firebase SDK to be available
function waitForFirebaseSDK(maxWait = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkFirebase = () => {
      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        console.log('✅ Firebase SDK detected and ready');
        resolve();
        return;
      }
      
      if (Date.now() - startTime > maxWait) {
        reject(new Error('Firebase SDK not loaded within timeout'));
        return;
      }
      
      setTimeout(checkFirebase, 100);
    };
    
    checkFirebase();
  });
}

// Initialize Firebase after SDK is available
async function initializeFirebaseApp() {
  try {
    await waitForFirebaseSDK();
    
    // Clear any existing Firebase apps to prevent conflicts
    if (firebase.apps && firebase.apps.length > 0) {
      console.log('🔄 Clearing existing Firebase apps to prevent conflicts...');
      firebase.apps.forEach(app => {
        try {
          app.delete();
        } catch (error) {
          console.warn('Warning: Could not delete existing Firebase app:', error);
        }
      });
    }

    app = firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully with API key:', firebaseConfig.apiKey.substring(0, 10) + '...');
    
    // Make app available globally
    window.firebaseApp = app;
    
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase app:', error);
    app = null;
    throw error;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeFirebaseApp();
    console.log('🎉 Firebase app auto-initialized');
  } catch (error) {
    console.error('❌ Failed to auto-initialize Firebase app:', error);
  }
});

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

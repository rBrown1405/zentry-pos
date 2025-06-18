// Firebase Configuration for Zentry POS
const firebaseConfig = {
    apiKey: "AIzaSyCvJ1tZXJqXz0Vb8K8VY_m3QRxPd2k-D8U",
    authDomain: "zentry-pos.firebaseapp.com",
    projectId: "zentry-pos",
    storageBucket: "zentry-pos.appspot.com",
    messagingSenderId: "847236563825",
    appId: "1:847236563825:web:8f9f9f9f9f9f9f9f9f9f9f",
    measurementId: "G-MEASUREMENT_ID"
};

let app = null;
let auth = null;
let db = null;
let storage = null;

function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        
        // Initialize Firebase services
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Enable offline persistence for Firestore (important for POS systems)
        return db.enablePersistence()
            .then(() => {
                console.log('Firebase initialized successfully with offline persistence');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.warn('The current browser does not support all of the features required to enable persistence');
                }
                // Even if persistence fails, we can continue
                console.log('Firebase initialized successfully without offline persistence');
            });
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Export Firebase services
const firebaseServices = {
    initialize: initializeFirebase,
    getApp: () => app,
    getAuth: () => auth,
    getDb: () => db,
    getStorage: () => storage
};

export default firebaseServices;

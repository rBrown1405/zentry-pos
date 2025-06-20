// Firebase Configuration for Zentry POS
// NOTE: These are placeholder credentials. Replace with real Firebase project credentials.
const firebaseConfig = {
    apiKey: "AIzaSyCvJ1tZXJqXz0Vb8K8VY_m3QRxPd2k-D8U",
    authDomain: "zentry-pos.firebaseapp.com",
    projectId: "zentry-pos",
    storageBucket: "zentry-pos.appspot.com",
    messagingSenderId: "847236563825",
    appId: "1:847236563825:web:8f9f9f9f9f9f9f9f9f9f9f",
    measurementId: "G-MEASUREMENT_ID"
};

// Flag to determine if we should use Firebase or localStorage
let useFirebase = false;
let isFirebaseConnected = false;

let app = null;
let auth = null;
let db = null;
let storage = null;

function initializeFirebase() {
    try {
        console.log('Attempting to initialize Firebase...');
        
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        
        // Initialize Firebase services
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Try to enable persistence first, before any operations
        return db.enablePersistence()
            .then(() => {
                console.log('Firebase persistence enabled');
                // Now test the connection
                return testFirebaseConnection();
            })
            .catch((persistenceError) => {
                if (persistenceError.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (persistenceError.code === 'unimplemented') {
                    console.warn('The current browser does not support all of the features required to enable persistence');
                } else {
                    console.warn('Failed to enable persistence:', persistenceError);
                }
                // Continue without persistence and test connection
                return testFirebaseConnection();
            })
            .then(() => {
                console.log('Firebase connection test successful');
                isFirebaseConnected = true;
                useFirebase = true;
                console.log('Firebase initialized successfully');
            })
            .catch((error) => {
                console.warn('Firebase connection failed, falling back to localStorage:', error);
                isFirebaseConnected = false;
                useFirebase = false;
                initializeLocalStorage();
            });
    } catch (error) {
        console.warn('Error initializing Firebase, falling back to localStorage:', error);
        isFirebaseConnected = false;
        useFirebase = false;
        initializeLocalStorage();
    }
}

// Test Firebase connection
function testFirebaseConnection() {
    return new Promise((resolve, reject) => {
        // Set a shorter timeout for faster fallback
        const timeout = setTimeout(() => {
            reject(new Error('Firebase connection timeout - using localStorage fallback'));
        }, 3000); // Reduced from 5000ms to 3000ms
        
        try {
            // Test with a simple read operation that should work with any Firebase project
            db.collection('_connection_test').limit(1).get()
                .then(() => {
                    clearTimeout(timeout);
                    resolve();
                })
                .catch((error) => {
                    clearTimeout(timeout);
                    // Common Firebase errors that indicate we should fall back to localStorage
                    if (error.code === 'permission-denied' || 
                        error.code === 'unauthenticated' || 
                        error.code === 'unavailable' ||
                        error.message.includes('project does not exist') ||
                        error.message.includes('Invalid project')) {
                        console.log('Firebase project not accessible, using localStorage fallback');
                        reject(new Error('Firebase project not accessible'));
                    } else {
                        reject(error);
                    }
                });
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    });
}

// Initialize localStorage as fallback
function initializeLocalStorage() {
    console.log('Initializing localStorage fallback...');
    
    // Ensure localStorage collections exist
    if (!localStorage.getItem('businesses')) {
        localStorage.setItem('businesses', JSON.stringify({}));
    }
    if (!localStorage.getItem('staff')) {
        localStorage.setItem('staff', JSON.stringify({}));
    }
    if (!localStorage.getItem('properties')) {
        localStorage.setItem('properties', JSON.stringify({}));
    }
    
    console.log('localStorage fallback initialized successfully');
}

// Export Firebase services to window object for global access
const firebaseServices = {
    initialize: initializeFirebase,
    getApp: () => app,
    getAuth: () => auth,
    getDb: () => db,
    getStorage: () => storage,
    isConnected: () => isFirebaseConnected,
    isUsingFirebase: () => useFirebase,
    
    // Database operations that work with both Firebase and localStorage
    db: {
        collection: (collectionName) => ({
            doc: (docId) => ({
                set: async (data) => {
                    if (useFirebase && isFirebaseConnected) {
                        return await db.collection(collectionName).doc(docId).set(data);
                    } else {
                        // localStorage fallback
                        const collection = JSON.parse(localStorage.getItem(collectionName) || '{}');
                        collection[docId] = data;
                        localStorage.setItem(collectionName, JSON.stringify(collection));
                        return Promise.resolve();
                    }
                },
                get: async () => {
                    if (useFirebase && isFirebaseConnected) {
                        return await db.collection(collectionName).doc(docId).get();
                    } else {
                        // localStorage fallback
                        const collection = JSON.parse(localStorage.getItem(collectionName) || '{}');
                        return Promise.resolve({
                            exists: collection[docId] !== undefined,
                            data: () => collection[docId],
                            id: docId
                        });
                    }
                },
                update: async (data) => {
                    if (useFirebase && isFirebaseConnected) {
                        return await db.collection(collectionName).doc(docId).update(data);
                    } else {
                        // localStorage fallback
                        const collection = JSON.parse(localStorage.getItem(collectionName) || '{}');
                        if (collection[docId]) {
                            collection[docId] = { ...collection[docId], ...data };
                            localStorage.setItem(collectionName, JSON.stringify(collection));
                        }
                        return Promise.resolve();
                    }
                },
                delete: async () => {
                    if (useFirebase && isFirebaseConnected) {
                        return await db.collection(collectionName).doc(docId).delete();
                    } else {
                        // localStorage fallback
                        const collection = JSON.parse(localStorage.getItem(collectionName) || '{}');
                        delete collection[docId];
                        localStorage.setItem(collectionName, JSON.stringify(collection));
                        return Promise.resolve();
                    }
                }
            }),
            get: async () => {
                if (useFirebase && isFirebaseConnected) {
                    return await db.collection(collectionName).get();
                } else {
                    // localStorage fallback
                    const collection = JSON.parse(localStorage.getItem(collectionName) || '{}');
                    const docs = Object.keys(collection).map(id => ({
                        id: id,
                        data: () => collection[id],
                        exists: true
                    }));
                    return Promise.resolve({
                        docs: docs,
                        forEach: (callback) => docs.forEach(callback),
                        empty: docs.length === 0
                    });
                }
            },
            where: (field, operator, value) => ({
                get: async () => {
                    if (useFirebase && isFirebaseConnected) {
                        return await db.collection(collectionName).where(field, operator, value).get();
                    } else {
                        // localStorage fallback with basic filtering
                        const collection = JSON.parse(localStorage.getItem(collectionName) || '{}');
                        const docs = Object.keys(collection)
                            .filter(id => {
                                const doc = collection[id];
                                if (operator === '==') return doc[field] === value;
                                if (operator === '!=') return doc[field] !== value;
                                if (operator === '>') return doc[field] > value;
                                if (operator === '<') return doc[field] < value;
                                if (operator === '>=') return doc[field] >= value;
                                if (operator === '<=') return doc[field] <= value;
                                return false;
                            })
                            .map(id => ({
                                id: id,
                                data: () => collection[id],
                                exists: true
                            }));
                        return Promise.resolve({
                            docs: docs,
                            forEach: (callback) => docs.forEach(callback),
                            empty: docs.length === 0
                        });
                    }
                }
            })
        })
    }
};

// Make firebaseServices available globally
window.firebaseServices = firebaseServices;

// Auto-initialize Firebase when script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebase().then(() => {
        console.log('Firebase services ready');
    }).catch(error => {
        console.error('Failed to initialize Firebase:', error);
    });
});

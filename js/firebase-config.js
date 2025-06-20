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
let firebaseDisabled = false; // New flag to completely disable Firebase

let app = null;
let auth = null;
let db = null;
let storage = null;

function initializeFirebase() {
    try {
        console.log('Attempting to initialize Firebase...');
        
        // First, test if Firebase credentials are valid without full initialization
        return validateFirebaseCredentials()
            .then(() => {
                console.log('Firebase credentials validated, proceeding with full initialization...');
                
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
                        return testFirebaseConnection();
                    });
            })
            .then(() => {
                console.log('Firebase connection test successful');
                isFirebaseConnected = true;
                useFirebase = true;
                console.log('Firebase initialized successfully');
            })
            .catch((error) => {
                console.warn('Firebase validation/connection failed, completely disabling Firebase and using localStorage:', error);
                firebaseDisabled = true;
                isFirebaseConnected = false;
                useFirebase = false;
                
                // Completely disable Firebase to prevent background requests
                disableFirebase();
                initializeLocalStorage();
            });
    } catch (error) {
        console.warn('Error during Firebase initialization, completely disabling Firebase and using localStorage:', error);
        firebaseDisabled = true;
        isFirebaseConnected = false;
        useFirebase = false;
        disableFirebase();
        initializeLocalStorage();
    }
}

// Validate Firebase credentials before full initialization
function validateFirebaseCredentials() {
    return new Promise((resolve, reject) => {
        // Immediately reject for placeholder credentials to skip Firebase entirely
        if (firebaseConfig.apiKey === "AIzaSyCvJ1tZXJqXz0Vb8K8VY_m3QRxPd2k-D8U" || 
            firebaseConfig.projectId === "zentry-pos") {
            console.log('Detected placeholder Firebase credentials - skipping Firebase initialization');
            reject(new Error('Placeholder Firebase credentials detected'));
            return;
        }
        
        // Create a simple test request to validate real credentials
        const testUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Firebase validation timeout'));
        }, 2000);
        
        fetch(testUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${firebaseConfig.apiKey}`
            }
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (response.status === 200 || response.status === 403) {
                // 200 = success, 403 = valid project but no permission (acceptable)
                resolve();
            } else if (response.status === 400 || response.status === 404) {
                // 400 = bad request (invalid project), 404 = project not found
                reject(new Error(`Invalid Firebase project (${response.status})`));
            } else {
                reject(new Error(`Firebase validation failed (${response.status})`));
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            reject(new Error(`Firebase validation network error: ${error.message}`));
        });
    });
}

// Completely disable Firebase to prevent background requests
function disableFirebase() {
    try {
        console.log('Disabling Firebase to prevent background requests...');
        
        // Clear any existing Firebase app
        if (app) {
            app.delete().catch(err => console.warn('Error deleting Firebase app:', err));
            app = null;
        }
        
        // Clear Firebase services
        auth = null;
        db = null;
        storage = null;
        
        // Override Firebase functions to prevent new connections
        if (typeof firebase !== 'undefined') {
            // Disable app initialization
            const originalInitializeApp = firebase.initializeApp;
            firebase.initializeApp = () => {
                console.warn('Firebase initialization blocked - using localStorage mode');
                return null;
            };
            
            // Disable firestore
            if (firebase.firestore) {
                firebase.firestore = () => {
                    console.warn('Firebase Firestore access blocked - using localStorage mode');
                    return null;
                };
            }
            
            // Disable auth
            if (firebase.auth) {
                firebase.auth = () => {
                    console.warn('Firebase Auth access blocked - using localStorage mode');
                    return null;
                };
            }
            
            // Disable storage
            if (firebase.storage) {
                firebase.storage = () => {
                    console.warn('Firebase Storage access blocked - using localStorage mode');
                    return null;
                };
            }
        }
        
        console.log('Firebase completely disabled - all operations will use localStorage');
    } catch (error) {
        console.warn('Error during Firebase disable:', error);
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
    getApp: () => firebaseDisabled ? null : app,
    getAuth: () => firebaseDisabled ? null : auth,
    getDb: () => firebaseDisabled ? null : db,
    getStorage: () => firebaseDisabled ? null : storage,
    isConnected: () => isFirebaseConnected && !firebaseDisabled,
    isUsingFirebase: () => useFirebase && !firebaseDisabled,
    isDisabled: () => firebaseDisabled,
    
    // Database operations that work with both Firebase and localStorage
    db: {
        collection: (collectionName) => ({
            doc: (docId) => ({
                set: async (data) => {
                    if (useFirebase && isFirebaseConnected && !firebaseDisabled) {
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
                    if (useFirebase && isFirebaseConnected && !firebaseDisabled) {
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
                    if (useFirebase && isFirebaseConnected && !firebaseDisabled) {
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
                    if (useFirebase && isFirebaseConnected && !firebaseDisabled) {
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
                if (useFirebase && isFirebaseConnected && !firebaseDisabled) {
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
                    if (useFirebase && isFirebaseConnected && !firebaseDisabled) {
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

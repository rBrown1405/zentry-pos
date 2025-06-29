// Firebase Services Wrapper
class FirebaseServices {
    constructor() {
        this.initialized = false;
        this.app = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            console.log('🔥 Initializing Firebase Services...');
            
            // Wait for Firebase SDK and app to be available
            await this.waitForFirebaseSDK();
            await this.waitForFirebaseApp();
            
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }

            // Get the default app instance
            this.app = firebase.app();
            
            // Initialize services
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            try {
                this.storage = firebase.storage();
            } catch (storageError) {
                console.warn('⚠️ Firebase Storage not available:', storageError.message);
                this.storage = null;
            }

            // Enable offline persistence for Firestore
            try {
                await this.db.enablePersistence({ synchronizeTabs: true });
                console.log('✅ Firestore offline persistence enabled');
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ The current browser does not support all of the features required to enable persistence');
                } else {
                    console.warn('⚠️ Persistence error:', err);
                }
            }

            this.initialized = true;
            console.log('✅ Firebase Services initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Services:', error);
            throw error;
        }
    }

    async waitForFirebaseSDK(maxWait = 20000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && firebase.app && typeof firebase.auth === 'function' && typeof firebase.firestore === 'function') {
                    console.log('✅ Firebase SDK detected with all required services');
                    resolve();
                    return;
                }
                
                if (Date.now() - startTime > maxWait) {
                    console.error('❌ Firebase SDK timeout. Available:', {
                        firebase: typeof firebase !== 'undefined',
                        app: typeof firebase !== 'undefined' ? !!firebase.app : false,
                        auth: typeof firebase !== 'undefined' ? typeof firebase.auth : 'undefined',
                        firestore: typeof firebase !== 'undefined' ? typeof firebase.firestore : 'undefined'
                    });
                    reject(new Error('Firebase SDK not loaded within timeout'));
                    return;
                }
                
                setTimeout(checkFirebase, 100);
            };
            
            checkFirebase();
        });
    }

    async waitForFirebaseApp(maxWait = 20000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkFirebaseApp = () => {
                try {
                    if (typeof firebase !== 'undefined' && firebase.app && firebase.apps && firebase.apps.length > 0) {
                        // Try to get the app to make sure it's properly initialized
                        const app = firebase.app();
                        if (app && app.options) {
                            console.log('✅ Firebase app detected and validated');
                            resolve();
                            return;
                        }
                    }
                } catch (error) {
                    console.log('⏳ Firebase app not ready yet:', error.message);
                }
                
                if (Date.now() - startTime > maxWait) {
                    console.error('❌ Firebase app timeout. Status:', {
                        firebase: typeof firebase !== 'undefined',
                        app: typeof firebase !== 'undefined' ? !!firebase.app : false,
                        apps: typeof firebase !== 'undefined' && firebase.apps ? firebase.apps.length : 0
                    });
                    reject(new Error('Firebase app not initialized within timeout'));
                    return;
                }
                
                setTimeout(checkFirebaseApp, 100);
            };
            
            checkFirebaseApp();
        });
    }

    async waitForInitialization(maxWait = 25000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkInitialized = () => {
                if (this.initialized) {
                    resolve();
                    return;
                }
                
                if (Date.now() - startTime > maxWait) {
                    console.error('❌ Firebase Services initialization timeout after', maxWait, 'ms');
                    reject(new Error('Firebase Services initialization timeout'));
                    return;
                }
                
                setTimeout(checkInitialized, 100);
            };
            
            checkInitialized();
        });
    }

    getApp() {
        if (!this.initialized) {
            throw new Error('Firebase Services not initialized');
        }
        return this.app;
    }

    getAuth() {
        if (!this.initialized) {
            throw new Error('Firebase Services not initialized');
        }
        return this.auth;
    }

    getDb() {
        if (!this.initialized) {
            throw new Error('Firebase Services not initialized');
        }
        return this.db;
    }

    getStorage() {
        if (!this.initialized) {
            throw new Error('Firebase Services not initialized');
        }
        return this.storage;
    }

    isInitialized() {
        return this.initialized;
    }
}

// Create global instance
window.firebaseServices = new FirebaseServices();

// Auto-initialize when DOM is ready, with retry logic
document.addEventListener('DOMContentLoaded', async () => {
    // Add a longer delay to ensure Firebase SDK scripts have loaded
    setTimeout(async () => {
        try {
            await window.firebaseServices.initialize();
            console.log('🎉 Firebase Services auto-initialized');
        } catch (error) {
            console.error('❌ Failed to auto-initialize Firebase Services:', error);
            
            // Retry twice with increasing delays
            setTimeout(async () => {
                try {
                    console.log('🔄 Retrying Firebase Services initialization (attempt 1)...');
                    await window.firebaseServices.initialize();
                    console.log('🎉 Firebase Services initialized on retry 1');
                } catch (retryError) {
                    console.error('❌ Firebase Services initialization failed on retry 1:', retryError);
                    
                    // Final retry
                    setTimeout(async () => {
                        try {
                            console.log('🔄 Final retry of Firebase Services initialization (attempt 2)...');
                            await window.firebaseServices.initialize();
                            console.log('🎉 Firebase Services initialized on final retry');
                        } catch (finalError) {
                            console.error('❌ Firebase Services initialization failed completely:', finalError);
                        }
                    }, 5000);
                }
            }, 3000);
        }
    }, 2000);
});

// Firebase Services Wrapper
class FirebaseServices {
    constructor() {
        this.initialized = false;
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
            
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }

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

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.firebaseServices.initialize();
        console.log('🎉 Firebase Services auto-initialized');
    } catch (error) {
        console.error('❌ Failed to auto-initialize Firebase Services:', error);
    }
});

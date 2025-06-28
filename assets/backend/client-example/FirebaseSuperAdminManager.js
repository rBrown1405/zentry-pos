/**
 * Firebase SuperAdminManager class for handling super admin operations
 * This class uses Firebase Auth and Firestore for authentication and data management
 */
class FirebaseSuperAdminManager {
    constructor() {
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.initializeFirebase();
    }

    /**
     * Initialize Firebase services
     */
    initializeFirebase() {
        try {
            // Firebase configuration for zentry-pos-2dc89 project
            const firebaseConfig = {
                apiKey: "AIzaSyBLDZV5wXtWzrCcs8GknPyH_OxB_9uhjzg",
                authDomain: "zentry-pos-2dc89.firebaseapp.com",
                projectId: "zentry-pos-2dc89",
                storageBucket: "zentry-pos-2dc89.firebasestorage.app",
                messagingSenderId: "215458190528",
                appId: "1:215458190528:web:61365cce55690e8983c925",
                measurementId: "G-QEYMJQE480"
            };

            console.log('🔥 Initializing Firebase with API key:', firebaseConfig.apiKey);

            // Clear any existing Firebase apps to prevent conflicts
            if (firebase.apps.length > 0) {
                console.log('🔄 Clearing existing Firebase apps');
                firebase.apps.forEach(app => {
                    if (app) app.delete();
                });
            }

            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');

            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // Listen for auth state changes
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                console.log('Auth state changed:', user ? user.email : 'Not authenticated');
            });

        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    /**
     * Login a user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - User data
     */
    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            
            // Sign in with Firebase Auth
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Firebase auth successful for:', user.email);
            
            // Get user document from Firestore
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                throw new Error('User profile not found in database');
            }
            
            const userData = userDoc.data();
            console.log('User data from Firestore:', userData);
            
            // Check if user has super admin role
            if (userData.role !== 'super_admin') {
                await this.auth.signOut();
                throw new Error('Access denied. Super admin privileges required.');
            }
            
            // Store user info in localStorage for session management
            const userInfo = {
                uid: user.uid,
                email: user.email,
                username: userData.username,
                displayName: userData.displayName,
                role: userData.role,
                accessLevel: userData.accessLevel,
                loginTime: Date.now()
            };
            
            localStorage.setItem('firebase_super_admin', JSON.stringify(userInfo));
            
            console.log('Super admin login successful:', userInfo);
            return userInfo;
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout the current user
     */
    async logout() {
        try {
            await this.auth.signOut();
            localStorage.removeItem('firebase_super_admin');
            this.currentUser = null;
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Check if user is authenticated and has super admin privileges
     * @returns {boolean} - True if authenticated as super admin
     */
    isAuthenticated() {
        try {
            // Check Firebase auth state
            if (this.auth && this.auth.currentUser) {
                const storedUser = localStorage.getItem('firebase_super_admin');
                if (storedUser) {
                    const userInfo = JSON.parse(storedUser);
                    return userInfo.role === 'super_admin';
                }
            }
            
            // Also check localStorage for session
            const storedUser = localStorage.getItem('firebase_super_admin');
            if (storedUser) {
                const userInfo = JSON.parse(storedUser);
                // Check if session is not too old (24 hours)
                const sessionAge = Date.now() - userInfo.loginTime;
                const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (sessionAge < maxSessionAge && userInfo.role === 'super_admin') {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    /**
     * Get the current user profile
     * @returns {Promise<Object>} - User profile data
     */
    async getUserProfile() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            const storedUser = localStorage.getItem('firebase_super_admin');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
            
            // If not in localStorage, get from Firebase
            if (this.auth.currentUser) {
                const userDoc = await this.db.collection('users').doc(this.auth.currentUser.uid).get();
                if (userDoc.exists) {
                    return userDoc.data();
                }
            }
            
            throw new Error('User profile not found');
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    /**
     * Get all businesses from localStorage (fallback) or Firestore
     * @returns {Promise<Array>} - List of businesses
     */
    async getBusinesses() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }

            // First try to get from Firestore
            try {
                const businessesSnapshot = await this.db.collection('businesses').get();
                const businesses = [];
                businessesSnapshot.forEach(doc => {
                    businesses.push({ id: doc.id, ...doc.data() });
                });
                
                console.log('Loaded businesses from Firestore:', businesses.length);
                return businesses;
            } catch (firestoreError) {
                console.warn('Firestore query failed, using localStorage fallback:', firestoreError);
                
                // Fallback to localStorage
                const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
                console.log('Loaded businesses from localStorage:', businesses.length);
                return businesses;
            }
        } catch (error) {
            console.error('Error getting businesses:', error);
            throw error;
        }
    }

    /**
     * Get all properties from localStorage (fallback) or Firestore
     * @returns {Promise<Array>} - List of properties
     */
    async getProperties() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }

            // First try to get from Firestore
            try {
                const propertiesSnapshot = await this.db.collection('properties').get();
                const properties = [];
                propertiesSnapshot.forEach(doc => {
                    properties.push({ id: doc.id, ...doc.data() });
                });
                
                console.log('Loaded properties from Firestore:', properties.length);
                return properties;
            } catch (firestoreError) {
                console.warn('Firestore query failed, using localStorage fallback:', firestoreError);
                
                // Fallback to localStorage
                const properties = JSON.parse(localStorage.getItem('properties') || '[]');
                console.log('Loaded properties from localStorage:', properties.length);
                return properties;
            }
        } catch (error) {
            console.error('Error getting properties:', error);
            throw error;
        }
    }

    /**
     * Delete a business
     * @param {string} businessId - Business ID to delete
     * @returns {Promise<void>}
     */
    async deleteBusiness(businessId) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }

            // Try to delete from Firestore first
            try {
                await this.db.collection('businesses').doc(businessId).delete();
                console.log('Business deleted from Firestore:', businessId);
            } catch (firestoreError) {
                console.warn('Firestore delete failed, updating localStorage:', firestoreError);
                
                // Fallback: remove from localStorage
                const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
                const updatedBusinesses = businesses.filter(b => b.id !== businessId && b._id !== businessId);
                localStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
                console.log('Business removed from localStorage:', businessId);
            }
        } catch (error) {
            console.error('Error deleting business:', error);
            throw error;
        }
    }

    /**
     * Check Firebase connection status
     * @returns {Promise<boolean>} - True if connected
     */
    async checkFirebaseConnection() {
        try {
            // Try to read from Firestore
            await this.db.collection('users').limit(1).get();
            return true;
        } catch (error) {
            console.error('Firebase connection check failed:', error);
            return false;
        }
    }
}

export default FirebaseSuperAdminManager;

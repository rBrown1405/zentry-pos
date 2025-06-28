// Super Admin System for POS
// This creates and manages super admin accounts with global access using Firebase

class SuperAdminManager {
    static SUPER_ADMIN_EMAIL = 'admin@macrospos.com';
    static SUPER_ADMIN_PASSWORD = 'Armoured@2025!';
    
    // In-memory storage for super admin state (never stored in localStorage)
    static currentSuperAdmin = null;
    static superAdminPOSAccess = false;
    static currentBusinessContext = null;
    
    static async initializeFirebaseAuth() {
        // Wait for Firebase services to be available
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                // Check if Firebase services are available
                if (window.firebaseServices && window.firebaseServices.getAuth && window.firebaseServices.getDb) {
                    const auth = window.firebaseServices.getAuth();
                    if (auth) {
                        resolve(auth);
                        return;
                    }
                }
                
                // If Firebase provider is available, check that
                if (window.firebaseProvider && window.firebaseProvider.isReady && window.firebaseProvider.isReady()) {
                    const auth = window.firebaseProvider.getAuth();
                    if (auth) {
                        resolve(auth);
                        return;
                    }
                }
                
                reject(new Error('Firebase services not available'));
            };
            
            // Try immediately
            try {
                checkFirebase();
            } catch (error) {
                // If immediate check fails, wait for Firebase ready events
                let timeoutId = setTimeout(() => {
                    reject(new Error('Firebase services not available after timeout'));
                }, 5000);
                
                const onFirebaseReady = () => {
                    clearTimeout(timeoutId);
                    try {
                        checkFirebase();
                    } catch (error) {
                        reject(error);
                    }
                };
                
                // Listen for Firebase ready events
                window.addEventListener('firebaseServicesReady', onFirebaseReady, { once: true });
                window.addEventListener('firebaseProviderReady', onFirebaseReady, { once: true });
                window.addEventListener('firebaseManagerReady', onFirebaseReady, { once: true });
            }
        });
    }
    
    static async ensureSuperAdminExists() {
        try {
            const auth = await this.initializeFirebaseAuth();
            const db = window.firebaseServices?.getDb() || window.firebaseProvider?.getDb();
            
            if (!db) {
                throw new Error('Firestore not available');
            }
            
            // Check if super admin user exists in Firestore
            const superAdminQuery = await db.collection('users')
                .where('email', '==', this.SUPER_ADMIN_EMAIL)
                .where('role', '==', 'super_admin')
                .get();
            
            if (superAdminQuery.empty) {
                console.log('Creating super admin account...');
                // Note: In production, super admin account should be created server-side
                // This is for development/demo purposes only
                await this.createSuperAdminAccount();
            }
        } catch (error) {
            console.log('Super admin initialization skipped:', error.message);
            // Don't throw error - allow system to continue without super admin
        }
    }
    
    static async createSuperAdminAccount() {
        // This should be done server-side in production
        console.warn('Super admin account creation should be handled server-side in production');
        return null;
    }
    
    static async validateSuperAdmin(email, password) {
        try {
            const auth = await this.initializeFirebaseAuth();
            
            // Attempt to sign in with Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Get user custom claims to check role
            const idTokenResult = await user.getIdTokenResult();
            
            if (idTokenResult.claims.role === 'super_admin') {
                return true;
            } else {
                // Sign out if not super admin
                await auth.signOut();
                return false;
            }
        } catch (error) {
            console.error('Super admin validation failed:', error);
            return false;
        }
    }
    
    static async loginSuperAdmin(email, password) {
        try {
            if (await this.validateSuperAdmin(email, password)) {
                const auth = await this.initializeFirebaseAuth();
                const user = auth.currentUser;
                const idTokenResult = await user.getIdTokenResult();
                
                // Store super admin state in memory only
                this.currentSuperAdmin = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || 'Super Administrator',
                    role: 'super_admin',
                    accessLevel: 'global',
                    permissions: ['all'],
                    lastLogin: new Date().toISOString()
                };
                
                console.log('Super admin logged in successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Super admin login failed:', error);
            return false;
        }
    }
    
    
    static async getAllBusinesses() {
        try {
            const db = window.firebaseServices.getDb();
            const businessesSnapshot = await db.collection('businesses').get();
            
            return businessesSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
        } catch (error) {
            console.error('Error fetching businesses:', error);
            return [];
        }
    }
    
    static async getAllStaff() {
        try {
            const db = window.firebaseServices.getDb();
            const usersSnapshot = await db.collection('users')
                .where('role', 'in', ['employee', 'manager', 'admin', 'owner'])
                .get();
            
            return usersSnapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            }));
        } catch (error) {
            console.error('Error fetching staff:', error);
            return [];
        }
    }
    
    static async getSystemStats() {
        try {
            const businesses = await this.getAllBusinesses();
            const staff = await this.getAllStaff();
            
            return {
                totalBusinesses: businesses.length,
                totalStaff: staff.length,
                activeBusinesses: businesses.filter(b => b.status !== 'inactive').length,
                activeStaff: staff.filter(s => s.status === 'active').length,
                businessTypes: this.getBusinessTypeStats(businesses),
                roleDistribution: this.getRoleDistribution(staff)
            };
        } catch (error) {
            console.error('Error getting system stats:', error);
            return {
                totalBusinesses: 0,
                totalStaff: 0,
                activeBusinesses: 0,
                activeStaff: 0,
                businessTypes: {},
                roleDistribution: {}
            };
        }
    }
    
    static getBusinessTypeStats(businesses) {
        const types = {};
        businesses.forEach(business => {
            const type = business.businessType || 'unknown';
            types[type] = (types[type] || 0) + 1;
        });
        return types;
    }
    
    static getRoleDistribution(staff) {
        const roles = {};
        staff.forEach(member => {
            const role = member.role || 'unknown';
            roles[role] = (roles[role] || 0) + 1;
        });
        return roles;
    }
    
    static switchToBusiness(businessId) {
        // Store business context in memory only (never localStorage)
        if (businessId === 'global') {
            this.currentBusinessContext = {
                businessID: 'SUPER_ADMIN_GLOBAL',
                companyName: 'Super Admin Global Access',
                businessType: 'super_admin'
            };
            this.superAdminPOSAccess = true;
            return true;
        } else {
            // In a real implementation, validate businessId against Firebase
            this.currentBusinessContext = {
                businessID: businessId,
                // Additional business data would be fetched from Firebase
            };
            this.superAdminPOSAccess = true;
            return true;
        }
    }
    
    static clearBusinessContext() {
        this.currentBusinessContext = null;
        this.superAdminPOSAccess = false;
    }
    
    static isSuperAdmin() {
        return this.currentSuperAdmin && this.currentSuperAdmin.role === 'super_admin';
    }
    
    static getCurrentSuperAdmin() {
        return this.currentSuperAdmin;
    }
    
    static hasPOSAccess() {
        return this.superAdminPOSAccess;
    }
    
    static getCurrentBusinessContext() {
        return this.currentBusinessContext;
    }
    
    static async logout() {
        try {
            const auth = await this.initializeFirebaseAuth();
            await auth.signOut();
            
            // Clear in-memory state
            this.currentSuperAdmin = null;
            this.superAdminPOSAccess = false;
            this.currentBusinessContext = null;
            
            console.log('Super admin logged out successfully');
        } catch (error) {
            console.error('Super admin logout failed:', error);
        }
    }
}

// Auto-initialize when module loads, but wait for Firebase to be ready
if (typeof window !== 'undefined') {
    // Make available globally immediately
    window.SuperAdminManager = SuperAdminManager;
    
    // Initialize super admin system when Firebase is ready
    const initializeSuperAdmin = () => {
        SuperAdminManager.ensureSuperAdminExists().then(() => {
            console.log('🔑 Super Admin system initialized with Firebase!');
            console.log('Email: admin@macrospos.com');
            console.log('⚠️ Super admin credentials should be configured server-side in production!');
        }).catch(error => {
            console.log('Super admin initialization skipped:', error.message);
        });
    };
    
    // Try immediate initialization
    if (window.firebaseServices || window.firebaseProvider) {
        initializeSuperAdmin();
    } else {
        // Wait for Firebase to be ready
        const onFirebaseReady = () => {
            initializeSuperAdmin();
        };
        
        // Listen for Firebase ready events
        window.addEventListener('firebaseServicesReady', onFirebaseReady, { once: true });
        window.addEventListener('firebaseProviderReady', onFirebaseReady, { once: true });
        window.addEventListener('firebaseManagerReady', onFirebaseReady, { once: true });
        
        // Fallback timeout
        setTimeout(() => {
            if (!window.firebaseServices && !window.firebaseProvider) {
                console.log('Super admin initialization skipped - Firebase not available');
            }
        }, 5000);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SuperAdminManager };
}

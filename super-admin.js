// Super Admin System for POS
// This creates and manages super admin accounts with global access using Firebase

class SuperAdminManager {
    // Multiple super admin accounts
    static SUPER_ADMIN_ACCOUNTS = [
        {
            email: 'admin@macrospos.com',
            password: 'Armoured@2025!',
            username: 'admin',
            displayName: 'Super Administrator'
        },
        {
            email: 'rbrown14@macrospos.com',
            password: 'Armoured@',
            username: 'rBrown14',
            displayName: 'R. Brown (Super Admin)'
        }
    ];
    
    // For backward compatibility
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
            
            // Check if any super admin users exist in Firestore
            const superAdminQuery = await db.collection('users')
                .where('role', '==', 'super_admin')
                .get();
            
            if (superAdminQuery.empty) {
                console.log('Creating super admin accounts...');
                // Note: In production, super admin accounts should be created server-side
                // This is for development/demo purposes only
                await this.createSuperAdminAccounts();
            } else {
                console.log(`Found ${superAdminQuery.size} super admin account(s) in Firestore`);
            }
        } catch (error) {
            console.log('Super admin initialization skipped:', error.message);
            // Don't throw error - allow system to continue without super admin
        }
    }
    
    static async createSuperAdminAccounts() {
        // This should be done server-side in production
        console.warn('Super admin account creation should be handled server-side in production');
        
        // For development, we'll create the accounts in Firestore if available
        try {
            const db = window.firebaseServices?.getDb() || window.firebaseProvider?.getDb();
            if (db) {
                for (const account of this.SUPER_ADMIN_ACCOUNTS) {
                    const superAdminData = {
                        email: account.email,
                        username: account.username,
                        displayName: account.displayName,
                        role: 'super_admin',
                        accessLevel: 'global',
                        permissions: ['all'],
                        createdAt: new Date().toISOString(),
                        isActive: true,
                        lastLogin: null
                    };
                    
                    await db.collection('users').doc(account.username).set(superAdminData);
                    console.log(`Created super admin account: ${account.username}`);
                }
            }
        } catch (error) {
            console.error('Failed to create super admin accounts in Firestore:', error);
        }
        
        return null;
    }
    
    static async validateSuperAdmin(email, password) {
        try {
            console.log(`Attempting super admin validation for: ${email}`);
            
            const auth = await this.initializeFirebaseAuth();
            
            // Attempt to sign in with Firebase Auth first
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                console.log('Firebase authentication successful, checking Firestore role...');
                
                // Check Firestore for super admin role
                const db = window.firebaseServices.getDb();
                
                // Try to find user by username (extracted from email)
                let username = email.split('@')[0];
                if (username === 'rbrown14') {
                    username = 'rBrown14'; // Handle specific case
                }
                
                let userDoc = await db.collection('users').doc(username).get();
                
                // If not found by username, try by UID
                if (!userDoc.exists) {
                    userDoc = await db.collection('users').doc(user.uid).get();
                }
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log('Found user document, role:', userData.role);
                    
                    if (userData.role === 'super_admin') {
                        console.log('✅ Valid super admin confirmed from Firestore');
                        return true;
                    } else {
                        console.log('❌ User exists but is not super admin:', userData.role);
                        await auth.signOut();
                        return false;
                    }
                } else {
                    console.log('❌ User document not found in Firestore');
                    
                    // Fallback: check if email/password matches hardcoded accounts
                    const adminAccount = this.SUPER_ADMIN_ACCOUNTS.find(account => 
                        account.email === email && account.password === password
                    );
                    
                    if (adminAccount) {
                        console.log('✅ Valid hardcoded super admin account');
                        return true;
                    } else {
                        console.log('❌ Not found in hardcoded accounts either');
                        await auth.signOut();
                        return false;
                    }
                }
                
            } catch (firebaseError) {
                console.warn('Firebase auth failed:', firebaseError.message);
                
                // Fallback to hardcoded accounts if Firebase fails
                const adminAccount = this.SUPER_ADMIN_ACCOUNTS.find(account => 
                    account.email === email && account.password === password
                );
                
                if (adminAccount) {
                    console.log('✅ Valid hardcoded super admin account (Firebase fallback)');
                    return true;
                } else {
                    console.log('❌ Invalid credentials for both Firebase and hardcoded accounts');
                    return false;
                }
            }
        } catch (error) {
            console.error('Super admin validation failed:', error);
            return false;
        }
    }
    
    static async loginSuperAdmin(email, password) {
        try {
            if (await this.validateSuperAdmin(email, password)) {
                console.log('Super admin validation successful, setting up session...');
                
                // Try to find admin account details from hardcoded accounts first
                let adminAccount = this.SUPER_ADMIN_ACCOUNTS.find(account => 
                    account.email === email && account.password === password
                );
                
                // If not found in hardcoded accounts, get from Firebase
                if (!adminAccount) {
                    console.log('Not a hardcoded account, fetching from Firebase...');
                    
                    try {
                        const auth = window.firebaseServices.getAuth();
                        const db = window.firebaseServices.getDb();
                        
                        // Get current user from Firebase Auth
                        const user = auth.currentUser;
                        if (user) {
                            // Try to get user document from Firestore
                            let username = email.split('@')[0];
                            if (username === 'rbrown14') {
                                username = 'rBrown14'; // Handle specific case
                            }
                            
                            let userDoc = await db.collection('users').doc(username).get();
                            
                            // If not found by username, try by UID
                            if (!userDoc.exists) {
                                userDoc = await db.collection('users').doc(user.uid).get();
                            }
                            
                            if (userDoc.exists) {
                                const userData = userDoc.data();
                                adminAccount = {
                                    email: userData.email,
                                    username: userData.username,
                                    displayName: userData.displayName,
                                    uid: userData.uid || user.uid
                                };
                                console.log('Retrieved admin account from Firebase:', adminAccount.displayName);
                            }
                        }
                    } catch (firebaseError) {
                        console.warn('Error fetching from Firebase, using fallback data:', firebaseError.message);
                    }
                }
                
                // Fallback if still no account found
                if (!adminAccount) {
                    console.log('Using fallback admin account data');
                    adminAccount = {
                        email: email,
                        username: email.split('@')[0],
                        displayName: 'Super Administrator'
                    };
                }
                
                // Store super admin state in memory only
                this.currentSuperAdmin = {
                    uid: adminAccount.uid || adminAccount.username || email.split('@')[0],
                    email: adminAccount.email,
                    username: adminAccount.username,
                    displayName: adminAccount.displayName || 'Super Administrator',
                    role: 'super_admin',
                    accessLevel: 'global',
                    permissions: ['all'],
                    lastLogin: new Date().toISOString(),
                    isCustomAccount: !this.SUPER_ADMIN_ACCOUNTS.find(account => account.email === email)
                };
                
                console.log(`✅ Super admin ${adminAccount.displayName} logged in successfully`);
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
        // Check in-memory state first
        if (this.currentSuperAdmin && this.currentSuperAdmin.role === 'super_admin') {
            return true;
        }
        
        // Check Firebase auth state for persistent login
        try {
            const auth = window.firebaseServices?.getAuth() || window.firebaseProvider?.getAuth();
            if (auth && auth.currentUser) {
                // Check if user has super admin custom claims (production)
                // For development, check against our known super admin accounts
                const userEmail = auth.currentUser.email;
                const isKnownSuperAdmin = this.SUPER_ADMIN_ACCOUNTS.some(account => 
                    account.email === userEmail
                );
                
                if (isKnownSuperAdmin) {
                    // Re-populate in-memory state from Firebase user
                    const adminAccount = this.SUPER_ADMIN_ACCOUNTS.find(account => 
                        account.email === userEmail
                    );
                    
                    this.currentSuperAdmin = {
                        uid: auth.currentUser.uid,
                        email: adminAccount.email,
                        username: adminAccount.username,
                        displayName: adminAccount.displayName || 'Super Administrator',
                        role: 'super_admin',
                        accessLevel: 'global',
                        permissions: ['all'],
                        lastLogin: new Date().toISOString()
                    };
                    
                    return true;
                }
            }
        } catch (error) {
            console.log('Firebase auth check failed:', error.message);
        }
        
        return false;
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
            console.log('Available Super Admin Accounts:');
            SuperAdminManager.SUPER_ADMIN_ACCOUNTS.forEach(account => {
                console.log(`  - ${account.username} (${account.email})`);
            });
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

/**
 * Umbrella Account Management System for Zentry POS
 * Manages business entities, properties, and user permissions
 */
class UmbrellaAccountManager {
    constructor(firebaseManager) {
        this.firebaseManager = firebaseManager;
        this.db = window.firebaseServices.getDb();
        this.currentBusiness = null;
        this.currentProperty = null;
        this.availableBusinesses = []; // Track available businesses for the user
        this._initializeFromFirebase();
    }

    /**
     * Initialize current business and property from Firebase
     * @private
     */
    async _initializeFromFirebase() {
        const user = this.firebaseManager.getCurrentUser();
        if (user) {
            await this.loadUserBusinessAccess(user.uid);
        }
    }

    /**
     * Initialize the umbrella account system
     * @returns {Promise<void>}
     */
    async initialize() {
        // Initialize from Firebase
        await this._initializeFromFirebase();
        
        // Set up real-time listeners
        await this._initializeRealTimeListeners();
    }

    /**
     * Initialize real-time listeners for business and property changes
     * @private
     */
    async _initializeRealTimeListeners() {
        const user = this.firebaseManager.getCurrentUser();
        if (!user) return;

        // Listen for changes to user's current business/property selection
        this.userListener = this.db.collection('users').doc(user.uid)
            .onSnapshot(async (doc) => {
                if (!doc.exists) return;
                
                const userData = doc.data();
                
                // Handle business change
                if (userData.currentBusinessId && 
                    (!this.currentBusiness || this.currentBusiness.id !== userData.currentBusinessId)) {
                    const businessDoc = await this.db.collection('businesses')
                        .doc(userData.currentBusinessId).get();
                    if (businessDoc.exists) {
                        this.currentBusiness = {
                            id: businessDoc.id,
                            ...businessDoc.data()
                        };
                        // Trigger business change event
                        document.dispatchEvent(new CustomEvent('businessChanged', {
                            detail: { business: this.currentBusiness }
                        }));
                    }
                }
                
                // Handle property change
                if (userData.currentPropertyId &&
                    (!this.currentProperty || this.currentProperty.id !== userData.currentPropertyId)) {
                    const propertyDoc = await this.db.collection('properties')
                        .doc(userData.currentPropertyId).get();
                    if (propertyDoc.exists) {
                        this.currentProperty = {
                            id: propertyDoc.id,
                            ...propertyDoc.data()
                        };
                        // Trigger property change event
                        document.dispatchEvent(new CustomEvent('propertyChanged', {
                            detail: { property: this.currentProperty }
                        }));
                    }
                }
            });

        // Clean up listener when object is destroyed
        window.addEventListener('unload', () => {
            if (this.userListener) {
                this.userListener();
            }
        });
    }

    /**
     * Load user's business access based on their role
     * @param {string} userId - The user ID
     * @returns {Promise<void>}
     */
    async loadUserBusinessAccess(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const userRole = userData.role;

            // Handle different user roles
            if (userRole === 'superAdmin') {
                // Super admins can access all businesses
                await this._loadAllBusinesses();
            } else if (userRole === 'businessAdmin') {
                // Business admins can access their assigned businesses
                await this._loadAssignedBusinesses(userId);
            } else if (userRole === 'propertyManager') {
                // Property managers can access only their assigned property's business
                await this._loadPropertyBusinesses(userId);
            } else {
                // Regular users can only access their current business
                await this._loadCurrentBusiness(userId);
            }

            // Set current business and property if they exist in user data
            if (userData.currentBusinessId) {
                await this.setCurrentBusiness(userData.currentBusinessId);
            }
            if (userData.currentPropertyId) {
                await this.setCurrentProperty(userData.currentPropertyId);
            }
        } catch (error) {
            console.error('Error loading user business access:', error);
            throw error;
        }
    }

    /**
     * Load all businesses (for super admins)
     * @private
     */
    async _loadAllBusinesses() {
        const snapshot = await this.db.collection('businesses').get();
        this.availableBusinesses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Load assigned businesses (for business admins)
     * @private
     */
    async _loadAssignedBusinesses(userId) {
        const snapshot = await this.db.collection('businessAccess')
            .where('userId', '==', userId)
            .get();
            
        const businessIds = snapshot.docs.map(doc => doc.data().businessId);
        
        if (businessIds.length > 0) {
            const businessesSnapshot = await this.db.collection('businesses')
                .where(firebase.firestore.FieldPath.documentId(), 'in', businessIds)
                .get();
                
            this.availableBusinesses = businessesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            this.availableBusinesses = [];
        }
    }

    /**
     * Load property businesses (for property managers)
     * @private
     */
    async _loadPropertyBusinesses(userId) {
        const snapshot = await this.db.collection('propertyAccess')
            .where('userId', '==', userId)
            .get();
            
        const propertyIds = snapshot.docs.map(doc => doc.data().propertyId);
        
        if (propertyIds.length > 0) {
            const propertiesSnapshot = await this.db.collection('properties')
                .where(firebase.firestore.FieldPath.documentId(), 'in', propertyIds)
                .get();
                
            const businessIds = [...new Set(propertiesSnapshot.docs.map(doc => doc.data().businessId))];
            
            if (businessIds.length > 0) {
                const businessesSnapshot = await this.db.collection('businesses')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', businessIds)
                    .get();
                    
                this.availableBusinesses = businessesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                this.availableBusinesses = [];
            }
        } else {
            this.availableBusinesses = [];
        }
    }

    /**
     * Load current business (for regular users)
     * @private
     */
    async _loadCurrentBusiness(userId) {
        const userDoc = await this.db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData.currentBusinessId) {
            const businessDoc = await this.db.collection('businesses')
                .doc(userData.currentBusinessId)
                .get();
                
            if (businessDoc.exists) {
                this.availableBusinesses = [{
                    id: businessDoc.id,
                    ...businessDoc.data()
                }];
            } else {
                this.availableBusinesses = [];
            }
        } else {
            this.availableBusinesses = [];
        }
    }

    /**
     * Set the current business
     * @param {string} id - Business ID
     * @param {Object} businessData - Business data
     */
    async setCurrentBusiness(id, businessData) {
        this.currentBusiness = {
            id,
            ...businessData
        };

        // Store the current business selection in user's document
        const user = this.firebaseManager.getCurrentUser();
        if (user) {
            await this.db.collection('users').doc(user.uid).update({
                currentBusinessId: id,
                lastBusinessAccess: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Trigger event for business change
        const event = new CustomEvent('businessChanged', { 
            detail: { business: this.currentBusiness } 
        });
        document.dispatchEvent(event);
    }

    /**
     * Set the current business for the user
     * @param {string} businessId - The business ID to set as current
     * @returns {Promise<void>}
     */
    async setCurrentBusiness(businessId) {
        const user = this.firebaseManager.getCurrentUser();
        if (!user) throw new Error('No user logged in');

        try {
            // Verify business exists and user has access
            const businessDoc = await this.db.collection('businesses').doc(businessId).get();
            if (!businessDoc.exists) {
                throw new Error('Business not found');
            }

            // Update user's current business
            await this.db.collection('users').doc(user.uid).update({
                currentBusinessId: businessId,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local state
            this.currentBusiness = {
                id: businessDoc.id,
                ...businessDoc.data()
            };

            // Clear current property if it doesn't belong to the new business
            if (this.currentProperty && this.currentProperty.businessId !== businessId) {
                await this.clearCurrentProperty();
            }

            // Trigger business change event
            document.dispatchEvent(new CustomEvent('businessChanged', {
                detail: { business: this.currentBusiness }
            }));
        } catch (error) {
            console.error('Error setting current business:', error);
            throw error;
        }
    }

    /**
     * Set the current property
     * @param {string} id - Property ID
     * @param {Object} propertyData - Property data
     */
    async setCurrentProperty(id, propertyData) {
        this.currentProperty = {
            id,
            ...propertyData
        };

        // Store the current property selection in user's document
        const user = this.firebaseManager.getCurrentUser();
        if (user) {
            await this.db.collection('users').doc(user.uid).update({
                currentPropertyId: id,
                lastPropertyAccess: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Trigger event for property change
        const event = new CustomEvent('propertyChanged', { 
            detail: { property: this.currentProperty } 
        });
        document.dispatchEvent(event);
    }

    /**
     * Set the current property for the user
     * @param {string} propertyId - The property ID to set as current
     * @returns {Promise<void>}
     */
    async setCurrentProperty(propertyId) {
        const user = this.firebaseManager.getCurrentUser();
        if (!user) throw new Error('No user logged in');

        try {
            // Verify property exists
            const propertyDoc = await this.db.collection('properties').doc(propertyId).get();
            if (!propertyDoc.exists) {
                throw new Error('Property not found');
            }

            const propertyData = propertyDoc.data();
            
            // Verify property belongs to current business
            if (propertyData.businessId !== this.currentBusiness?.id) {
                throw new Error('Property does not belong to current business');
            }

            // Update user's current property
            await this.db.collection('users').doc(user.uid).update({
                currentPropertyId: propertyId,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local state
            this.currentProperty = {
                id: propertyDoc.id,
                ...propertyData
            };

            // Trigger property change event
            document.dispatchEvent(new CustomEvent('propertyChanged', {
                detail: { property: this.currentProperty }
            }));
        } catch (error) {
            console.error('Error setting current property:', error);
            throw error;
        }
    }

    /**
     * Clear the current property selection
     * @returns {Promise<void>}
     */
    async clearCurrentProperty() {
        const user = this.firebaseManager.getCurrentUser();
        if (!user) throw new Error('No user logged in');

        try {
            await this.db.collection('users').doc(user.uid).update({
                currentPropertyId: null,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.currentProperty = null;

            // Trigger property change event
            document.dispatchEvent(new CustomEvent('propertyChanged', {
                detail: { property: null }
            }));
        } catch (error) {
            console.error('Error clearing current property:', error);
            throw error;
        }
    }

    /**
     * Get all businesses available to the current user
     * @returns {Promise<Array>} - List of businesses
     */
    async getAvailableBusinesses() {
        try {
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');

            let businesses = [];
            
            if (user.role === 'super_admin') {
                // Super admins can see all businesses
                const businessesSnapshot = await this.db.collection('businesses').get();
                businesses = businessesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Get user's business access
                const userDoc = await this.db.collection('users').doc(user.uid).get();
                
                if (!userDoc.exists) throw new Error('User document not found');
                
                const userData = userDoc.data();
                
                if (userData.businessId) {
                    // Get the specific business
                    const businessDoc = await this.db.collection('businesses').doc(userData.businessId).get();
                    
                    if (businessDoc.exists) {
                        businesses = [{
                            id: businessDoc.id,
                            ...businessDoc.data()
                        }];
                    }
                }
            }
            
            return businesses;
        } catch (error) {
            console.error('Error fetching available businesses:', error);
            return [];
        }
    }

    /**
     * Get properties for the current business
     * @returns {Promise<Array>} - List of properties
     */
    async getPropertiesForBusiness(businessId = null) {
        try {
            const targetBusinessId = businessId || (this.currentBusiness ? this.currentBusiness.id : null);
            if (!targetBusinessId) throw new Error('No business selected');
            
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');
            
            let propertiesRef;
            
            if (user.role === 'super_admin' || user.role === 'owner') {
                // Superadmins and owners can see all properties for the business
                propertiesRef = await this.db.collection('properties')
                    .where('business', '==', targetBusinessId)
                    .get();
            } else {
                // Get user document to check property access
                const userDoc = await this.db.collection('users').doc(user.uid).get();
                
                if (!userDoc.exists) throw new Error('User document not found');
                
                const userData = userDoc.data();
                
                if (!userData.propertyAccess || userData.propertyAccess.length === 0) {
                    return [];
                }
                
                // Get properties that match the business and the user's access
                propertiesRef = await this.db.collection('properties')
                    .where('business', '==', targetBusinessId)
                    .where(firebase.firestore.FieldPath.documentId(), 'in', userData.propertyAccess)
                    .get();
            }
            
            return propertiesRef.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching properties for business:', error);
            return [];
        }
    }

    /**
     * Create a new business
     * @param {Object} businessData - Business data
     * @returns {Promise<string>} - Created business ID
     */
    async createBusiness(businessData) {
        try {
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');
            
            if (user.role !== 'super_admin' && user.role !== 'owner') {
                throw new Error('Insufficient permissions to create a business');
            }
            
            // Generate a unique business code
            const businessCode = this.generateUniqueCode('BUS');
            
            // Create the business document
            const businessRef = await this.db.collection('businesses').add({
                businessCode,
                companyName: businessData.companyName,
                businessType: businessData.businessType || 'restaurant',
                owner: user.uid,
                companyEmail: businessData.companyEmail,
                companyPhone: businessData.companyPhone || '',
                address: businessData.address || {},
                settings: businessData.settings || {
                    requireApprovalForNewStaff: true,
                    taxRate: 0,
                    currency: 'USD'
                },
                properties: [],
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update the user document to link them to this business if they're an owner
            if (user.role === 'owner') {
                await this.db.collection('users').doc(user.uid).update({
                    businessId: businessRef.id,
                    accessLevel: 'business'
                });
            }
            
            return businessRef.id;
        } catch (error) {
            console.error('Error creating business:', error);
            throw error;
        }
    }

    /**
     * Create a new property for a business
     * @param {string} businessId - Business ID
     * @param {Object} propertyData - Property data
     * @returns {Promise<string>} - Created property ID
     */
    async createProperty(businessId, propertyData) {
        try {
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');
            
            // Check permissions
            if (user.role !== 'super_admin' && user.role !== 'owner') {
                throw new Error('Insufficient permissions to create a property');
            }
            
            // Get the business
            const businessDoc = await this.db.collection('businesses').doc(businessId).get();
            
            if (!businessDoc.exists) {
                throw new Error('Business not found');
            }
            
            // Generate unique codes
            const propertyCode = this.generateUniqueCode('PRO');
            const connectionCode = this.generateUniqueCode('CON');
            
            // Check if this is the first property (to set as main)
            const existingProperties = businessDoc.data().properties || [];
            const isMainProperty = existingProperties.length === 0;
            
            // Create the property
            const propertyRef = await this.db.collection('properties').add({
                propertyCode,
                propertyName: propertyData.propertyName,
                business: businessId,
                connectionCode,
                address: propertyData.address || {},
                isMainProperty,
                settings: propertyData.settings || {
                    tables: [],
                    sections: []
                },
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update the business with the new property reference
            await this.db.collection('businesses').doc(businessId).update({
                properties: firebase.firestore.FieldValue.arrayUnion(propertyRef.id)
            });
            
            // If the user is an owner, give them access to this property
            if (user.role === 'owner') {
                await this.db.collection('users').doc(user.uid).update({
                    propertyAccess: firebase.firestore.FieldValue.arrayUnion(propertyRef.id)
                });
            }
            
            return propertyRef.id;
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    /**
     * Create a new user with umbrella account system roles
     * @param {Object} userData - User data including role, businessId, and propertyAccess
     * @returns {Promise<string>} - Created user ID
     */
    async createUser(userData) {
        try {
            const currentUser = this.firebaseManager.getCurrentUser();
            if (!currentUser) throw new Error('No authenticated user');
            
            // Check permission based on the current user's role
            if (currentUser.role !== 'super_admin' && currentUser.role !== 'owner' && currentUser.role !== 'manager') {
                throw new Error('Insufficient permissions to create a user');
            }
            
            // Handle role restrictions
            if (currentUser.role === 'manager' && ['super_admin', 'owner'].includes(userData.role)) {
                throw new Error('Managers cannot create super admins or owners');
            }
            
            if (currentUser.role === 'owner' && userData.role === 'super_admin') {
                throw new Error('Owners cannot create super admins');
            }
            
            // Create the user in Firebase Authentication
            const userCredential = await this.firebaseManager.auth.createUserWithEmailAndPassword(
                userData.email, 
                userData.password
            );
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: `${userData.firstName} ${userData.lastName}`
            });
            
            // Determine business and property access
            let businessId = userData.businessId;
            let propertyAccess = userData.propertyAccess || [];
            
            if (currentUser.role !== 'super_admin') {
                // Non-super-admins can only assign users to their own business
                const userDoc = await this.db.collection('users').doc(currentUser.uid).get();
                const userBusinessId = userDoc.data().businessId;
                
                if (!userBusinessId) {
                    throw new Error('Current user is not associated with a business');
                }
                
                businessId = userBusinessId;
                
                if (currentUser.role === 'manager') {
                    // Managers can only assign their own properties
                    const managerProperties = userDoc.data().propertyAccess || [];
                    propertyAccess = propertyAccess.filter(propId => managerProperties.includes(propId));
                }
            }
            
            // Create user document in Firestore
            await this.db.collection('users').doc(userCredential.user.uid).set({
                username: userData.username || userData.email.split('@')[0],
                email: userData.email,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                role: userData.role,
                accessLevel: userData.accessLevel || 
                    (userData.role === 'super_admin' ? 'global' : 
                    userData.role === 'owner' ? 'business' : 'property'),
                permissions: userData.permissions || [],
                businessId: businessId,
                propertyAccess: propertyAccess,
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser.uid
            });
            
            return userCredential.user.uid;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Generate a unique code for business/property
     * @param {string} prefix - Code prefix
     * @returns {string} - Generated code
     */
    generateUniqueCode(prefix) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}${randomChars}`;
    }
    
    /**
     * Connect to a property using a connection code
     * @param {string} connectionCode - Property connection code
     * @returns {Promise<boolean>} - Success status
     */
    async connectToPropertyByCode(connectionCode) {
        try {
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');
            
            // Search for property with this connection code
            const propertiesRef = await this.db.collection('properties')
                .where('connectionCode', '==', connectionCode)
                .limit(1)
                .get();
                
            if (propertiesRef.empty) {
                throw new Error('Invalid connection code');
            }
            
            const propertyDoc = propertiesRef.docs[0];
            const propertyData = propertyDoc.data();
            
            // Get the business this property belongs to
            const businessDoc = await this.db.collection('businesses').doc(propertyData.business).get();
            
            if (!businessDoc.exists) {
                throw new Error('Associated business not found');
            }
            
            const businessData = businessDoc.data();
            
            // Update user's access to include this property and business
            await this.db.collection('users').doc(user.uid).update({
                businessId: propertyData.business,
                propertyAccess: firebase.firestore.FieldValue.arrayUnion(propertyDoc.id)
            });
            
            // Set as current property and business
            this.setCurrentBusiness(propertyData.business, businessData);
            this.setCurrentProperty(propertyDoc.id, propertyData);
            
            return true;
        } catch (error) {
            console.error('Error connecting to property:', error);
            return false;
        }
    }
    
    /**
     * Switch the current property
     * @param {string} propertyId - Property ID to switch to
     * @returns {Promise<boolean>} - Success status
     */
    async switchProperty(propertyId) {
        try {
            const propertyDoc = await this.db.collection('properties').doc(propertyId).get();
            
            if (!propertyDoc.exists) {
                throw new Error('Property not found');
            }
            
            const propertyData = propertyDoc.data();
            
            // Verify user has access to this property
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');
            
            if (user.role !== 'super_admin') {
                const userDoc = await this.db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (!userData.propertyAccess || !userData.propertyAccess.includes(propertyId)) {
                    throw new Error('User does not have access to this property');
                }
            }
            
            // Set as current property
            this.setCurrentProperty(propertyId, propertyData);
            
            return true;
        } catch (error) {
            console.error('Error switching property:', error);
            return false;
        }
    }
    
    /**
     * Switch the current business and default to its main property
     * @param {string} businessId - Business ID to switch to
     * @returns {Promise<boolean>} - Success status
     */
    async switchBusiness(businessId) {
        try {
            const businessDoc = await this.db.collection('businesses').doc(businessId).get();
            
            if (!businessDoc.exists) {
                throw new Error('Business not found');
            }
            
            const businessData = businessDoc.data();
            
            // Verify user has access to this business
            const user = this.firebaseManager.getCurrentUser();
            if (!user) throw new Error('No authenticated user');
            
            if (user.role !== 'super_admin') {
                const userDoc = await this.db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (userData.businessId !== businessId) {
                    throw new Error('User does not have access to this business');
                }
            }
            
            // Set as current business
            this.setCurrentBusiness(businessId, businessData);
            
            // Find and set the main property
            const propertiesRef = await this.db.collection('properties')
                .where('business', '==', businessId)
                .where('isMainProperty', '==', true)
                .limit(1)
                .get();
                
            if (!propertiesRef.empty) {
                const mainPropertyDoc = propertiesRef.docs[0];
                this.setCurrentProperty(mainPropertyDoc.id, mainPropertyDoc.data());
            } else {
                // If no main property, try to get any property
                const anyPropertyRef = await this.db.collection('properties')
                    .where('business', '==', businessId)
                    .limit(1)
                    .get();
                    
                if (!anyPropertyRef.empty) {
                    const propertyDoc = anyPropertyRef.docs[0];
                    this.setCurrentProperty(propertyDoc.id, propertyDoc.data());
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error switching business:', error);
            return false;
        }
    }

    /**
     * Get available properties for the current business
     * @returns {Promise<Array>} Array of property objects
     */
    async getAvailableProperties() {
        if (!this.currentBusiness) {
            return [];
        }

        try {
            const user = this.firebaseManager.getCurrentUser();
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();

            let query = this.db.collection('properties')
                .where('businessId', '==', this.currentBusiness.id);

            // For property managers, filter only their assigned properties
            if (userData.role === 'propertyManager') {
                const accessSnapshot = await this.db.collection('propertyAccess')
                    .where('userId', '==', user.uid)
                    .get();
                const propertyIds = accessSnapshot.docs.map(doc => doc.data().propertyId);
                
                if (propertyIds.length === 0) return [];
                
                query = query.where(firebase.firestore.FieldPath.documentId(), 'in', propertyIds);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting available properties:', error);
            throw error;
        }
    }
}

// Create a global instance when Firebase is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a short delay to ensure Firebase is ready
    setTimeout(() => {
        try {
            // Create and initialize the umbrella account manager
            window.umbrellaManager = new UmbrellaAccountManager(window.firebaseManager);
            window.umbrellaManager.initialize()
                .then(() => console.log('Umbrella account system initialized'))
                .catch(err => console.error('Error initializing umbrella account system:', err));
        } catch (e) {
            console.error('Could not initialize umbrella account manager:', e);
        }
    }, 1000);
});

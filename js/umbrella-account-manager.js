/**
 * Umbrella Account Management System for Zentry POS
 * Manages business entities, properties, and user permissions
 */
class UmbrellaAccountManager {
    constructor(firebaseManager) {
        this.firebaseManager = firebaseManager;
        // Defensive: check if firebaseServices is available
        this.db = (window.firebaseServices && window.firebaseServices.getDb) ? window.firebaseServices.getDb() : null;
        // Only use localStorage if Firebase is not available or user is not authenticated
        this.currentBusiness = null;
        this.currentProperty = null;
        if (!this.db || !this.firebaseManager || !this.firebaseManager.auth || !this.firebaseManager.auth.currentUser) {
            // Fallback: try to load from localStorage
            try {
                this.currentBusiness = JSON.parse(localStorage.getItem('currentBusiness') || 'null');
                this.currentProperty = JSON.parse(localStorage.getItem('currentProperty') || 'null');
            } catch (e) {
                this.currentBusiness = null;
                this.currentProperty = null;
            }
        }
    }

    /**
     * Initialize the umbrella account system
     * @returns {Promise<void>}
     */
    async initialize() {
        // Listen for auth state changes to load business and property automatically
        this.firebaseManager.auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Try to load user's business and property access
                await this.loadUserBusinessAccess(user.uid);
            } else {
                // Clear business and property data
                this.currentBusiness = null;
                this.currentProperty = null;
                localStorage.removeItem('currentBusiness');
                localStorage.removeItem('currentProperty');
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
            // Get user document
            const userDoc = await this.db.collection('users').doc(userId).get();
            
            if (!userDoc.exists) {
                console.warn('User document not found in Firestore');
                return;
            }

            const userData = userDoc.data();
            
            // Super admin can access all businesses
            if (userData.role === 'super_admin') {
                // Don't set a specific business for super_admin
                return;
            }
            
            // For business owners and managers
            if (userData.businessId) {
                // Get the business document
                const businessDoc = await this.db.collection('businesses').doc(userData.businessId).get();
                
                if (businessDoc.exists) {
                    this.setCurrentBusiness(businessDoc.id, businessDoc.data());
                    
                    // Load default property if there's property access
                    if (userData.propertyAccess && userData.propertyAccess.length > 0) {
                        // Try to load the main property first
                        const propertiesRef = await this.db.collection('properties')
                            .where('business', '==', userData.businessId)
                            .where('isMainProperty', '==', true)
                            .limit(1)
                            .get();
                            
                        if (!propertiesRef.empty) {
                            // Set main property
                            const mainPropertyDoc = propertiesRef.docs[0];
                            this.setCurrentProperty(mainPropertyDoc.id, mainPropertyDoc.data());
                        } else if (userData.propertyAccess.length > 0) {
                            // Fall back to first available property
                            const firstPropertyId = userData.propertyAccess[0];
                            const propertyDoc = await this.db.collection('properties').doc(firstPropertyId).get();
                            
                            if (propertyDoc.exists) {
                                this.setCurrentProperty(propertyDoc.id, propertyDoc.data());
                            }
                        }
                    }
                } else {
                    console.error('Referenced business not found');
                }
            }
        } catch (error) {
            console.error('Error loading business access:', error);
        }
    }

    /**
     * Set the current business
     * @param {string} id - Business ID
     * @param {Object} businessData - Business data
     */
    setCurrentBusiness(id, businessData) {
        this.currentBusiness = {
            id,
            ...businessData
        };
        // Only save to localStorage if Firebase connection is lost or user is not authenticated
        if (!this.db || !this.firebaseManager || !this.firebaseManager.auth || !this.firebaseManager.auth.currentUser) {
            try {
                localStorage.setItem('currentBusiness', JSON.stringify(this.currentBusiness));
            } catch (e) {
                // Ignore quota errors
            }
        } else {
            // Remove any stale localStorage copy if connection is live
            localStorage.removeItem('currentBusiness');
        }
        // Always fire event
        const event = new CustomEvent('businessChanged', { 
            detail: { business: this.currentBusiness } 
        });
        document.dispatchEvent(event);
    }

    /**
     * Set the current property
     * @param {string} id - Property ID
     * @param {Object} propertyData - Property data
     */
    setCurrentProperty(id, propertyData) {
        this.currentProperty = {
            id,
            ...propertyData
        };
        // Only save to localStorage if Firebase connection is lost or user is not authenticated
        if (!this.db || !this.firebaseManager || !this.firebaseManager.auth || !this.firebaseManager.auth.currentUser) {
            try {
                localStorage.setItem('currentProperty', JSON.stringify(this.currentProperty));
            } catch (e) {
                // Ignore quota errors
            }
        } else {
            // Remove any stale localStorage copy if connection is live
            localStorage.removeItem('currentProperty');
        }
        // Always fire event
        const event = new CustomEvent('propertyChanged', { 
            detail: { property: this.currentProperty } 
        });
        document.dispatchEvent(event);
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
            
            // Generate a simple, memorable business ID (e.g., ZEN123, MAC456)
            const businessId = await this.generateSimpleBusinessId(businessData.companyName);
            const businessCode = businessId; // Use the same value for consistency

            console.log(`Creating business with ID: ${businessId}`);

            // Create the business document
            await this.db.collection('businesses').doc(businessId).set({
                businessCode,
                businessId, // Store the ID for easy reference
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

            console.log(`Business created successfully with ID: ${businessId}`);

            // Update the user document to link them to this business if they're an owner
            if (user.role === 'owner') {
                await this.db.collection('users').doc(user.uid).update({
                    businessId: businessId,
                    accessLevel: 'business'
                });
                
                console.log(`User linked to business: ${businessId}`);
            }

            return businessId;
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
            
            // Generate simple connection code (4-digit number)
            const connectionCode = await this.generateSimpleConnectionCode();
            
            // Check if this is the first property (to set as main)
            const existingProperties = businessDoc.data().properties || [];
            const isMainProperty = existingProperties.length === 0;
            
            console.log(`Creating property with connection code: ${connectionCode}`);
            
            // Create the property
            const propertyRef = await this.db.collection('properties').add({
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
            
            console.log(`Property created successfully with connection code: ${connectionCode}`);
            
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
     * Generate a simple, memorable business ID
     * @param {string} companyName - Company name for ID generation
     * @returns {Promise<string>} - Generated business ID
     */
    async generateSimpleBusinessId(companyName) {
        // Create a simple 6-character ID: 3 letters from company name + 3 numbers
        const cleanedName = (companyName || '').replace(/[^A-Z]/gi, '').toUpperCase();
        const namePart = cleanedName.substring(0, 3).padEnd(3, 'X'); // Always 3 characters
        
        // Generate 3-digit number (100-999)
        let attempts = 0;
        let businessId;
        
        do {
            const numberPart = Math.floor(100 + Math.random() * 900); // 100-999
            businessId = `${namePart}${numberPart}`; // e.g., ZEN123, MAC456, etc.
            attempts++;
            
            // Check if this ID already exists in Firebase
            const existingDoc = await this.db.collection('businesses').doc(businessId).get();
            if (!existingDoc.exists) {
                break; // ID is unique
            }
        } while (attempts < 50); // Try up to 50 times
        
        if (attempts >= 50) {
            throw new Error('Unable to generate unique business ID');
        }
        
        return businessId;
    }

    /**
     * Generate a simple connection code for properties
     * @returns {Promise<string>} - Generated connection code
     */
    async generateSimpleConnectionCode() {
        // Generate a simple 4-digit connection code (1000-9999)
        let attempts = 0;
        let connectionCode;
        
        do {
            connectionCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
            attempts++;
            
            // Check if this connection code already exists in Firebase
            const existingProperty = await this.db.collection('properties')
                .where('connectionCode', '==', connectionCode)
                .limit(1)
                .get();
                
            if (existingProperty.empty) {
                break; // Code is unique
            }
        } while (attempts < 50); // Try up to 50 times
        
        if (attempts >= 50) {
            throw new Error('Unable to generate unique connection code');
        }
        
        return connectionCode;
    }

    /**
     * Generate a minimal unique code for business/property (legacy method)
     * @param {string} prefix - Code prefix
     * @returns {string} - Generated code
     */
    generateUniqueCode(prefix) {
        // Minimal: prefix + 3 random uppercase letters/digits
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}-${code}`;
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
     * Export all umbrella account data and upload to Firebase Storage as JSON
     * @param {string} [fileName] - Optional file name for the backup
     * @param {string} [folder] - Optional folder in Firebase Storage
     * @returns {Promise<string>} - Download URL of the uploaded file
     */
    async exportAndUploadAllData(fileName = null, folder = 'umbrella_backups') {
        try {
            console.log('Starting umbrella account backup...');
            
            // Check prerequisites
            if (!this.currentBusiness) {
                throw new Error('No current business selected');
            }
            
            if (!this.db) {
                throw new Error('Firebase database not initialized');
            }
            
            // Check if Firebase storage is available
            const storage = window.firebaseServices?.getStorage();
            if (!storage) {
                throw new Error('Firebase Storage not initialized');
            }
            
            // Check authentication
            const currentUser = this.firebaseManager?.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            console.log('Prerequisites check passed, gathering business data...');
            
            const businessId = this.currentBusiness.id;
            
            // Gather all business data
            const businessDoc = await this.db.collection('businesses').doc(businessId).get();
            if (!businessDoc.exists) {
                throw new Error('Business document not found');
            }
            const businessData = businessDoc.data();
            
            console.log('Business data gathered, fetching properties...');
            
            // Get all properties for this business
            const propertiesSnapshot = await this.db.collection('properties').where('business', '==', businessId).get();
            const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log('Properties gathered, fetching users...');
            
            // Get all users for this business
            const usersSnapshot = await this.db.collection('users').where('businessId', '==', businessId).get();
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log('Users gathered, fetching menus...');
            
            // Get all menus for this business (if you have a menus collection)
            let menus = [];
            try {
                const menusSnapshot = await this.db.collection('menus').where('business', '==', businessId).get();
                menus = menusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (menuError) {
                console.warn('No menus collection or error fetching menus:', menuError.message);
            }
            
            console.log('Data gathering complete, preparing export...');
            
            const exportData = {
                exportedAt: new Date().toISOString(),
                exportedBy: currentUser.uid,
                business: { id: businessDoc.id, ...businessData },
                properties,
                users,
                menus
            };
            
            // Convert to JSON
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Prepare file name
            const now = new Date();
            const defaultFileName = `umbrella-backup-${businessId}-${now.toISOString().replace(/[:.]/g, '-')}.json`;
            const uploadFileName = fileName || defaultFileName;
            
            console.log(`Uploading backup file: ${uploadFileName}`);
            
            // Upload to Firebase Storage
            const storageRef = storage.ref().child(`${folder}/${uploadFileName}`);
            const snapshot = await storageRef.putString(jsonString, 'raw', { contentType: 'application/json' });
            
            console.log('File uploaded successfully, getting download URL...');
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('Backup complete! Download URL:', downloadURL);
            
            return downloadURL;
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }

    /**
     * Create a complete business account with initial property (compatible with MultiPropertyManager)
     * This method creates both a business and its first property in one operation
     * @param {Object} businessData - Business data including property information
     * @returns {Promise<Object>} - Object with success, businessId, connectionCode, and message
     */
    async createBusinessAccount(businessData) {
        try {
            // Check if user is authenticated
            const user = this.firebaseManager.getCurrentUser();
            if (!user) {
                console.warn('No authenticated user - falling back to localStorage method');
                throw new Error('Firebase authentication required');
            }

            // Validate required fields
            if (!businessData.businessName || !businessData.ownerName || !businessData.email) {
                return {
                    success: false,
                    message: 'Missing required fields: businessName, ownerName, email'
                };
            }

            // For registration flow, temporarily treat the current user as having permission
            // We'll override the role check in createBusiness for this specific case
            const originalCreateBusiness = this.createBusiness.bind(this);
            this.createBusiness = async (businessData) => {
                // Generate a simple, memorable business ID (e.g., ZEN123, MAC456)
                const businessId = await this.generateSimpleBusinessId(businessData.companyName);
                const businessCode = businessId;

                console.log(`Creating business with ID: ${businessId}`);

                // Create the business document
                await this.db.collection('businesses').doc(businessId).set({
                    businessCode,
                    businessId,
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

                console.log(`Business created successfully with ID: ${businessId}`);

                // Update the user document to link them to this business and set as owner
                await this.db.collection('users').doc(user.uid).update({
                    businessId: businessId,
                    accessLevel: 'business',
                    role: 'owner' // Ensure they're set as owner
                });
                
                console.log(`User linked to business: ${businessId}`);

                return businessId;
            };

            // Create the business
            const businessId = await this.createBusiness({
                companyName: businessData.businessName,
                businessType: businessData.businessType || 'restaurant',
                companyEmail: businessData.email,
                companyPhone: businessData.phone || '',
                address: businessData.address || '',
                settings: {
                    requireApprovalForNewStaff: true,
                    taxRate: 0,
                    currency: 'USD'
                }
            });

            // Restore original createBusiness method
            this.createBusiness = originalCreateBusiness;

            // Create the first property if property data is provided
            let connectionCode = null;
            if (businessData.propertyName) {
                const propertyId = await this.createProperty(businessId, {
                    propertyName: businessData.propertyName,
                    address: {
                        street: businessData.address || '',
                        country: businessData.country || '',
                        state: businessData.state || ''
                    },
                    settings: {
                        tables: [],
                        sections: []
                    }
                });

                // Get the connection code from the created property
                const propertyDoc = await this.db.collection('properties').doc(propertyId).get();
                if (propertyDoc.exists) {
                    connectionCode = propertyDoc.data().connectionCode;
                }
            }

            return {
                success: true,
                businessId: businessId,
                connectionCode: connectionCode || 'N/A',
                message: 'Business account created successfully'
            };

        } catch (error) {
            console.error('Error creating business account:', error);
            return {
                success: false,
                message: 'Failed to create business account: ' + error.message
            };
        }
    }

    /**
     * Generate a simple, memorable business ID
     * @param {string} companyName - Company name for ID generation
     * @returns {Promise<string>} - Generated business ID
     */
    async generateSimpleBusinessId(companyName) {
        // Create a simple 6-character ID: 3 letters from company name + 3 numbers
        const cleanedName = (companyName || '').replace(/[^A-Z]/gi, '').toUpperCase();
        const namePart = cleanedName.substring(0, 3).padEnd(3, 'X'); // Always 3 characters
        
        // Generate 3-digit number (100-999)
        let attempts = 0;
        let businessId;
        
        do {
            const numberPart = Math.floor(100 + Math.random() * 900); // 100-999
            businessId = `${namePart}${numberPart}`; // e.g., ZEN123, MAC456, etc.
            attempts++;
            
            // Check if this ID already exists in Firebase
            const existingDoc = await this.db.collection('businesses').doc(businessId).get();
            if (!existingDoc.exists) {
                break; // ID is unique
            }
        } while (attempts < 50); // Try up to 50 times
        
        if (attempts >= 50) {
            throw new Error('Unable to generate unique business ID');
        }
        
        return businessId;
    }

    /**
     * Generate a simple connection code for properties
     * @returns {Promise<string>} - Generated connection code
     */
    async generateSimpleConnectionCode() {
        // Generate a simple 4-digit connection code (1000-9999)
        let attempts = 0;
        let connectionCode;
        
        do {
            connectionCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
            attempts++;
            
            // Check if this connection code already exists in Firebase
            const existingProperty = await this.db.collection('properties')
                .where('connectionCode', '==', connectionCode)
                .limit(1)
                .get();
                
            if (existingProperty.empty) {
                break; // Code is unique
            }
        } while (attempts < 50); // Try up to 50 times
        
        if (attempts >= 50) {
            throw new Error('Unable to generate unique connection code');
        }
        
        return connectionCode;
    }

    /**
     * Generate a minimal unique code for business/property (legacy method)
     * @param {string} prefix - Code prefix
     * @returns {string} - Generated code
     */
    generateUniqueCode(prefix) {
        // Minimal: prefix + 3 random uppercase letters/digits
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}-${code}`;
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
     * Export all umbrella account data and upload to Firebase Storage as JSON
     * @param {string} [fileName] - Optional file name for the backup
     * @param {string} [folder] - Optional folder in Firebase Storage
     * @returns {Promise<string>} - Download URL of the uploaded file
     */
    async exportAndUploadAllData(fileName = null, folder = 'umbrella_backups') {
        try {
            console.log('Starting umbrella account backup...');
            
            // Check prerequisites
            if (!this.currentBusiness) {
                throw new Error('No current business selected');
            }
            
            if (!this.db) {
                throw new Error('Firebase database not initialized');
            }
            
            // Check if Firebase storage is available
            const storage = window.firebaseServices?.getStorage();
            if (!storage) {
                throw new Error('Firebase Storage not initialized');
            }
            
            // Check authentication
            const currentUser = this.firebaseManager?.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            console.log('Prerequisites check passed, gathering business data...');
            
            const businessId = this.currentBusiness.id;
            
            // Gather all business data
            const businessDoc = await this.db.collection('businesses').doc(businessId).get();
            if (!businessDoc.exists) {
                throw new Error('Business document not found');
            }
            const businessData = businessDoc.data();
            
            console.log('Business data gathered, fetching properties...');
            
            // Get all properties for this business
            const propertiesSnapshot = await this.db.collection('properties').where('business', '==', businessId).get();
            const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log('Properties gathered, fetching users...');
            
            // Get all users for this business
            const usersSnapshot = await this.db.collection('users').where('businessId', '==', businessId).get();
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log('Users gathered, fetching menus...');
            
            // Get all menus for this business (if you have a menus collection)
            let menus = [];
            try {
                const menusSnapshot = await this.db.collection('menus').where('business', '==', businessId).get();
                menus = menusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (menuError) {
                console.warn('No menus collection or error fetching menus:', menuError.message);
            }
            
            console.log('Data gathering complete, preparing export...');
            
            const exportData = {
                exportedAt: new Date().toISOString(),
                exportedBy: currentUser.uid,
                business: { id: businessDoc.id, ...businessData },
                properties,
                users,
                menus
            };
            
            // Convert to JSON
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Prepare file name
            const now = new Date();
            const defaultFileName = `umbrella-backup-${businessId}-${now.toISOString().replace(/[:.]/g, '-')}.json`;
            const uploadFileName = fileName || defaultFileName;
            
            console.log(`Uploading backup file: ${uploadFileName}`);
            
            // Upload to Firebase Storage
            const storageRef = storage.ref().child(`${folder}/${uploadFileName}`);
            const snapshot = await storageRef.putString(jsonString, 'raw', { contentType: 'application/json' });
            
            console.log('File uploaded successfully, getting download URL...');
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('Backup complete! Download URL:', downloadURL);
            
            return downloadURL;
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }
}

// Create a global instance when Firebase is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a short delay to ensure Firebase is ready
    setTimeout(() => {
        try {
            console.log('Initializing umbrella account manager...');
            
            // Check if Firebase services are available
            if (!window.firebaseServices) {
                console.error('Firebase services not available');
                return;
            }
            
            // Check if Firebase manager is available
            if (!window.firebaseManager) {
                console.error('Firebase manager not available');
                return;
            }
            
            // Create and initialize the umbrella account manager
            window.umbrellaManager = new UmbrellaAccountManager(window.firebaseManager);
            window.umbrellaManager.initialize()
                .then(() => {
                    console.log('Umbrella account system initialized successfully');
                    
                    // Dispatch event to notify other scripts
                    window.dispatchEvent(new CustomEvent('umbrellaManagerReady'));
                })
                .catch(err => {
                    console.error('Error initializing umbrella account system:', err);
                });
        } catch (e) {
            console.error('Could not initialize umbrella account manager:', e);
        }
    }, 2000); // Increased delay to ensure Firebase is fully loaded
});

// Add a button to trigger umbrella account backup/upload from the UI
function addUmbrellaBackupButton() {
    // Only add if not already present
    if (document.getElementById('umbrella-backup-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'umbrella-backup-btn';
    btn.textContent = 'Backup Umbrella Account Data';
    btn.style.position = 'fixed';
    btn.style.bottom = '24px';
    btn.style.right = '24px';
    btn.style.zIndex = 9999;
    btn.style.background = '#1976d2';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.padding = '12px 20px';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    btn.title = 'Export and backup all umbrella account data to the cloud';
    btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = 'Backing up...';
        try {
            if (!window.umbrellaManager) throw new Error('Umbrella manager not initialized');
            const url = await window.umbrellaManager.exportAndUploadAllData();
            btn.textContent = 'Backup Complete!';
            showBackupNotification('Backup complete.', true, url);
            setTimeout(() => {
                btn.textContent = 'Backup Umbrella Account Data';
                btn.disabled = false;
            }, 3000);
            window.open(url, '_blank');
        } catch (e) {
            btn.textContent = 'Backup Failed';
            showBackupNotification('Backup failed: ' + (e && e.message ? e.message : e), false);
            setTimeout(() => {
                btn.textContent = 'Backup Umbrella Account Data';
                btn.disabled = false;
            }, 3000);
        }
    };
    document.body.appendChild(btn);
}

// Notification helper
function showBackupNotification(message, isSuccess = true, url = null) {
    let notification = document.getElementById('backup-toast');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'backup-toast';
        notification.style.position = 'fixed';
        notification.style.bottom = '32px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.background = isSuccess ? '#22c55e' : '#ef4444';
        notification.style.color = '#fff';
        notification.style.padding = '1rem 2rem';
        notification.style.borderRadius = '8px';
        notification.style.fontSize = '1.1rem';
        notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        notification.style.zIndex = 10000;
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '1rem';
        document.body.appendChild(notification);
    }
    notification.innerHTML = message + (url ? ` <a href="${url}" target="_blank" style="color:#fff;text-decoration:underline;">Download</a>` : '');
    notification.style.background = isSuccess ? '#22c55e' : '#ef4444';
    notification.style.display = 'flex';
    clearTimeout(notification._hideTimeout);
    notification._hideTimeout = setTimeout(() => { notification.style.display = 'none'; }, 6000);
}

// Add the button after umbrellaManager is initialized
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(addUmbrellaBackupButton, 2000);
} else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(addUmbrellaBackupButton, 2000));
}

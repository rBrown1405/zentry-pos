// Multi-Property Management System for Macros POS
// Simplified version for testing and integration

class MultiPropertyManager {
    static PROPERTY_TYPES = {
        'restaurant': 'Restaurant',
        'hotel': 'Hotel',
        'retail': 'Retail Store',
        'cafe': 'Café',
        'bar': 'Bar/Pub',
        'food-truck': 'Food Truck',
        'catering': 'Catering Service',
        'fast-food': 'Fast Food',
        'fine-dining': 'Fine Dining',
        'other': 'Other'
    };

    static STAFF_ROLES = {
        'owner': 'Owner',
        'manager': 'Manager', 
        'assistant_manager': 'Assistant Manager',
        'server': 'Server',
        'cashier': 'Cashier',
        'kitchen': 'Kitchen Staff',
        'chef': 'Chef',
        'bartender': 'Bartender',
        'host': 'Host/Hostess',
        'cleaner': 'Cleaning Staff',
        'security': 'Security'
    };

    /**
     * Generate a unique ID for various entities
     */
    static generateUniqueId(prefix = 'entity') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * Generate a 6-digit connection code for staff registration
     */
    static generateConnectionCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Create a new business account
     */
    static createBusinessAccount(businessData) {
        try {
            // Validate required fields
            if (!businessData.businessName || !businessData.ownerName || !businessData.email) {
                return {
                    success: false,
                    message: 'Missing required fields: businessName, ownerName, email'
                };
            }

            // Generate unique business identifiers
            const businessId = this.generateUniqueId('business');
            const connectionCode = this.generateConnectionCode();

            const businessAccount = {
                id: businessId,
                businessName: businessData.businessName,
                businessType: businessData.businessType || 'restaurant',
                ownerName: businessData.ownerName,
                email: businessData.email,
                phone: businessData.phone || '',
                address: businessData.address || '',
                connectionCode: connectionCode,
                properties: [],
                staff: [],
                createdAt: new Date().toISOString(),
                isActive: true,
                settings: {
                    allowMultiProperty: true,
                    maxProperties: 50,
                    requireApprovalForNewStaff: true,
                    crossPropertyAccess: false
                }
            };

            // Store business account
            this.saveBusinessAccount(businessAccount);

            return {
                success: true,
                businessId: businessId,
                connectionCode: connectionCode,
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
     * Add a property to a business account
     */
    static addProperty(businessId, propertyData) {
        try {
            // Validate inputs
            if (!businessId || !propertyData.name) {
                return {
                    success: false,
                    message: 'Missing required fields: businessId, property name'
                };
            }

            // Get business account
            const business = this.getBusinessAccount(businessId);
            if (!business) {
                return {
                    success: false,
                    message: 'Business account not found'
                };
            }

            // Generate property ID
            const propertyId = this.generateUniqueId('property');

            const property = {
                id: propertyId,
                name: propertyData.name,
                type: propertyData.type || 'restaurant',
                address: propertyData.address || '',
                city: propertyData.city || '',
                state: propertyData.state || '',
                zip: propertyData.zip || '',
                businessId: businessId,
                createdAt: new Date().toISOString(),
                isActive: true
            };

            // Add property to business
            business.properties.push(property);

            // Save updated business account
            this.saveBusinessAccount(business);

            return {
                success: true,
                propertyId: propertyId,
                message: 'Property added successfully'
            };

        } catch (error) {
            console.error('Error adding property:', error);
            return {
                success: false,
                message: 'Failed to add property: ' + error.message
            };
        }
    }

    /**
     * Register a new staff member
     */
    static registerStaff(staffData) {
        try {
            // Validate required fields
            if (!staffData.firstName || !staffData.lastName || !staffData.connectionCode) {
                return {
                    success: false,
                    message: 'Missing required fields: firstName, lastName, connectionCode'
                };
            }

            // Find business by connection code
            const business = this.getBusinessByConnectionCode(staffData.connectionCode);
            if (!business) {
                return {
                    success: false,
                    message: 'Invalid connection code'
                };
            }

            // Generate staff ID
            const staffId = this.generateUniqueId('staff');

            const staffMember = {
                id: staffId,
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                email: staffData.email || '',
                phone: staffData.phone || '',
                role: staffData.role || 'server',
                businessId: business.id,
                propertyAccess: [], // Array of property IDs this staff can access
                isActive: true,
                isApproved: !business.settings.requireApprovalForNewStaff,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            // Store staff member
            this.saveStaffMember(staffMember);

            return {
                success: true,
                staffId: staffId,
                businessId: business.id,
                message: 'Staff member registered successfully'
            };

        } catch (error) {
            console.error('Error registering staff:', error);
            return {
                success: false,
                message: 'Failed to register staff: ' + error.message
            };
        }
    }

    /**
     * Grant property access to a staff member
     */
    static grantPropertyAccess(staffId, propertyId) {
        try {
            // Get staff member
            const staff = this.getStaffMember(staffId);
            if (!staff) {
                return {
                    success: false,
                    message: 'Staff member not found'
                };
            }

            // Check if property exists
            const business = this.getBusinessAccount(staff.businessId);
            if (!business) {
                return {
                    success: false,
                    message: 'Business account not found'
                };
            }

            const property = business.properties.find(p => p.id === propertyId);
            if (!property) {
                return {
                    success: false,
                    message: 'Property not found'
                };
            }

            // Add property access if not already present
            if (!staff.propertyAccess.includes(propertyId)) {
                staff.propertyAccess.push(propertyId);
                this.saveStaffMember(staff);
            }

            return {
                success: true,
                message: 'Property access granted successfully'
            };

        } catch (error) {
            console.error('Error granting property access:', error);
            return {
                success: false,
                message: 'Failed to grant property access: ' + error.message
            };
        }
    }

    /**
     * Get all business accounts
     */
    static getAllBusinessAccounts() {
        try {
            const accounts = [];
            const keys = Object.keys(localStorage);
            
            for (const key of keys) {
                if (key.startsWith('businessAccount_')) {
                    const account = JSON.parse(localStorage.getItem(key));
                    accounts.push(account);
                }
            }
            
            return accounts;
        } catch (error) {
            console.error('Error getting business accounts:', error);
            return [];
        }
    }

    /**
     * Get all staff members
     */
    static getAllStaff() {
        try {
            const staff = [];
            const keys = Object.keys(localStorage);
            
            for (const key of keys) {
                if (key.startsWith('staffMember_')) {
                    const member = JSON.parse(localStorage.getItem(key));
                    staff.push(member);
                }
            }
            
            return staff;
        } catch (error) {
            console.error('Error getting staff members:', error);
            return [];
        }
    }

    /**
     * Get a specific business account by ID
     */
    static getBusinessAccount(businessId) {
        try {
            // Try getting from direct key first
            let account = localStorage.getItem(`businessAccount_${businessId}`);
            if (account) {
                return JSON.parse(account);
            }

            // If not found, try searching through all accounts
            const accounts = this.getAllBusinessAccounts();
            account = accounts.find(acc => acc.id === businessId);
            
            if (account) {
                // Save it with the direct key for future lookups
                this.saveBusinessAccount(account);
                return account;
            }
            
            return null;
        } catch (error) {
            console.error('Error getting business account:', error);
            return null;
        }
    }

    /**
     * Get business account by connection code
     */
    static getBusinessByConnectionCode(connectionCode) {
        try {
            const accounts = this.getAllBusinessAccounts();
            return accounts.find(account => account.connectionCode === connectionCode) || null;
        } catch (error) {
            console.error('Error getting business by connection code:', error);
            return null;
        }
    }

    /**
     * Get a specific staff member by ID
     */
    static getStaffMember(staffId) {
        try {
            const staff = localStorage.getItem(`staffMember_${staffId}`);
            return staff ? JSON.parse(staff) : null;
        } catch (error) {
            console.error('Error getting staff member:', error);
            return null;
        }
    }

    /**
     * Save a business account to localStorage
     */
    static saveBusinessAccount(businessAccount) {
        try {
            localStorage.setItem(`businessAccount_${businessAccount.id}`, JSON.stringify(businessAccount));
            
            // Also maintain a list of all business accounts
            const accounts = this.getAllBusinessAccounts();
            const existingIndex = accounts.findIndex(acc => acc.id === businessAccount.id);
            
            if (existingIndex >= 0) {
                accounts[existingIndex] = businessAccount;
            } else {
                accounts.push(businessAccount);
            }
            
            localStorage.setItem('businessAccounts', JSON.stringify(accounts));
        } catch (error) {
            console.error('Error saving business account:', error);
        }
    }

    /**
     * Save a staff member to localStorage
     */
    static saveStaffMember(staffMember) {
        try {
            localStorage.setItem(`staffMember_${staffMember.id}`, JSON.stringify(staffMember));
            
            // Also maintain a list of all staff members
            const staff = this.getAllStaff();
            const existingIndex = staff.findIndex(s => s.id === staffMember.id);
            
            if (existingIndex >= 0) {
                staff[existingIndex] = staffMember;
            } else {
                staff.push(staffMember);
            }
            
            localStorage.setItem('registeredStaff', JSON.stringify(staff));
        } catch (error) {
            console.error('Error saving staff member:', error);
        }
    }

    /**
     * Clear all multi-property data (for testing)
     */
    static clearAllData() {
        try {
            const keys = Object.keys(localStorage);
            
            for (const key of keys) {
                if (key.startsWith('businessAccount_') || 
                    key.startsWith('staffMember_') ||
                    key === 'businessAccounts' ||
                    key === 'registeredStaff' ||
                    key === 'currentStaffId' ||
                    key === 'currentPropertyId') {
                    localStorage.removeItem(key);
                }
            }
            
            return {
                success: true,
                message: 'All multi-property data cleared'
            };
        } catch (error) {
            console.error('Error clearing data:', error);
            return {
                success: false,
                message: 'Failed to clear data: ' + error.message
            };
        }
    }
}

// Make sure the class is available globally
if (typeof window !== 'undefined') {
    window.MultiPropertyManager = MultiPropertyManager;
}

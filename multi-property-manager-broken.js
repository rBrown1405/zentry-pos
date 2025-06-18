// Multi-Property Management System for Macros POS
// Manages umbrella business accounts with multiple properties and role-based access control

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
        'super_admin': 'Super Administrator',
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

    static PERMISSIONS = {
        'super_admin': ['all'],
        'owner': ['all_property'],
        'manager': ['property_management', 'staff_management', 'reports', 'settings', 'pos', 'kitchen', 'orders'],
        'assistant_manager': ['staff_supervision', 'reports', 'pos', 'kitchen', 'orders'],
        'server': ['pos', 'orders', 'tables'],
        'cashier': ['pos', 'orders'],
        'kitchen': ['kitchen', 'orders'],
        'chef': ['kitchen', 'orders', 'menu'],
        'bartender': ['pos', 'orders', 'bar'],
        'host': ['tables', 'reservations'],
        'cleaner': ['basic'],
        'security': ['basic']
    };

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
     * Add a new property to an existing umbrella account
     */
    static async addPropertyToAccount(umbrellaAccount, propertyData) {
        try {
            // Generate property code
            const propertyCode = PropertyManager.generatePropertyCode(
                propertyData.propertyName, 
                propertyData.businessType
            );

            const property = {
                propertyCode,
                propertyName: propertyData.propertyName,
                businessType: propertyData.businessType,
                isMainProperty: propertyData.isMainProperty || false,
                address: propertyData.address,
                country: propertyData.country,
                state: propertyData.state,
                hotelBrand: propertyData.hotelBrand,
                rewardsProgram: propertyData.rewardsProgram,
                parentBusinessCode: umbrellaAccount.businessCode,
                parentBusinessID: umbrellaAccount.businessID,
                createdAt: new Date().toISOString(),
                isActive: true,
                settings: {
                    operatingHours: {
                        monday: { open: '09:00', close: '22:00', closed: false },
                        tuesday: { open: '09:00', close: '22:00', closed: false },
                        wednesday: { open: '09:00', close: '22:00', closed: false },
                        thursday: { open: '09:00', close: '22:00', closed: false },
                        friday: { open: '09:00', close: '23:00', closed: false },
                        saturday: { open: '09:00', close: '23:00', closed: false },
                        sunday: { open: '10:00', close: '21:00', closed: false }
                    },
                    taxRate: 0.08,
                    serviceCharge: propertyData.businessType === 'hotel' ? 0.18 : 0,
                    currency: 'USD',
                    timezone: 'America/New_York'
                },
                staff: [],
                managers: [],
                menu: [],
                orders: [],
                transactions: []
            };

            // Add property to umbrella account
            umbrellaAccount.properties.push(property);

            // Store property separately for quick access
            localStorage.setItem(`property_${propertyCode}`, JSON.stringify(property));

            // Update umbrella account
            localStorage.setItem(`business_id_${umbrellaAccount.businessID}`, JSON.stringify(umbrellaAccount));
            localStorage.setItem(`business_${umbrellaAccount.businessCode}`, JSON.stringify(umbrellaAccount));

            return property;

        } catch (error) {
            console.error('Error adding property:', error);
            throw new Error('Failed to add property: ' + error.message);
        }
    }

    /**
     * Create owner account for the business
     */
    static async createOwnerAccount(umbrellaAccount, businessData) {
        try {
            const ownerStaffID = await IDStorage.generateUniqueStaffID(businessData.ownerName, 'owner');

            const ownerAccount = {
                staffID: ownerStaffID,
                fullName: businessData.ownerName,
                email: businessData.companyEmail,
                phone: businessData.companyPhone,
                role: 'owner',
                businessCode: umbrellaAccount.businessCode,
                businessID: umbrellaAccount.businessID,
                propertyAccess: 'all', // Owner has access to all properties
                assignedProperties: [], // Empty means all properties
                permissions: this.PERMISSIONS['owner'],
                isActive: true,
                isApproved: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                settings: {
                    canCreateNewProperties: true,
                    canManageAllStaff: true,
                    canAccessFinancials: true,
                    canModifySettings: true
                }
            };

            // Store owner account
            localStorage.setItem(`staff_${ownerStaffID}`, JSON.stringify(ownerAccount));

            return ownerAccount;

        } catch (error) {
            console.error('Error creating owner account:', error);
            throw new Error('Failed to create owner account: ' + error.message);
        }
    }

    /**
     * Register staff member using property connection code
     */
    static async registerStaffMember(registrationData) {
        try {
            const { propertyConnectionCode, fullName, email, phone, requestedRole, pin } = registrationData;

            // Validate property connection code
            const businessCode = localStorage.getItem(`property_connection_${propertyConnectionCode}`);
            if (!businessCode) {
                throw new Error('Invalid property connection code');
            }

            // Get umbrella account
            const umbrellaAccount = JSON.parse(localStorage.getItem(`business_${businessCode}`));
            if (!umbrellaAccount) {
                throw new Error('Business account not found');
            }

            // Generate staff ID
            const staffID = await IDStorage.generateUniqueStaffID(fullName, requestedRole);

            // Create staff account (pending approval by default)
            const staffAccount = {
                staffID,
                fullName,
                email,
                phone,
                role: requestedRole || 'server',
                pin: pin, // In production, this should be hashed
                businessCode: umbrellaAccount.businessCode,
                businessID: umbrellaAccount.businessID,
                propertyConnectionCode,
                propertyAccess: 'assigned', // Limited to assigned properties
                assignedProperties: [], // To be assigned by manager
                permissions: this.PERMISSIONS[requestedRole] || this.PERMISSIONS['server'],
                isActive: false, // Inactive until approved
                isApproved: false, // Pending approval
                requestedAt: new Date().toISOString(),
                approvedAt: null,
                approvedBy: null,
                lastLogin: null,
                settings: {
                    canSwitchProperties: false,
                    canViewOtherProperties: false,
                    requireManagerOverride: true
                }
            };

            // Store staff account
            localStorage.setItem(`staff_${staffID}`, JSON.stringify(staffAccount));

            // Add to pending staff list for the business
            const pendingStaffKey = `pending_staff_${umbrellaAccount.businessCode}`;
            const pendingStaff = JSON.parse(localStorage.getItem(pendingStaffKey) || '[]');
            pendingStaff.push(staffID);
            localStorage.setItem(pendingStaffKey, JSON.stringify(pendingStaff));

            return {
                success: true,
                staffID,
                message: 'Staff registration submitted. Pending approval from management.',
                businessName: umbrellaAccount.companyName
            };

        } catch (error) {
            console.error('Error registering staff member:', error);
            throw new Error('Failed to register staff member: ' + error.message);
        }
    }

    /**
     * Approve pending staff member
     */
    static approveStaffMember(staffID, approverID, assignedProperties = []) {
        try {
            // Get staff account
            const staffAccount = JSON.parse(localStorage.getItem(`staff_${staffID}`));
            if (!staffAccount) {
                throw new Error('Staff account not found');
            }

            // Get approver account to verify permissions
            const approver = JSON.parse(localStorage.getItem(`staff_${approverID}`));
            if (!approver || !['owner', 'manager'].includes(approver.role)) {
                throw new Error('Insufficient permissions to approve staff');
            }

            // Update staff account
            staffAccount.isActive = true;
            staffAccount.isApproved = true;
            staffAccount.approvedAt = new Date().toISOString();
            staffAccount.approvedBy = approverID;
            staffAccount.assignedProperties = assignedProperties;

            // Store updated account
            localStorage.setItem(`staff_${staffID}`, JSON.stringify(staffAccount));

            // Remove from pending list
            const pendingStaffKey = `pending_staff_${staffAccount.businessCode}`;
            const pendingStaff = JSON.parse(localStorage.getItem(pendingStaffKey) || '[]');
            const updatedPending = pendingStaff.filter(id => id !== staffID);
            localStorage.setItem(pendingStaffKey, JSON.stringify(updatedPending));

            return {
                success: true,
                message: 'Staff member approved successfully'
            };

        } catch (error) {
            console.error('Error approving staff member:', error);
            throw new Error('Failed to approve staff member: ' + error.message);
        }
    }

    /**
     * Check if user has access to specific property
     */
    static hasPropertyAccess(staffID, propertyCode) {
        try {
            const staffAccount = JSON.parse(localStorage.getItem(`staff_${staffID}`));
            if (!staffAccount || !staffAccount.isActive) {
                return false;
            }

            // Super admin and owner have access to all properties
            if (['super_admin', 'owner'].includes(staffAccount.role)) {
                return true;
            }

            // Check if staff has access to all properties in their business
            if (staffAccount.propertyAccess === 'all') {
                return true;
            }

            // Check if property is in assigned properties list
            return staffAccount.assignedProperties.includes(propertyCode);

        } catch (error) {
            console.error('Error checking property access:', error);
            return false;
        }
    }

    /**
     * Get all properties accessible to a staff member
     */
    static getAccessibleProperties(staffID) {
        try {
            const staffAccount = JSON.parse(localStorage.getItem(`staff_${staffID}`));
            if (!staffAccount || !staffAccount.isActive) {
                return [];
            }

            // Get umbrella account
            const umbrellaAccount = JSON.parse(localStorage.getItem(`business_${staffAccount.businessCode}`));
            if (!umbrellaAccount) {
                return [];
            }

            // Super admin and owner have access to all properties
            if (['super_admin', 'owner'].includes(staffAccount.role) || staffAccount.propertyAccess === 'all') {
                return umbrellaAccount.properties;
            }

            // Return only assigned properties
            return umbrellaAccount.properties.filter(property => 
                staffAccount.assignedProperties.includes(property.propertyCode)
            );

        } catch (error) {
            console.error('Error getting accessible properties:', error);
            return [];
        }
    }

    /**
     * Switch staff member to different property (if they have access)
     */
    static switchToProperty(staffID, propertyCode) {
        try {
            if (!this.hasPropertyAccess(staffID, propertyCode)) {
                throw new Error('Access denied to this property');
            }

            // Get property details
            const property = JSON.parse(localStorage.getItem(`property_${propertyCode}`));
            if (!property) {
                throw new Error('Property not found');
            }

            // Set current property context
            localStorage.setItem('currentPropertyContext', JSON.stringify({
                propertyCode: property.propertyCode,
                propertyName: property.propertyName,
                businessType: property.businessType,
                staffID: staffID
            }));

            // Set property type for UI context
            localStorage.setItem('propertyType', property.businessType);
            localStorage.setItem('propertyName', property.propertyName);

            return {
                success: true,
                property: property,
                message: `Switched to ${property.propertyName}`
            };

        } catch (error) {
            console.error('Error switching property:', error);
            throw error;
        }
    }

    /**
     * Get pending staff members for approval
     */
    static getPendingStaff(businessCode, approverID) {
        try {
            // Verify approver permissions
            const approver = JSON.parse(localStorage.getItem(`staff_${approverID}`));
            if (!approver || !['owner', 'manager', 'super_admin'].includes(approver.role)) {
                throw new Error('Insufficient permissions');
            }

            const pendingStaffKey = `pending_staff_${businessCode}`;
            const pendingStaffIDs = JSON.parse(localStorage.getItem(pendingStaffKey) || '[]');

            const pendingStaff = pendingStaffIDs.map(staffID => {
                const staffAccount = JSON.parse(localStorage.getItem(`staff_${staffID}`));
                return {
                    ...staffAccount,
                    requestedRole: staffAccount.role,
                    requestedAt: staffAccount.requestedAt
                };
            }).filter(staff => staff !== null);

            return pendingStaff;

        } catch (error) {
            console.error('Error getting pending staff:', error);
            return [];
        }
    }

    /**
     * Generate unique property connection code
     */
    static generatePropertyConnectionCode() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';
        
        // Generate 6-character code
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Check if code already exists
        if (localStorage.getItem(`property_connection_${code}`)) {
            return this.generatePropertyConnectionCode(); // Regenerate if exists
        }

        return code;
    }

    /**
     * Validate property connection code
     */
    static validatePropertyConnectionCode(code) {
        const businessCode = localStorage.getItem(`property_connection_${code}`);
        if (!businessCode) {
            return { valid: false, message: 'Invalid property connection code' };
        }

        const umbrellaAccount = JSON.parse(localStorage.getItem(`business_${businessCode}`));
        if (!umbrellaAccount || !umbrellaAccount.isActive) {
            return { valid: false, message: 'Business account is not active' };
        }

        return { 
            valid: true, 
            businessCode, 
            businessName: umbrellaAccount.companyName,
            umbrellaAccount 
        };
    }

    /**
     * Get business statistics for dashboards
     */
    static getBusinessStatistics(businessCode) {
        try {
            const umbrellaAccount = JSON.parse(localStorage.getItem(`business_${businessCode}`));
            if (!umbrellaAccount) {
                return null;
            }

            const allStaffKeys = Object.keys(localStorage).filter(key => key.startsWith('staff_'));
            const businessStaff = allStaffKeys.map(key => 
                JSON.parse(localStorage.getItem(key))
            ).filter(staff => staff.businessCode === businessCode);

            const activeStaff = businessStaff.filter(staff => staff.isActive);
            const pendingStaff = businessStaff.filter(staff => !staff.isApproved);

            const roleDistribution = {};
            activeStaff.forEach(staff => {
                roleDistribution[staff.role] = (roleDistribution[staff.role] || 0) + 1;
            });

            const propertyTypeDistribution = {};
            umbrellaAccount.properties.forEach(property => {
                const type = property.businessType;
                propertyTypeDistribution[type] = (propertyTypeDistribution[type] || 0) + 1;
            });

            return {
                totalProperties: umbrellaAccount.properties.length,
                activeProperties: umbrellaAccount.properties.filter(p => p.isActive).length,
                totalStaff: businessStaff.length,
                activeStaff: activeStaff.length,
                pendingStaff: pendingStaff.length,
                roleDistribution,
                propertyTypeDistribution,
                createdAt: umbrellaAccount.createdAt,
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error getting business statistics:', error);
            return null;
        }
    }

    /**
     * Get all businesses (for super admin)
     */
    static getAllBusinesses() {
        const businesses = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('business_id_')) {
                try {
                    const business = JSON.parse(localStorage.getItem(key));
                    businesses.push(business);
                } catch (error) {
                    console.error('Error parsing business:', error);
                }
            }
        });

        return businesses;
    }
}

// Make available globally
window.MultiPropertyManager = MultiPropertyManager;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MultiPropertyManager };
}

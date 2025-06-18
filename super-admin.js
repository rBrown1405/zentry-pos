// Super Admin System for POS
// This creates and manages super admin accounts with global access

class SuperAdminManager {
    static SUPER_ADMIN_KEY = 'MACROS_SUPER_ADMIN_2025';
    
    static createSuperAdmin() {
        const superAdmin = {
            id: 'SUPER_ADMIN_001',
            username: 'rbrown14',
            password: 'Armoured@',
            email: 'admin@macrospos.com',
            firstName: 'Super',
            lastName: 'Administrator',
            role: 'super_admin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            permissions: ['all'],
            accessLevel: 'global'
        };
        
        localStorage.setItem(this.SUPER_ADMIN_KEY, JSON.stringify(superAdmin));
        return superAdmin;
    }
    
    static getSuperAdmin() {
        const data = localStorage.getItem(this.SUPER_ADMIN_KEY);
        return data ? JSON.parse(data) : null;
    }
    
    static validateSuperAdmin(username, password) {
        const superAdmin = this.getSuperAdmin();
        if (!superAdmin) {
            // Create super admin if it doesn't exist
            this.createSuperAdmin();
            return this.validateSuperAdmin(username, password);
        }
        
        return superAdmin.username === username && superAdmin.password === password;
    }
    
    static loginSuperAdmin(username, password) {
        if (this.validateSuperAdmin(username, password)) {
            const superAdmin = this.getSuperAdmin();
            superAdmin.lastLogin = new Date().toISOString();
            localStorage.setItem(this.SUPER_ADMIN_KEY, JSON.stringify(superAdmin));
            
            // Set current user as super admin
            localStorage.setItem('currentUser', JSON.stringify({
                type: 'super_admin',
                id: superAdmin.id,
                username: superAdmin.username,
                firstName: superAdmin.firstName,
                lastName: superAdmin.lastName,
                email: superAdmin.email,
                role: 'super_admin',
                accessLevel: 'global',
                permissions: ['all']
            }));
            
            // Set login flag for authentication
            localStorage.setItem('isLoggedIn', 'true');
            
            return true;
        }
        return false;
    }
    
    static getAllBusinesses() {
        const businesses = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('business_id_')) {
                const businessData = JSON.parse(localStorage.getItem(key));
                businesses.push({
                    ...businessData,
                    storageKey: key
                });
            }
        }
        return businesses;
    }
    
    static getAllStaff() {
        const allStaff = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('staff_')) {
                const staffData = JSON.parse(localStorage.getItem(key));
                allStaff.push({
                    ...staffData,
                    staffId: key.replace('staff_', ''),
                    storageKey: key
                });
            }
        }
        return allStaff;
    }
    
    static getSystemStats() {
        const businesses = this.getAllBusinesses();
        const staff = this.getAllStaff();
        
        return {
            totalBusinesses: businesses.length,
            totalStaff: staff.length,
            activeBusinesses: businesses.filter(b => b.status !== 'inactive').length,
            activeStaff: staff.filter(s => s.status === 'active').length,
            businessTypes: this.getBusinessTypeStats(businesses),
            roleDistribution: this.getRoleDistribution(staff)
        };
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
        const business = this.getAllBusinesses().find(b => b.businessID === businessId);
        if (business) {
            // Set temporary business context while maintaining super admin status
            localStorage.setItem('currentBusinessContext', JSON.stringify(business));
            localStorage.setItem('propertyType', business.businessType || 'restaurant');
            localStorage.setItem('propertyName', business.companyName || 'Business');
            return true;
        }
        return false;
    }
    
    static clearBusinessContext() {
        localStorage.removeItem('currentBusinessContext');
    }
    
    static isSuperAdmin() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return currentUser.role === 'super_admin' && currentUser.accessLevel === 'global';
    }
}

// Auto-create super admin on first load
if (typeof window !== 'undefined') {
    // Ensure super admin exists
    if (!SuperAdminManager.getSuperAdmin()) {
        SuperAdminManager.createSuperAdmin();
        console.log('🔑 Super Admin Created!');
        console.log('Username: superadmin');
        console.log('Password: MacrosPOS2025!');
        console.log('⚠️ Please change the password in production!');
    }
}

// Make available globally
window.SuperAdminManager = SuperAdminManager;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SuperAdminManager };
}

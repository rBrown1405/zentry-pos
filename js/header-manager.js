/**
 * Header Manager Module
 * Handles updating header information for the umbrella account system
 */
class HeaderManager {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        
        // Header elements
        this.accountInfoElement = document.querySelector('.account-info');
        this.businessNameElement = document.querySelector('.hotel-name');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Check if Firebase and umbrella manager are ready
        this.checkDependencies();
    }
    
    /**
     * Initialize header manager
     */
    initialize() {
        // Update header with user info
        this.updateHeaderWithUserInfo();
    }
    
    /**
     * Check if dependencies are loaded
     */
    checkDependencies() {
        // Wait for umbrella manager and firebase to be ready
        const checkInterval = setInterval(() => {
            if (window.umbrellaManager && window.firebaseManager) {
                clearInterval(checkInterval);
                this.umbrellaManager = window.umbrellaManager;
                this.initialize();
            }
        }, 500);
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Listen for business and property changes
        document.addEventListener('businessChanged', this.updateHeaderWithUserInfo.bind(this));
        document.addEventListener('propertyChanged', this.updateHeaderWithUserInfo.bind(this));
        
        // Listen for auth state changes
        if (window.firebaseManager) {
            window.firebaseManager.auth.onAuthStateChanged(user => {
                if (user) {
                    this.updateHeaderWithUserInfo();
                }
            });
        }
    }
    
    /**
     * Update header with user information
     */
    async updateHeaderWithUserInfo() {
        try {
            if (!window.firebaseManager || !window.umbrellaManager) return;
            
            const user = window.firebaseManager.getCurrentUser();
            if (!user) return;
            
            // Get user details from Firestore for the most up-to-date information
            const userDoc = await window.firebaseManager.db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) return;
            
            const userData = userDoc.data();
            
            // Update account info
            if (this.accountInfoElement) {
                const displayName = userData.firstName && userData.lastName ? 
                    `${userData.firstName} ${userData.lastName}` : 
                    userData.username || user.email;
                    
                const role = userData.role ? this.formatRole(userData.role) : '';
                
                this.accountInfoElement.textContent = `${displayName} (${role})`;
            }
            
            // Update business name
            if (this.businessNameElement) {
                let businessName = '';
                let propertyName = '';
                
                // Get current business and property
                const currentBusiness = window.umbrellaManager.currentBusiness;
                const currentProperty = window.umbrellaManager.currentProperty;
                
                if (currentBusiness) {
                    businessName = currentBusiness.companyName;
                }
                
                if (currentProperty) {
                    propertyName = currentProperty.propertyName;
                }
                
                // Display business and property name
                if (businessName && propertyName) {
                    this.businessNameElement.textContent = `${businessName} - ${propertyName}`;
                } else if (businessName) {
                    this.businessNameElement.textContent = businessName;
                } else {
                    this.businessNameElement.textContent = propertyName || 'No Business Selected';
                }
            }
            
            // Manage visibility of super admin dashboard button
            const superAdminDashboardBtn = document.getElementById('superAdminDashboardBtn');
            if (superAdminDashboardBtn) {
                if (userData.role === 'super_admin') {
                    superAdminDashboardBtn.style.display = 'block';
                } else {
                    superAdminDashboardBtn.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating header with user info:', error);
        }
    }
    
    /**
     * Format role for display
     * @param {string} role - User role
     * @returns {string} - Formatted role
     */
    formatRole(role) {
        switch (role) {
            case 'super_admin':
                return 'Super Admin';
            case 'owner':
                return 'Owner';
            case 'manager':
                return 'Manager';
            case 'employee':
                return 'Staff';
            default:
                return role.charAt(0).toUpperCase() + role.slice(1);
        }
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize header manager with a delay to ensure other components are loaded
    setTimeout(() => {
        window.headerManager = new HeaderManager(window.umbrellaManager);
    }, 1500);
});

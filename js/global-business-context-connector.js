/**
 * Global Business Context Auto-Connector
 * Automatically connects localStorage business data to umbrella manager
 * This runs on any page that loads the umbrella manager
 */

class GlobalBusinessContextConnector {
    constructor() {
        this.isConnecting = false;
        this.connected = false;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        
        // Start monitoring for umbrella manager availability
        this.startMonitoring();
    }

    startMonitoring() {
        // Check every 500ms for umbrella manager availability
        const checkInterval = setInterval(() => {
            if (window.umbrellaManager && !this.connected && !this.isConnecting) {
                clearInterval(checkInterval);
                this.attemptConnection();
            }
        }, 500);

        // Stop checking after 30 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 30000);
    }

    async attemptConnection() {
        if (this.isConnecting || this.connected) return;
        
        this.isConnecting = true;
        this.retryAttempts++;

        try {
            console.log('🔗 Global Business Context Connector: Attempting to connect business context...');
            
            // Check if business context is already set
            if (window.umbrellaManager.currentBusiness) {
                console.log('✅ Business context already connected:', window.umbrellaManager.currentBusiness.companyName);
                this.connected = true;
                this.isConnecting = false;
                return;
            }

            // Check for business login data in localStorage
            const currentUser = localStorage.getItem('currentUser');
            const currentBusiness = localStorage.getItem('currentBusiness');
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!isLoggedIn || !currentUser || !currentBusiness) {
                console.log('ℹ️ No business login data found - user not logged into business account');
                this.isConnecting = false;
                return;
            }

            const userData = JSON.parse(currentUser);
            const businessData = JSON.parse(currentBusiness);

            // Only connect if this is a business user (not super admin)
            if (userData.type !== 'business' && userData.role !== 'admin') {
                console.log('ℹ️ User is not a business user - skipping auto-connection');
                this.isConnecting = false;
                return;
            }

            console.log('🎯 Connecting business context:', {
                businessName: userData.businessName,
                businessId: businessData.id
            });

            // Create business data object compatible with umbrella manager
            const businessContextData = {
                id: businessData.id,
                companyName: userData.businessName,
                businessType: userData.businessType || 'restaurant',
                businessCode: businessData.id,
                ownerName: userData.name,
                companyEmail: userData.email || '',
                companyPhone: userData.phone || '',
                isActive: true,
                createdAt: new Date().toISOString(),
                source: 'auto_connector'
            };

            // Set the current business in umbrella manager
            window.umbrellaManager.setCurrentBusiness(businessData.id, businessContextData);

            console.log('✅ Global Business Context Connector: Business successfully connected!');
            console.log('🔍 Current business:', window.umbrellaManager.currentBusiness);

            // Dispatch event to notify other components
            const event = new CustomEvent('businessContextConnected', { 
                detail: { 
                    business: businessContextData,
                    source: 'auto_connector'
                } 
            });
            document.dispatchEvent(event);

            this.connected = true;

        } catch (error) {
            console.error('💥 Global Business Context Connector error:', error);
            
            // Retry if we haven't exceeded max retries
            if (this.retryAttempts < this.maxRetries) {
                console.log(`🔄 Retrying connection in 2 seconds... (attempt ${this.retryAttempts}/${this.maxRetries})`);
                setTimeout(() => {
                    this.isConnecting = false;
                    this.attemptConnection();
                }, 2000);
            } else {
                console.warn('⚠️ Max retry attempts exceeded for business context connection');
            }
        }

        if (this.retryAttempts >= this.maxRetries || this.connected) {
            this.isConnecting = false;
        }
    }

    // Manual trigger for debugging
    async forceConnect() {
        this.connected = false;
        this.isConnecting = false;
        this.retryAttempts = 0;
        await this.attemptConnection();
    }
}

// Auto-initialize when the script loads
let globalBusinessConnector = null;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalBusinessConnector = new GlobalBusinessContextConnector();
    });
} else {
    globalBusinessConnector = new GlobalBusinessContextConnector();
}

// Expose globally for debugging
window.globalBusinessConnector = globalBusinessConnector;

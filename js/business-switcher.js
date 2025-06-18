/**
 * Business Switcher Module
 * Handles UI and functionality for switching between businesses in the umbrella account system
 */
class BusinessSwitcher {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        this.businessSwitcherElement = document.getElementById('businessSwitcher');
        this.businessSelectElement = document.getElementById('businessSelect');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Listen for business changes
        document.addEventListener('businessChanged', this.updateBusinessDisplay.bind(this));
        
        // Check if Firebase and umbrella manager are ready
        this.checkDependencies();
    }
    
    /**
     * Initialize the business switcher
     */
    async initialize() {
        // Show the business switcher if user has access to multiple businesses
        await this.loadAvailableBusinesses();
    }
    
    /**
     * Check if dependencies are loaded
     */
    checkDependencies() {
        // Wait for umbrella manager to be ready
        const checkInterval = setInterval(() => {
            if (window.umbrellaManager) {
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
        if (this.businessSelectElement) {
            this.businessSelectElement.addEventListener('change', this.handleBusinessChange.bind(this));
        }
    }
    
    /**
     * Load businesses available to the current user
     */
    async loadAvailableBusinesses() {
        try {
            if (!this.umbrellaManager) return;
            
            // Get available businesses from umbrella manager
            const businesses = await this.umbrellaManager.getAvailableBusinesses();
            
            // Show business switcher if there are multiple businesses
            if (businesses.length > 1) {
                this.renderBusinessOptions(businesses);
                this.businessSwitcherElement.style.display = 'block';
            } else {
                this.businessSwitcherElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading available businesses:', error);
            this.businessSwitcherElement.style.display = 'none';
        }
    }
    
    /**
     * Render business options in the select dropdown
     * @param {Array} businesses - List of businesses
     */
    renderBusinessOptions(businesses) {
        if (!this.businessSelectElement) return;
        
        // Get current business ID
        const currentBusinessId = this.umbrellaManager.currentBusiness ? 
            this.umbrellaManager.currentBusiness.id : null;
            
        // Clear existing options
        this.businessSelectElement.innerHTML = '';
        
        // Add business options
        businesses.forEach(business => {
            const option = document.createElement('option');
            option.value = business.id;
            option.text = business.companyName;
            
            // Mark the current business as selected
            if (currentBusinessId && business.id === currentBusinessId) {
                option.selected = true;
            }
            
            this.businessSelectElement.appendChild(option);
        });
    }
    
    /**
     * Handle business change
     * @param {Event} event - Change event
     */
    async handleBusinessChange(event) {
        const businessId = event.target.value;
        if (!businessId) return;
        
        try {
            // Show loading state
            event.target.disabled = true;
            
            // Switch to the selected business
            const success = await this.umbrellaManager.switchBusiness(businessId);
            
            if (!success) {
                console.error('Failed to switch business');
                // Reset the select to the current business
                this.updateBusinessDisplay();
            } else {
                // Clear property selection after business switch
                // Property switcher will be updated by business change event
            }
        } catch (error) {
            console.error('Error switching business:', error);
        } finally {
            // Re-enable select
            event.target.disabled = false;
        }
    }
    
    /**
     * Update the business display
     */
    updateBusinessDisplay() {
        if (!this.businessSelectElement || !this.umbrellaManager || !this.umbrellaManager.currentBusiness) return;
        
        // Update the selected option
        const currentBusinessId = this.umbrellaManager.currentBusiness.id;
        
        for (let i = 0; i < this.businessSelectElement.options.length; i++) {
            if (this.businessSelectElement.options[i].value === currentBusinessId) {
                this.businessSelectElement.selectedIndex = i;
                break;
            }
        }
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the business switcher with a delay to ensure umbrella manager is loaded
    setTimeout(() => {
        window.businessSwitcher = new BusinessSwitcher(window.umbrellaManager);
    }, 1500);
});
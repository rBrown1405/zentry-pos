/**
 * Property Switcher Module
 * Handles UI and functionality for switching between properties in the umbrella account system
 */
class PropertySwitcher {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        this.propertySwitcherElement = document.getElementById('propertySwitcher');
        this.propertySelectElement = document.getElementById('propertySelect');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Listen for business/property changes
        document.addEventListener('propertyChanged', this.updatePropertyDisplay.bind(this));
        document.addEventListener('businessChanged', this.loadPropertiesForBusiness.bind(this));
        
        // Check if Firebase and umbrella manager are ready
        this.checkDependencies();
    }
    
    /**
     * Initialize the property switcher
     */
    async initialize() {
        // Show the property switcher if user has access to multiple properties
        await this.loadPropertiesForBusiness();
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
        if (this.propertySelectElement) {
            this.propertySelectElement.addEventListener('change', this.handlePropertyChange.bind(this));
        }
    }
    
    /**
     * Load properties for the current business
     */
    async loadPropertiesForBusiness() {
        try {
            if (!this.umbrellaManager) return;
            
            // Get the current business from umbrella manager
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) return;
            
            // Get properties for this business
            const properties = await this.umbrellaManager.getPropertiesForBusiness(currentBusiness.id);
            
            // Show property switcher if there are multiple properties
            if (properties.length > 1) {
                this.renderPropertyOptions(properties);
                this.propertySwitcherElement.style.display = 'block';
            } else {
                this.propertySwitcherElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading properties for business:', error);
            this.propertySwitcherElement.style.display = 'none';
        }
    }
    
    /**
     * Render property options in the select dropdown
     * @param {Array} properties - List of properties
     */
    renderPropertyOptions(properties) {
        if (!this.propertySelectElement) return;
        
        // Get current property ID
        const currentPropertyId = this.umbrellaManager.currentProperty ? 
            this.umbrellaManager.currentProperty.id : null;
            
        // Clear existing options
        this.propertySelectElement.innerHTML = '';
        
        // Add property options
        properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property.id;
            option.text = property.propertyName;
            
            // Mark the current property as selected
            if (currentPropertyId && property.id === currentPropertyId) {
                option.selected = true;
            }
            
            this.propertySelectElement.appendChild(option);
        });
    }
    
    /**
     * Handle property change
     * @param {Event} event - Change event
     */
    async handlePropertyChange(event) {
        const propertyId = event.target.value;
        if (!propertyId) return;
        
        try {
            // Show loading state
            event.target.disabled = true;
            
            // Switch to the selected property
            const success = await this.umbrellaManager.switchProperty(propertyId);
            
            if (!success) {
                console.error('Failed to switch property');
                // Reset the select to the current property
                this.updatePropertyDisplay();
            }
            
            // Update UI components that depend on property
            this.notifyPropertyChange();
        } catch (error) {
            console.error('Error switching property:', error);
        } finally {
            // Re-enable select
            event.target.disabled = false;
        }
    }
    
    /**
     * Update the property display
     */
    updatePropertyDisplay() {
        if (!this.propertySelectElement || !this.umbrellaManager || !this.umbrellaManager.currentProperty) return;
        
        // Update the selected option
        const currentPropertyId = this.umbrellaManager.currentProperty.id;
        
        for (let i = 0; i < this.propertySelectElement.options.length; i++) {
            if (this.propertySelectElement.options[i].value === currentPropertyId) {
                this.propertySelectElement.selectedIndex = i;
                break;
            }
        }
    }
    
    /**
     * Notify components about property change
     */
    notifyPropertyChange() {
        // Refresh any UI elements that depend on the property
        if (typeof refreshMenuItems === 'function') refreshMenuItems();
        if (typeof refreshTables === 'function') refreshTables();
        if (typeof updateHeaderWithUserInfo === 'function') {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (user) updateHeaderWithUserInfo(user);
        }
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the property switcher with a delay to ensure umbrella manager is loaded
    setTimeout(() => {
        window.propertySwitcher = new PropertySwitcher(window.umbrellaManager);
    }, 1500);
});
// Property Switcher for Multi-Property Staff Access
// Allows staff members to switch between accessible properties

class PropertySwitcher {
    static currentProperty = null;
    static accessibleProperties = [];
    static isInitialized = false;

    /**
     * Initialize the property switcher
     */
    static initialize() {
        if (this.isInitialized) return;

        try {
            const currentStaffId = localStorage.getItem('currentStaffId');
            if (!currentStaffId) {
                console.log('PropertySwitcher: No staff logged in');
                this.hidePropertySwitcher();
                return;
            }

            // Get accessible properties for the current staff
            this.accessibleProperties = this.getAccessibleProperties(currentStaffId);
            
            // Get current property context
            const currentPropertyId = localStorage.getItem('currentPropertyId');
            if (currentPropertyId) {
                this.currentProperty = this.getPropertyById(currentPropertyId);
            }

            // Initialize UI if user has access to properties
            if (this.accessibleProperties.length > 0) {
                this.initializeUI();
            } else {
                this.hidePropertySwitcher();
            }

            this.isInitialized = true;
            console.log('PropertySwitcher initialized successfully');
        } catch (error) {
            console.error('Error initializing property switcher:', error);
        }
    }

    /**
     * Initialize the property switcher UI
     */
    static initializeUI() {
        try {
            // Find the property switcher element that should already exist in the DOM
            const switcherElement = document.getElementById('propertySwitcher');
            if (!switcherElement) {
                console.log('PropertySwitcher: No switcher element found in DOM');
                return;
            }

            // Show the switcher if there are accessible properties
            if (this.accessibleProperties.length > 0) {
                this.showPropertySwitcher();
                console.log('PropertySwitcher UI initialized');
            } else {
                this.hidePropertySwitcher();
                console.log('PropertySwitcher: No accessible properties, hiding switcher');
            }
        } catch (error) {
            console.error('Error initializing property switcher UI:', error);
        }
    }

    /**
     * Create the property switcher element
     */
    static createSwitcherElement() {
        const switcher = document.createElement('div');
        switcher.id = 'property-switcher';
        switcher.className = 'property-switcher';
        
        switcher.innerHTML = `
            <div class="property-dropdown">
                <button class="property-selector" onclick="PropertySwitcher.toggleDropdown()">
                    <span class="current-property">
                        <span class="property-icon">🏢</span>
                        <span class="property-name">${this.getCurrentPropertyName()}</span>
                    </span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="property-list" id="property-list">
                    ${this.generatePropertyList()}
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();

        return switcher;
    }

    /**
     * Generate the property list HTML
     */
    static generatePropertyList() {
        if (!this.accessibleProperties.length) return '<div class="no-properties">No properties available</div>';

        return this.accessibleProperties.map(property => `
            <div class="property-item ${this.isCurrentProperty(property) ? 'active' : ''}" 
                 onclick="PropertySwitcher.switchToProperty('${property.propertyCode}')">
                <div class="property-info">
                    <div class="property-name">${property.propertyName}</div>
                    <div class="property-type">${this.getPropertyTypeDisplay(property.businessType)}</div>
                </div>
                ${this.isCurrentProperty(property) ? '<span class="current-indicator">✓</span>' : ''}
            </div>
        `).join('');
    }

    /**
     * Get current property name for display
     */
    static getCurrentPropertyName() {
        if (this.currentProperty) {
            return this.currentProperty.propertyName;
        }
        return localStorage.getItem('propertyName') || 'Select Property';
    }

    /**
     * Check if property is the current one
     */
    static isCurrentProperty(property) {
        return this.currentProperty && this.currentProperty.propertyCode === property.propertyCode;
    }

    /**
     * Get display name for property type
     */
    static getPropertyTypeDisplay(type) {
        const typeMap = {
            'restaurant': 'Restaurant',
            'hotel': 'Hotel',
            'cafe': 'Café',
            'bar': 'Bar',
            'retail': 'Retail',
            'food-truck': 'Food Truck',
            'catering': 'Catering',
            'fast-food': 'Fast Food',
            'fine-dining': 'Fine Dining'
        };
        return typeMap[type] || type;
    }

    /**
     * Toggle the property dropdown
     */
    static toggleDropdown() {
        const dropdown = document.getElementById('property-list');
        if (dropdown) {
            dropdown.classList.toggle('show');
            
            // Close dropdown when clicking outside
            if (dropdown.classList.contains('show')) {
                document.addEventListener('click', this.handleOutsideClick);
            } else {
                document.removeEventListener('click', this.handleOutsideClick);
            }
        }
    }

    /**
     * Handle clicks outside the dropdown
     */
    static handleOutsideClick = (event) => {
        const switcher = document.getElementById('property-switcher');
        if (switcher && !switcher.contains(event.target)) {
            this.closeDropdown();
        }
    }

    /**
     * Close the property dropdown
     */
    static closeDropdown() {
        const dropdown = document.getElementById('property-list');
        if (dropdown) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', this.handleOutsideClick);
        }
    }

    /**
     * Get accessible properties for a staff member
     */
    static getAccessibleProperties(staffId) {
        try {
            if (typeof MultiPropertyManager === 'undefined') {
                console.error('MultiPropertyManager not available');
                return [];
            }

            // Get staff member
            const staff = MultiPropertyManager.getStaffMember(staffId);
            if (!staff) {
                console.log('PropertySwitcher: Staff member not found');
                return [];
            }

            // Get business account
            const business = MultiPropertyManager.getBusinessAccount(staff.businessId);
            if (!business) {
                console.log('PropertySwitcher: Business account not found');
                return [];
            }

            // Filter properties based on staff access
            const accessibleProperties = business.properties.filter(property => 
                staff.propertyAccess.includes(property.id)
            );

            console.log(`PropertySwitcher: Found ${accessibleProperties.length} accessible properties`);
            return accessibleProperties;
        } catch (error) {
            console.error('Error getting accessible properties:', error);
            return [];
        }
    }

    /**
     * Get a property by ID
     */
    static getPropertyById(propertyId) {
        try {
            if (typeof MultiPropertyManager === 'undefined') {
                return null;
            }

            const businesses = MultiPropertyManager.getAllBusinessAccounts();
            for (const business of businesses) {
                const property = business.properties.find(p => p.id === propertyId);
                if (property) {
                    return property;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting property by ID:', error);
            return null;
        }
    }

    /**
     * Hide the property switcher element
     */
    static hidePropertySwitcher() {
        try {
            const switcherElement = document.getElementById('propertySwitcher');
            if (switcherElement) {
                switcherElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error hiding property switcher:', error);
        }
    }

    /**
     * Show the property switcher element and populate it
     */
    static showPropertySwitcher() {
        try {
            const switcherElement = document.getElementById('propertySwitcher');
            if (switcherElement) {
                switcherElement.style.display = 'block';
                this.populateDropdown();
            }
        } catch (error) {
            console.error('Error showing property switcher:', error);
        }
    }

    /**
     * Populate the property dropdown
     */
    static populateDropdown() {
        try {
            const selectElement = document.getElementById('propertySelect');
            if (!selectElement) {
                console.log('PropertySwitcher: No select element found');
                return;
            }

            // Clear existing options
            selectElement.innerHTML = '<option value="">Select Property...</option>';

            // Add accessible properties
            this.accessibleProperties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = property.name;
                
                // Mark current property as selected
                if (this.currentProperty && this.currentProperty.id === property.id) {
                    option.selected = true;
                }
                
                selectElement.appendChild(option);
            });

            // Add event listener for property changes
            selectElement.addEventListener('change', (event) => {
                const propertyId = event.target.value;
                if (propertyId) {
                    this.switchProperty(propertyId);
                }
            });

            console.log(`PropertySwitcher: Populated dropdown with ${this.accessibleProperties.length} properties`);
        } catch (error) {
            console.error('Error populating dropdown:', error);
        }
    }

    /**
     * Switch to a different property
     */
    static switchProperty(propertyId) {
        try {
            // Validate property access
            const property = this.accessibleProperties.find(p => p.id === propertyId);
            if (!property) {
                console.error('PropertySwitcher: Access denied to property', propertyId);
                return {
                    success: false,
                    message: 'Access denied to the selected property'
                };
            }

            // Update current property
            this.currentProperty = property;
            localStorage.setItem('currentPropertyId', propertyId);

            // Show success notification
            this.showNotification(`Switched to ${property.name}`, 'success');

            console.log(`PropertySwitcher: Switched to property: ${property.name}`);
            
            return {
                success: true,
                property: property,
                message: `Switched to ${property.name}`
            };
        } catch (error) {
            console.error('Error switching property:', error);
            return {
                success: false,
                message: 'Failed to switch property: ' + error.message
            };
        }
    }

    /**
     * Update the switcher display
     */
    static updateSwitcherDisplay() {
        const propertyName = document.querySelector('.property-switcher .property-name');
        if (propertyName) {
            propertyName.textContent = this.getCurrentPropertyName();
        }

        // Update property list
        const propertyList = document.getElementById('property-list');
        if (propertyList) {
            propertyList.innerHTML = this.generatePropertyList();
        }
    }

    /**
     * Show notification
     */
    static showNotification(message, type = 'info') {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `property-switcher-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;

            document.body.appendChild(notification);

            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    /**
     * Add CSS styles for the property switcher
     */
    static addStyles() {
        if (document.getElementById('property-switcher-styles')) return;

        const style = document.createElement('style');
        style.id = 'property-switcher-styles';
        style.textContent = `
            .property-switcher {
                margin-right: 15px;
                position: relative;
                z-index: 1000;
            }

            .property-dropdown {
                position: relative;
            }

            .property-selector {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                min-width: 180px;
            }

            .property-selector:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
            }

            .current-property {
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 1;
            }

            .property-icon {
                font-size: 16px;
            }

            .property-name {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .dropdown-arrow {
                font-size: 12px;
                transition: transform 0.3s ease;
            }

            .property-list.show .dropdown-arrow {
                transform: rotate(180deg);
            }

            .property-list {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e1e5e9;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                transition: all 0.3s ease;
                max-height: 300px;
                overflow-y: auto;
                margin-top: 4px;
            }

            .property-list.show {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
            }

            .property-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 15px;
                cursor: pointer;
                transition: background-color 0.2s ease;
                border-bottom: 1px solid #f0f0f0;
                color: #333;
            }

            .property-item:last-child {
                border-bottom: none;
            }

            .property-item:hover {
                background-color: #f8f9fa;
            }

            .property-item.active {
                background-color: #e3f2fd;
                color: #1976d2;
            }

            .property-info .property-name {
                font-weight: 500;
                color: inherit;
                margin-bottom: 2px;
            }

            .property-info .property-type {
                font-size: 12px;
                color: #666;
                opacity: 0.8;
            }

            .current-indicator {
                color: #4caf50;
                font-weight: bold;
            }

            .no-properties {
                padding: 15px;
                text-align: center;
                color: #666;
                font-style: italic;
            }

            .property-switcher-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }

            .property-switcher-notification.success {
                background-color: #4caf50;
            }

            .property-switcher-notification.error {
                background-color: #f44336;
            }

            .notification-icon {
                font-weight: bold;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .property-switcher {
                    margin-right: 8px;
                }

                .property-selector {
                    min-width: 150px;
                    padding: 6px 10px;
                    font-size: 13px;
                }

                .property-item {
                    padding: 10px 12px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Refresh accessible properties for current user
     */
    static async refreshAccessibleProperties() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.id && typeof MultiPropertyManager !== 'undefined') {
                this.accessibleProperties = MultiPropertyManager.getAccessibleProperties(currentUser.id);
                
                // Update current user data
                currentUser.accessibleProperties = this.accessibleProperties;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Reinitialize UI if needed
                if (this.accessibleProperties.length > 1 && !document.getElementById('property-switcher')) {
                    this.initializeUI();
                } else if (this.accessibleProperties.length <= 1 && document.getElementById('property-switcher')) {
                    this.removeSwitcher();
                }
            }
        } catch (error) {
            console.error('Error refreshing accessible properties:', error);
        }
    }

    /**
     * Remove property switcher from UI
     */
    static removeSwitcher() {
        const switcher = document.getElementById('property-switcher');
        if (switcher) {
            switcher.remove();
        }
    }

    /**
     * Get current property context
     */
    static getCurrentProperty() {
        return this.currentProperty;
    }

    /**
     * Check if user has access to multiple properties
     */
    static hasMultipleProperties() {
        return this.accessibleProperties.length > 1;
    }
}

// Auto-initialize when MultiPropertyManager is available
if (typeof MultiPropertyManager !== 'undefined') {
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PropertySwitcher.initialize());
    } else {
        PropertySwitcher.initialize();
    }
}

// Make available globally
window.PropertySwitcher = PropertySwitcher;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PropertySwitcher };
}

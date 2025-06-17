// Property Switcher for Multi-Property Staff Access
// Allows staff members to switch between accessible properties

class PropertySwitcher {
    static currentProperty = null;
    static accessibleProperties = [];
    static isInitialized = false;

    /**
     * Initialize the property switcher
     */
    static async initialize() {
        if (this.isInitialized) return;

        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (!currentUser.id) return;

            // Get accessible properties for the current user
            this.accessibleProperties = currentUser.accessibleProperties || [];
            
            // Get current property context
            const currentPropertyContext = localStorage.getItem('currentPropertyContext');
            if (currentPropertyContext) {
                this.currentProperty = JSON.parse(currentPropertyContext);
            }

            // Initialize UI if user has access to multiple properties
            if (this.accessibleProperties.length > 1) {
                this.initializeUI();
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing property switcher:', error);
        }
    }

    /**
     * Initialize the property switcher UI
     */
    static initializeUI() {
        // Check if property switcher already exists
        if (document.getElementById('property-switcher')) return;

        // Create property switcher dropdown
        const switcher = this.createSwitcherElement();
        
        // Insert into header
        const header = document.querySelector('.header');
        if (header) {
            const accountInfo = header.querySelector('.account-info');
            if (accountInfo) {
                accountInfo.parentNode.insertBefore(switcher, accountInfo);
            } else {
                header.appendChild(switcher);
            }
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
     * Switch to a different property
     */
    static async switchToProperty(propertyCode) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (!currentUser.id) {
                throw new Error('No user logged in');
            }

            // Use MultiPropertyManager to switch property
            const result = MultiPropertyManager.switchToProperty(currentUser.id, propertyCode);
            
            if (result.success) {
                // Update current property
                this.currentProperty = {
                    propertyCode: result.property.propertyCode,
                    propertyName: result.property.propertyName,
                    businessType: result.property.businessType
                };

                // Update UI
                this.updateSwitcherDisplay();
                this.closeDropdown();

                // Show success notification
                this.showNotification(`Switched to ${result.property.propertyName}`, 'success');

                // Reload page to apply property context
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } else {
                throw new Error('Failed to switch property');
            }

        } catch (error) {
            console.error('Error switching property:', error);
            this.showNotification('Failed to switch property: ' + error.message, 'error');
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `property-notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <span class="notification-message">${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
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

            .property-notification {
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

            .property-notification.success {
                background-color: #4caf50;
            }

            .property-notification.error {
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

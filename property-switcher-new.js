// Property Switcher for Multi-Property Staff Access
// Simplified version that works with the new MultiPropertyManager

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
                return;
            }

            // Get accessible properties for the current staff
            this.accessibleProperties = this.getAccessibleProperties(currentStaffId);
            
            // Get current property context
            const currentPropertyId = localStorage.getItem('currentPropertyId');
            if (currentPropertyId) {
                this.currentProperty = this.getPropertyById(currentPropertyId);
            }

            // Initialize UI if user has access to multiple properties
            if (this.accessibleProperties.length > 0) {
                this.initializeUI();
            }

            this.isInitialized = true;
            console.log('PropertySwitcher initialized successfully');
        } catch (error) {
            console.error('Error initializing property switcher:', error);
        }
    }

    /**
     * Get accessible properties for a staff member
     */
    static getAccessibleProperties(staffId) {
        try {
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
     * Initialize the property switcher UI
     */
    static initializeUI() {
        try {
            // Find the property switcher element
            const switcherElement = document.getElementById('propertySwitcher');
            if (!switcherElement) {
                console.log('PropertySwitcher: No switcher element found in DOM');
                return;
            }

            // Show the switcher if there are accessible properties
            if (this.accessibleProperties.length > 0) {
                switcherElement.style.display = 'block';
                
                // Populate the dropdown
                this.populateDropdown();
                
                // Add change event listener
                this.addEventListeners();
                
                console.log('PropertySwitcher UI initialized');
            } else {
                switcherElement.style.display = 'none';
                console.log('PropertySwitcher: No accessible properties, hiding switcher');
            }
        } catch (error) {
            console.error('Error initializing property switcher UI:', error);
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

            console.log(`PropertySwitcher: Populated dropdown with ${this.accessibleProperties.length} properties`);
        } catch (error) {
            console.error('Error populating dropdown:', error);
        }
    }

    /**
     * Add event listeners for property switching
     */
    static addEventListeners() {
        try {
            const selectElement = document.getElementById('propertySelect');
            if (!selectElement) return;

            selectElement.addEventListener('change', (event) => {
                const propertyId = event.target.value;
                if (propertyId) {
                    this.switchProperty(propertyId);
                }
            });

            console.log('PropertySwitcher: Event listeners added');
        } catch (error) {
            console.error('Error adding event listeners:', error);
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

            // Fire property change event
            this.firePropertyChangeEvent(property);

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
     * Fire a custom event when property changes
     */
    static firePropertyChangeEvent(property) {
        try {
            const event = new CustomEvent('propertyChanged', {
                detail: {
                    property: property,
                    previousProperty: this.currentProperty
                }
            });
            
            document.dispatchEvent(event);
            console.log('PropertySwitcher: Property change event fired');
        } catch (error) {
            console.error('Error firing property change event:', error);
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

    /**
     * Refresh the property switcher (useful after property access changes)
     */
    static refresh() {
        try {
            this.isInitialized = false;
            this.initialize();
            console.log('PropertySwitcher: Refreshed successfully');
        } catch (error) {
            console.error('Error refreshing property switcher:', error);
        }
    }

    /**
     * Hide the property switcher
     */
    static hide() {
        try {
            const switcherElement = document.getElementById('propertySwitcher');
            if (switcherElement) {
                switcherElement.style.display = 'none';
            }
            console.log('PropertySwitcher: Hidden');
        } catch (error) {
            console.error('Error hiding property switcher:', error);
        }
    }

    /**
     * Show the property switcher
     */
    static show() {
        try {
            const switcherElement = document.getElementById('propertySwitcher');
            if (switcherElement && this.accessibleProperties.length > 0) {
                switcherElement.style.display = 'block';
            }
            console.log('PropertySwitcher: Shown');
        } catch (error) {
            console.error('Error showing property switcher:', error);
        }
    }

    /**
     * Reset the property switcher (useful for logout)
     */
    static reset() {
        try {
            this.currentProperty = null;
            this.accessibleProperties = [];
            this.isInitialized = false;
            
            localStorage.removeItem('currentPropertyId');
            this.hide();
            
            console.log('PropertySwitcher: Reset successfully');
        } catch (error) {
            console.error('Error resetting property switcher:', error);
        }
    }
}

// Make sure the class is available globally
if (typeof window !== 'undefined') {
    window.PropertySwitcher = PropertySwitcher;
}

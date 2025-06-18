/**
 * Property Management UI Module
 * Provides UI components and functionality for managing properties in the umbrella account system
 */
class PropertyManager {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        this.properties = [];
        
        // Check if dependencies are loaded
        this.checkDependencies();
    }
    
    /**
     * Initialize the property manager
     */
    initialize() {
        // Create property management UI
        this.createPropertyManagementModal();
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
     * Create property management modal HTML
     */
    createPropertyManagementModal() {
        // Check if modal already exists
        if (document.getElementById('propertyManagementModal')) return;
        
        // Create modal element
        const modalHtml = `
            <div id="propertyManagementModal" class="modal-overlay">
                <div class="modal-content property-management">
                    <div class="modal-header">
                        <h3>Property Management</h3>
                        <button class="close-button" onclick="window.propertyManager.closePropertyModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="propertyList">Properties</button>
                            <button class="tab-btn" data-tab="createProperty">Create Property</button>
                        </div>
                        
                        <div id="propertyList" class="tab-content active">
                            <div class="search-bar">
                                <input type="text" id="propertySearchInput" placeholder="Search properties..." class="search-input">
                            </div>
                            <div class="property-list" id="propertiesList">
                                <div class="loader">Loading properties...</div>
                            </div>
                        </div>
                        
                        <div id="createProperty" class="tab-content">
                            <form id="createPropertyForm">
                                <div class="form-group">
                                    <label for="propertyName">Property Name *</label>
                                    <input type="text" id="propertyName" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="propertyAddress">Address</label>
                                    <input type="text" id="propertyAddress" class="form-control">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propertyCity">City</label>
                                    <input type="text" id="propertyCity" class="form-control">
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group half">
                                        <label for="propertyState">State/Province</label>
                                        <input type="text" id="propertyState" class="form-control">
                                    </div>
                                    
                                    <div class="form-group half">
                                        <label for="propertyZip">Zip/Postal Code</label>
                                        <input type="text" id="propertyZip" class="form-control">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="propertyCountry">Country</label>
                                    <input type="text" id="propertyCountry" class="form-control">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propertyPhone">Phone Number</label>
                                    <input type="text" id="propertyPhone" class="form-control">
                                </div>
                                
                                <div id="createPropertyError" class="error-message" style="display: none;"></div>
                                
                                <div class="form-actions">
                                    <button type="button" class="cancel-button" onclick="window.propertyManager.switchTab('propertyList')">Cancel</button>
                                    <button type="submit" class="primary-button">Create Property</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add modal styles if not already in document
        this.addModalStyles();
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Add modal styles to document
     */
    addModalStyles() {
        // Check if styles already exist
        if (document.getElementById('propertyManagerStyles')) return;
        
        const styles = `
            /* Property Management Modal Styles */
            .property-management {
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
            }
            
            .property-management .modal-body {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                flex: 1;
            }
            
            .tabs {
                display: flex;
                border-bottom: 1px solid #e2e8f0;
                margin-bottom: 1rem;
            }
            
            .tab-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                background: transparent;
                cursor: pointer;
                font-weight: 500;
                color: #4a5568;
                border-bottom: 3px solid transparent;
                transition: all 0.2s ease;
            }
            
            .tab-btn.active {
                color: #4299e1;
                border-bottom-color: #4299e1;
            }
            
            .tab-content {
                display: none;
                flex: 1;
                overflow-y: auto;
            }
            
            .tab-content.active {
                display: flex;
                flex-direction: column;
            }
            
            /* Property list styles */
            .search-bar {
                margin-bottom: 1rem;
            }
            
            .search-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #cbd5e0;
                border-radius: 4px;
                font-size: 1rem;
            }
            
            .property-list {
                flex: 1;
                overflow-y: auto;
            }
            
            .property-card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                padding: 1rem;
                margin-bottom: 1rem;
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .property-card:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }
            
            .property-card h4 {
                margin-top: 0;
                margin-bottom: 0.5rem;
                font-size: 1.1rem;
            }
            
            .property-card .property-address {
                color: #718096;
                font-size: 0.9rem;
                margin-bottom: 0.75rem;
            }
            
            .property-card .property-code {
                font-family: 'Courier New', monospace;
                background: #f7fafc;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                display: inline-block;
            }
            
            .property-card .property-actions {
                margin-top: 0.75rem;
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
            }
            
            .property-actions button {
                padding: 0.25rem 0.5rem;
                font-size: 0.8rem;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #cbd5e0;
                background: white;
            }
            
            .property-actions button.switch-btn {
                background: #4299e1;
                color: white;
                border: none;
            }
            
            .property-actions button.copy-btn {
                background: #e2e8f0;
            }
            
            /* Form styles */
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .form-group.half {
                flex: 1;
            }
            
            label {
                display: block;
                margin-bottom: 0.5rem;
                color: #4a5568;
                font-weight: 500;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                margin-top: 1.5rem;
            }
            
            .loader {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100px;
                color: #718096;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'propertyManagerStyles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // Create property form
        const createPropertyForm = document.getElementById('createPropertyForm');
        if (createPropertyForm) {
            createPropertyForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleCreateProperty();
            });
        }
        
        // Property search
        const searchInput = document.getElementById('propertySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterProperties(searchInput.value);
            });
        }
    }
    
    /**
     * Switch tabs
     * @param {string} tabId - Tab ID to switch to
     */
    switchTab(tabId) {
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
        });
        
        // Update active tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        
        // Load properties when switching to property list tab
        if (tabId === 'propertyList') {
            this.loadProperties();
        }
    }
    
    /**
     * Show property management modal
     */
    showPropertyModal() {
        const modal = document.getElementById('propertyManagementModal');
        if (!modal) {
            this.createPropertyManagementModal();
            setTimeout(() => this.showPropertyModal(), 100);
            return;
        }
        
        // Show modal
        modal.classList.add('active');
        
        // Load properties
        this.loadProperties();
    }
    
    /**
     * Close property management modal
     */
    closePropertyModal() {
        const modal = document.getElementById('propertyManagementModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Load properties for the current business
     */
    async loadProperties() {
        try {
            const propertiesList = document.getElementById('propertiesList');
            if (!propertiesList) return;
            
            // Show loading state
            propertiesList.innerHTML = '<div class="loader">Loading properties...</div>';
            
            // Get properties from umbrella manager
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                propertiesList.innerHTML = '<div class="no-results">No business selected</div>';
                return;
            }
            
            this.properties = await this.umbrellaManager.getPropertiesForBusiness(currentBusiness.id);
            
            // Render properties
            this.renderProperties(this.properties);
        } catch (error) {
            console.error('Error loading properties:', error);
            const propertiesList = document.getElementById('propertiesList');
            if (propertiesList) {
                propertiesList.innerHTML = '<div class="error-message">Error loading properties</div>';
            }
        }
    }
    
    /**
     * Render properties in the list
     * @param {Array} properties - List of properties
     */
    renderProperties(properties) {
        const propertiesList = document.getElementById('propertiesList');
        if (!propertiesList) return;
        
        // Check if there are properties
        if (!properties || properties.length === 0) {
            propertiesList.innerHTML = '<div class="no-results">No properties found</div>';
            return;
        }
        
        // Clear existing content
        propertiesList.innerHTML = '';
        
        // Get current property ID
        const currentPropertyId = this.umbrellaManager.currentProperty ? 
            this.umbrellaManager.currentProperty.id : null;
        
        // Render each property
        properties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            if (currentPropertyId && property.id === currentPropertyId) {
                propertyCard.classList.add('current');
            }
            
            const address = property.address || {};
            const addressText = [
                address.street,
                address.city,
                address.state,
                address.zip,
                address.country
            ].filter(Boolean).join(', ');
            
            propertyCard.innerHTML = `
                <h4>${property.propertyName}</h4>
                ${addressText ? `<div class="property-address">${addressText}</div>` : ''}
                <div class="property-code">Property Code: ${property.propertyCode || 'N/A'}</div>
                <div class="property-code">Connection Code: ${property.connectionCode || 'N/A'}</div>
                <div class="property-actions">
                    <button class="copy-btn" data-code="${property.connectionCode}">Copy Code</button>
                    ${property.id !== currentPropertyId ? 
                        `<button class="switch-btn" data-id="${property.id}">Switch to Property</button>` : 
                        ''}
                </div>
            `;
            
            // Add event listeners
            const copyBtn = propertyCard.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(property.connectionCode);
                });
            }
            
            const switchBtn = propertyCard.querySelector('.switch-btn');
            if (switchBtn) {
                switchBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.switchProperty(property.id);
                });
            }
            
            propertiesList.appendChild(propertyCard);
        });
    }
    
    /**
     * Filter properties by search term
     * @param {string} searchTerm - Search term
     */
    filterProperties(searchTerm) {
        if (!this.properties) return;
        
        // Filter properties by name or address
        const filtered = this.properties.filter(property => {
            const address = property.address || {};
            const addressText = [
                address.street,
                address.city,
                address.state,
                address.zip,
                address.country
            ].filter(Boolean).join(' ').toLowerCase();
            
            const searchLower = searchTerm.toLowerCase();
            return property.propertyName.toLowerCase().includes(searchLower) || 
                   addressText.includes(searchLower) ||
                   (property.propertyCode && property.propertyCode.toLowerCase().includes(searchLower));
        });
        
        // Render filtered properties
        this.renderProperties(filtered);
    }
    
    /**
     * Handle create property form submission
     */
    async handleCreateProperty() {
        try {
            const errorElement = document.getElementById('createPropertyError');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            
            // Get current business ID
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                this.showError('No business selected');
                return;
            }
            
            // Get form values
            const propertyName = document.getElementById('propertyName').value.trim();
            const street = document.getElementById('propertyAddress').value.trim();
            const city = document.getElementById('propertyCity').value.trim();
            const state = document.getElementById('propertyState').value.trim();
            const zip = document.getElementById('propertyZip').value.trim();
            const country = document.getElementById('propertyCountry').value.trim();
            const phone = document.getElementById('propertyPhone').value.trim();
            
            // Validate required fields
            if (!propertyName) {
                this.showError('Property name is required');
                return;
            }
            
            // Create property data object
            const propertyData = {
                propertyName,
                address: {
                    street,
                    city,
                    state,
                    zip,
                    country
                },
                phone,
                settings: {
                    tables: [],
                    sections: []
                }
            };
            
            // Create property
            const propertyId = await this.umbrellaManager.createProperty(currentBusiness.id, propertyData);
            
            // Show success message and switch to property list
            if (typeof showNotification === 'function') {
                showNotification(`Property "${propertyName}" created successfully`, 'success');
            }
            
            // Reset form
            document.getElementById('createPropertyForm').reset();
            
            // Switch to property list tab
            this.switchTab('propertyList');
            
            // Reload properties
            this.loadProperties();
        } catch (error) {
            console.error('Error creating property:', error);
            this.showError(error.message || 'Failed to create property');
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorElement = document.getElementById('createPropertyError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    /**
     * Switch to a property
     * @param {string} propertyId - Property ID
     */
    async switchProperty(propertyId) {
        try {
            // Switch property using umbrella manager
            const success = await this.umbrellaManager.switchProperty(propertyId);
            
            if (success) {
                // Close modal
                this.closePropertyModal();
                
                // Show success notification
                if (typeof showNotification === 'function') {
                    showNotification('Successfully switched property', 'success');
                }
            } else {
                if (typeof showNotification === 'function') {
                    showNotification('Failed to switch property', 'error');
                }
            }
        } catch (error) {
            console.error('Error switching property:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error switching property', 'error');
            }
        }
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    copyToClipboard(text) {
        if (!text) return;
        
        // Create temporary input element
        const tempInput = document.createElement('input');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.value = text;
        document.body.appendChild(tempInput);
        
        // Select and copy text
        tempInput.select();
        document.execCommand('copy');
        
        // Remove temporary element
        document.body.removeChild(tempInput);
        
        // Show success notification
        if (typeof showNotification === 'function') {
            showNotification('Connection code copied to clipboard', 'success');
        }
    }
}

// Add global function to show property management modal
window.showPropertyManagement = () => {
    if (window.propertyManager) {
        window.propertyManager.showPropertyModal();
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the property manager with a delay to ensure umbrella manager is loaded
    setTimeout(() => {
        window.propertyManager = new PropertyManager(window.umbrellaManager);
    }, 1500);
});

/**
 * Account Management Module
 * Provides UI and functionality for managing umbrella account entities
 * (businesses, properties, and users)
 */
class AccountManagement {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        
        // Check if dependencies are loaded
        this.checkDependencies();
    }
    
    /**
     * Initialize the account management module
     */
    initialize() {
        // Create modal HTML
        this.createAccountManagementModals();
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
     * Create account management modals
     */
    createAccountManagementModals() {
        this.createPropertyManagementModal();
        this.createUserManagementModal();
        this.createBusinessManagementModal();
        this.addModalStyles();
    }
    
    /**
     * Create property management modal
     */
    createPropertyManagementModal() {
        // Check if modal already exists
        if (document.getElementById('propertyManagementModal')) return;
        
        const modalHtml = `
            <div id="propertyManagementModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Property Management</h3>
                        <button class="close-button" onclick="window.accountManagement.closePropertyModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-header">
                            <button class="tab-button active" data-tab="properties-list">Properties</button>
                            <button class="tab-button" data-tab="add-property">Add Property</button>
                        </div>
                        
                        <div class="tab-content" id="properties-list">
                            <div class="property-list-container">
                                <h4>Properties</h4>
                                <div class="properties-list" id="propertiesList">
                                    <p>Loading properties...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="add-property" style="display: none;">
                            <h4>Add New Property</h4>
                            <form id="addPropertyForm">
                                <div class="form-group">
                                    <label for="propertyName">Property Name*</label>
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
                                    <div class="form-group half-width">
                                        <label for="propertyState">State/Province</label>
                                        <input type="text" id="propertyState" class="form-control">
                                    </div>
                                    
                                    <div class="form-group half-width">
                                        <label for="propertyZip">ZIP/Postal Code</label>
                                        <input type="text" id="propertyZip" class="form-control">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="propertyCountry">Country</label>
                                    <input type="text" id="propertyCountry" class="form-control">
                                </div>
                                
                                <div class="form-group">
                                    <button type="submit" class="primary-button">Create Property</button>
                                </div>
                                
                                <div id="propertyFormError" class="error-message" style="display: none;"></div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" onclick="window.accountManagement.closePropertyModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add event listeners
        this.initPropertyModalListeners();
    }
    
    /**
     * Create user management modal
     */
    createUserManagementModal() {
        // Check if modal already exists
        if (document.getElementById('userManagementModal')) return;
        
        const modalHtml = `
            <div id="userManagementModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>User Management</h3>
                        <button class="close-button" onclick="window.accountManagement.closeUserModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-header">
                            <button class="tab-button active" data-tab="users-list">Users</button>
                            <button class="tab-button" data-tab="add-user">Add User</button>
                        </div>
                        
                        <div class="tab-content" id="users-list">
                            <div class="user-list-container">
                                <h4>Users</h4>
                                <div class="users-list" id="usersList">
                                    <p>Loading users...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="add-user" style="display: none;">
                            <h4>Add New User</h4>
                            <form id="addUserForm">
                                <div class="form-row">
                                    <div class="form-group half-width">
                                        <label for="firstName">First Name*</label>
                                        <input type="text" id="firstName" class="form-control" required>
                                    </div>
                                    
                                    <div class="form-group half-width">
                                        <label for="lastName">Last Name*</label>
                                        <input type="text" id="lastName" class="form-control" required>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="userEmail">Email Address*</label>
                                    <input type="email" id="userEmail" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="userPassword">Password*</label>
                                    <input type="password" id="userPassword" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="userRole">Role*</label>
                                    <select id="userRole" class="form-control" required>
                                        <option value="">Select a role...</option>
                                        <option value="manager">Manager</option>
                                        <option value="employee">Employee</option>
                                    </select>
                                </div>
                                
                                <div id="propertyAccessContainer" class="form-group">
                                    <label>Property Access*</label>
                                    <div id="propertyAccessCheckboxes" class="checkbox-group">
                                        <p>Loading properties...</p>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <button type="submit" class="primary-button">Create User</button>
                                </div>
                                
                                <div id="userFormError" class="error-message" style="display: none;"></div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" onclick="window.accountManagement.closeUserModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add event listeners
        this.initUserModalListeners();
    }
    
    /**
     * Create business management modal
     */
    createBusinessManagementModal() {
        // Check if modal already exists
        if (document.getElementById('businessManagementModal')) return;
        
        const modalHtml = `
            <div id="businessManagementModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Business Management</h3>
                        <button class="close-button" onclick="window.accountManagement.closeBusinessModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-header">
                            <button class="tab-button active" data-tab="business-info">Business Info</button>
                            <button class="tab-button" data-tab="edit-business">Edit Business</button>
                            <button class="tab-button" data-tab="add-business">Add Business</button>
                        </div>
                        
                        <div class="tab-content" id="business-info">
                            <div id="currentBusinessInfo">
                                <p>Loading business information...</p>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="edit-business" style="display: none;">
                            <h4>Edit Business Information</h4>
                            <form id="editBusinessForm">
                                <div class="form-group">
                                    <label for="editCompanyName">Company Name*</label>
                                    <input type="text" id="editCompanyName" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editBusinessType">Business Type*</label>
                                    <select id="editBusinessType" class="form-control" required>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="retail">Retail</option>
                                        <option value="service">Service</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editCompanyEmail">Business Email*</label>
                                    <input type="email" id="editCompanyEmail" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editCompanyPhone">Business Phone</label>
                                    <input type="tel" id="editCompanyPhone" class="form-control">
                                </div>
                                
                                <div class="form-group">
                                    <button type="submit" class="primary-button">Update Business</button>
                                </div>
                                
                                <div id="editBusinessFormError" class="error-message" style="display: none;"></div>
                            </form>
                        </div>
                        
                        <div class="tab-content" id="add-business" style="display: none;">
                            <h4>Add New Business</h4>
                            <form id="addBusinessForm">
                                <div class="form-group">
                                    <label for="companyName">Company Name*</label>
                                    <input type="text" id="companyName" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="businessType">Business Type*</label>
                                    <select id="businessType" class="form-control" required>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="retail">Retail</option>
                                        <option value="service">Service</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="companyEmail">Business Email*</label>
                                    <input type="email" id="companyEmail" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="companyPhone">Business Phone</label>
                                    <input type="tel" id="companyPhone" class="form-control">
                                </div>
                                
                                <div class="form-group">
                                    <button type="submit" class="primary-button">Create Business</button>
                                </div>
                                
                                <div id="businessFormError" class="error-message" style="display: none;"></div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" onclick="window.accountManagement.closeBusinessModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add event listeners
        this.initBusinessModalListeners();
    }
    
    /**
     * Initialize property modal listeners
     */
    initPropertyModalListeners() {
        // Tab switching
        const propertyModal = document.getElementById('propertyManagementModal');
        if (!propertyModal) return;
        
        const tabButtons = propertyModal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Hide all tab content
                const tabContents = propertyModal.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.style.display = 'none');
                
                // Show selected tab content
                const tabId = button.getAttribute('data-tab');
                const tabContent = propertyModal.querySelector(`#${tabId}`);
                if (tabContent) tabContent.style.display = 'block';
                
                // Load data for the selected tab
                if (tabId === 'properties-list') {
                    this.loadProperties();
                }
            });
        });
        
        // Add property form submission
        const addPropertyForm = document.getElementById('addPropertyForm');
        if (addPropertyForm) {
            addPropertyForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddProperty();
            });
        }
    }
    
    /**
     * Initialize user modal listeners
     */
    initUserModalListeners() {
        // Tab switching
        const userModal = document.getElementById('userManagementModal');
        if (!userModal) return;
        
        const tabButtons = userModal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Hide all tab content
                const tabContents = userModal.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.style.display = 'none');
                
                // Show selected tab content
                const tabId = button.getAttribute('data-tab');
                const tabContent = userModal.querySelector(`#${tabId}`);
                if (tabContent) tabContent.style.display = 'block';
                
                // Load data for the selected tab
                if (tabId === 'users-list') {
                    this.loadUsers();
                } else if (tabId === 'add-user') {
                    this.loadPropertiesForUserForm();
                }
            });
        });
        
        // Add user form submission
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddUser();
            });
        }
        
        // Role change
        const roleSelect = document.getElementById('userRole');
        if (roleSelect) {
            roleSelect.addEventListener('change', () => {
                this.updatePropertyAccessVisibility(roleSelect.value);
            });
        }
    }
    
    /**
     * Initialize business modal listeners
     */
    initBusinessModalListeners() {
        // Tab switching
        const businessModal = document.getElementById('businessManagementModal');
        if (!businessModal) return;
        
        const tabButtons = businessModal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Hide all tab content
                const tabContents = businessModal.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.style.display = 'none');
                
                // Show selected tab content
                const tabId = button.getAttribute('data-tab');
                const tabContent = businessModal.querySelector(`#${tabId}`);
                if (tabContent) tabContent.style.display = 'block';
                
                // Load data for the selected tab
                if (tabId === 'business-info') {
                    this.loadBusinessInfo();
                } else if (tabId === 'edit-business') {
                    this.loadBusinessForEdit();
                }
            });
        });
        
        // Add business form submission
        const addBusinessForm = document.getElementById('addBusinessForm');
        if (addBusinessForm) {
            addBusinessForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddBusiness();
            });
        }
        
        // Edit business form submission
        const editBusinessForm = document.getElementById('editBusinessForm');
        if (editBusinessForm) {
            editBusinessForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEditBusiness();
            });
        }
    }
    
    /**
     * Add modal styles
     */
    addModalStyles() {
        // Check if styles already exist
        if (document.getElementById('accountManagementStyles')) return;
        
        const styles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: none;
                justify-content: center;
                align-items: center;
                overflow-y: auto;
                padding: 20px;
            }
            
            .modal-overlay.active {
                display: flex;
            }
            
            .modal-content {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                width: 100%;
                max-width: 700px;
                max-height: 90vh;
                padding: 0;
                animation: modal-appear 0.3s ease;
                display: flex;
                flex-direction: column;
            }
            
            .modal-header {
                background: linear-gradient(135deg, #4a5568, #2d3748);
                color: #fff;
                padding: 1rem 1.5rem;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 1.25rem;
            }
            
            .close-button {
                background: transparent;
                border: none;
                color: #fff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .modal-body {
                padding: 1.5rem;
                overflow-y: auto;
                flex-grow: 1;
            }
            
            .modal-footer {
                padding: 1rem 1.5rem;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                border-top: 1px solid #e2e8f0;
                flex-shrink: 0;
            }
            
            .tab-header {
                display: flex;
                border-bottom: 1px solid #e2e8f0;
                margin-bottom: 1.5rem;
            }
            
            .tab-button {
                background: none;
                border: none;
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                font-weight: 500;
                color: #4a5568;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
            }
            
            .tab-button:hover {
                color: #2d3748;
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .tab-button.active {
                color: #3182ce;
                border-bottom-color: #3182ce;
            }
            
            .tab-content {
                margin-bottom: 1.5rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .half-width {
                flex: 1;
                margin-bottom: 0;
            }
            
            .checkbox-group {
                margin-top: 0.5rem;
            }
            
            .checkbox-group label {
                display: block;
                margin-bottom: 0.5rem;
            }
            
            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #4a5568;
            }
            
            .form-control {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #cbd5e0;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.15s ease;
            }
            
            .form-control:focus {
                border-color: #4299e1;
                box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                outline: none;
            }
            
            .error-message {
                color: #e53e3e;
                font-size: 0.875rem;
                margin-top: 0.5rem;
            }
            
            .primary-button {
                background-color: #4299e1;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.15s ease;
            }
            
            .primary-button:hover {
                background-color: #3182ce;
            }
            
            .secondary-button {
                background-color: #a0aec0;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.15s ease;
            }
            
            .secondary-button:hover {
                background-color: #718096;
            }
            
            .cancel-button {
                background-color: #edf2f7;
                color: #4a5568;
                border: none;
                border-radius: 4px;
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.15s ease;
            }
            
            .cancel-button:hover {
                background-color: #e2e8f0;
            }
            
            .property-card, .user-card {
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 1rem;
                margin-bottom: 1rem;
                background-color: #f7fafc;
                transition: box-shadow 0.2s ease;
            }
            
            .property-card:hover, .user-card:hover {
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .property-card h5, .user-card h5 {
                margin-top: 0;
                margin-bottom: 0.5rem;
                color: #2d3748;
            }
            
            .property-card p, .user-card p {
                margin: 0.25rem 0;
                color: #4a5568;
            }
            
            .property-actions, .user-actions {
                margin-top: 1rem;
                display: flex;
                gap: 0.5rem;
            }
            
            .action-button {
                background-color: #e2e8f0;
                color: #4a5568;
                border: none;
                border-radius: 4px;
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            
            .action-button:hover {
                background-color: #cbd5e0;
            }
            
            .action-button.delete {
                background-color: #fed7d7;
                color: #c53030;
            }
            
            .action-button.delete:hover {
                background-color: #feb2b2;
            }
            
            .connection-code {
                font-family: monospace;
                background-color: #e2e8f0;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.875rem;
                margin-left: 0.5rem;
            }
            
            @keyframes modal-appear {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Business info styles */
            .business-info-container {
                background-color: #f7fafc;
                border-radius: 6px;
                padding: 1.5rem;
                border: 1px solid #e2e8f0;
            }
            
            .business-info-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
            }
            
            .business-info-header h4 {
                margin: 0;
                color: #2d3748;
            }
            
            .info-row {
                display: flex;
                margin-bottom: 0.75rem;
            }
            
            .info-label {
                font-weight: 500;
                width: 150px;
                color: #4a5568;
            }
            
            .info-value {
                flex: 1;
                color: #2d3748;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'accountManagementStyles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Show property management modal
     */
    showPropertyModal() {
        const modal = document.getElementById('propertyManagementModal');
        if (!modal) return;
        
        modal.classList.add('active');
        
        // Load properties by default
        this.loadProperties();
    }
    
    /**
     * Show user management modal
     */
    showUserModal() {
        const modal = document.getElementById('userManagementModal');
        if (!modal) return;
        
        modal.classList.add('active');
        
        // Load users by default
        this.loadUsers();
    }
    
    /**
     * Show business management modal
     */
    showBusinessModal() {
        const modal = document.getElementById('businessManagementModal');
        if (!modal) return;
        
        modal.classList.add('active');
        
        // Load business info by default
        this.loadBusinessInfo();
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
     * Close user management modal
     */
    closeUserModal() {
        const modal = document.getElementById('userManagementModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Close business management modal
     */
    closeBusinessModal() {
        const modal = document.getElementById('businessManagementModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Load properties for the current business
     */
    async loadProperties() {
        const propertiesList = document.getElementById('propertiesList');
        if (!propertiesList) return;
        
        propertiesList.innerHTML = '<p>Loading properties...</p>';
        
        try {
            // Get properties for current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                propertiesList.innerHTML = '<p>No business selected</p>';
                return;
            }
            
            const properties = await this.umbrellaManager.getPropertiesForBusiness(currentBusiness.id);
            
            if (properties.length === 0) {
                propertiesList.innerHTML = '<p>No properties found</p>';
                return;
            }
            
            // Render properties
            propertiesList.innerHTML = '';
            properties.forEach(property => {
                const propertyCard = document.createElement('div');
                propertyCard.className = 'property-card';
                
                const address = property.address || {};
                const addressLine = [
                    address.street,
                    address.city,
                    address.state,
                    address.zip,
                    address.country
                ].filter(Boolean).join(', ');
                
                propertyCard.innerHTML = `
                    <h5>${property.propertyName}</h5>
                    <p>${addressLine || 'No address provided'}</p>
                    <p>
                        <strong>Connection Code:</strong>
                        <span class="connection-code">${property.connectionCode || 'N/A'}</span>
                    </p>
                    <div class="property-actions">
                        <button class="action-button" onclick="window.accountManagement.switchToProperty('${property.id}')">
                            ${this.umbrellaManager.currentProperty && this.umbrellaManager.currentProperty.id === property.id ? 
                              'Current Property' : 'Switch to Property'}
                        </button>
                        <button class="action-button" onclick="window.accountManagement.editProperty('${property.id}')">
                            Edit
                        </button>
                        ${!property.isMainProperty ? 
                          `<button class="action-button delete" onclick="window.accountManagement.deleteProperty('${property.id}')">
                             Delete
                           </button>` : ''}
                    </div>
                `;
                
                propertiesList.appendChild(propertyCard);
            });
        } catch (error) {
            console.error('Error loading properties:', error);
            propertiesList.innerHTML = '<p>Error loading properties</p>';
        }
    }
    
    /**
     * Load users for the current business
     */
    async loadUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        usersList.innerHTML = '<p>Loading users...</p>';
        
        try {
            // Get current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                usersList.innerHTML = '<p>No business selected</p>';
                return;
            }
            
            // Get users for current business
            const usersSnapshot = await window.firebaseManager.db.collection('users')
                .where('businessId', '==', currentBusiness.id)
                .get();
            
            if (usersSnapshot.empty) {
                usersList.innerHTML = '<p>No users found</p>';
                return;
            }
            
            // Render users
            usersList.innerHTML = '';
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                
                userCard.innerHTML = `
                    <h5>${userData.firstName || ''} ${userData.lastName || ''}</h5>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Role:</strong> ${this.formatRole(userData.role)}</p>
                    <div class="user-actions">
                        <button class="action-button" onclick="window.accountManagement.editUser('${doc.id}')">
                            Edit
                        </button>
                        <button class="action-button delete" onclick="window.accountManagement.deleteUser('${doc.id}')">
                            Delete
                        </button>
                    </div>
                `;
                
                usersList.appendChild(userCard);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            usersList.innerHTML = '<p>Error loading users</p>';
        }
    }
    
    /**
     * Load properties for user form
     */
    async loadPropertiesForUserForm() {
        const container = document.getElementById('propertyAccessCheckboxes');
        if (!container) return;
        
        container.innerHTML = '<p>Loading properties...</p>';
        
        try {
            // Get properties for current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                container.innerHTML = '<p>No business selected</p>';
                return;
            }
            
            const properties = await this.umbrellaManager.getPropertiesForBusiness(currentBusiness.id);
            
            if (properties.length === 0) {
                container.innerHTML = '<p>No properties found</p>';
                return;
            }
            
            // Render property checkboxes
            container.innerHTML = '';
            properties.forEach(property => {
                const label = document.createElement('label');
                label.className = 'checkbox-label';
                
                label.innerHTML = `
                    <input type="checkbox" name="propertyAccess" value="${property.id}">
                    ${property.propertyName}
                `;
                
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading properties for user form:', error);
            container.innerHTML = '<p>Error loading properties</p>';
        }
    }
    
    /**
     * Load business information
     */
    async loadBusinessInfo() {
        const container = document.getElementById('currentBusinessInfo');
        if (!container) return;
        
        container.innerHTML = '<p>Loading business information...</p>';
        
        try {
            // Get current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                container.innerHTML = '<p>No business selected</p>';
                return;
            }
            
            // Render business info
            container.innerHTML = `
                <div class="business-info-container">
                    <div class="business-info-header">
                        <h4>${currentBusiness.companyName}</h4>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Business Type</div>
                        <div class="info-value">${this.formatBusinessType(currentBusiness.businessType)}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value">${currentBusiness.companyEmail || 'Not provided'}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${currentBusiness.companyPhone || 'Not provided'}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Business Code</div>
                        <div class="info-value"><span class="connection-code">${currentBusiness.businessCode}</span></div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading business information:', error);
            container.innerHTML = '<p>Error loading business information</p>';
        }
    }
    
    /**
     * Load business for editing
     */
    loadBusinessForEdit() {
        try {
            // Get current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                return;
            }
            
            // Set form values
            const companyName = document.getElementById('editCompanyName');
            const businessType = document.getElementById('editBusinessType');
            const companyEmail = document.getElementById('editCompanyEmail');
            const companyPhone = document.getElementById('editCompanyPhone');
            
            if (companyName) companyName.value = currentBusiness.companyName || '';
            if (businessType) businessType.value = currentBusiness.businessType || 'restaurant';
            if (companyEmail) companyEmail.value = currentBusiness.companyEmail || '';
            if (companyPhone) companyPhone.value = currentBusiness.companyPhone || '';
        } catch (error) {
            console.error('Error loading business for edit:', error);
        }
    }
    
    /**
     * Handle add property form submission
     */
    async handleAddProperty() {
        const errorElement = document.getElementById('propertyFormError');
        if (errorElement) errorElement.style.display = 'none';
        
        try {
            // Get current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                this.showError('propertyFormError', 'No business selected');
                return;
            }
            
            // Get form values
            const propertyName = document.getElementById('propertyName').value;
            const propertyAddress = document.getElementById('propertyAddress').value;
            const propertyCity = document.getElementById('propertyCity').value;
            const propertyState = document.getElementById('propertyState').value;
            const propertyZip = document.getElementById('propertyZip').value;
            const propertyCountry = document.getElementById('propertyCountry').value;
            
            // Create property data
            const propertyData = {
                propertyName,
                address: {
                    street: propertyAddress,
                    city: propertyCity,
                    state: propertyState,
                    zip: propertyZip,
                    country: propertyCountry
                }
            };
            
            // Create property
            await this.umbrellaManager.createProperty(currentBusiness.id, propertyData);
            
            // Reset form
            document.getElementById('addPropertyForm').reset();
            
            // Show properties list
            const tabButtons = document.querySelectorAll('#propertyManagementModal .tab-button');
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === 'properties-list') {
                    button.click();
                }
            });
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Property created successfully', 'success');
            } else {
                alert('Property created successfully');
            }
        } catch (error) {
            console.error('Error creating property:', error);
            this.showError('propertyFormError', error.message);
        }
    }
    
    /**
     * Handle add user form submission
     */
    async handleAddUser() {
        const errorElement = document.getElementById('userFormError');
        if (errorElement) errorElement.style.display = 'none';
        
        try {
            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const role = document.getElementById('userRole').value;
            
            // Get selected properties
            const propertyAccess = [];
            const propertyCheckboxes = document.querySelectorAll('input[name="propertyAccess"]:checked');
            propertyCheckboxes.forEach(checkbox => {
                propertyAccess.push(checkbox.value);
            });
            
            // Validation
            if (role === 'manager' && propertyAccess.length === 0) {
                this.showError('userFormError', 'Please select at least one property for this manager');
                return;
            }
            
            // Create user data
            const userData = {
                email,
                password,
                firstName,
                lastName,
                role,
                propertyAccess,
                businessId: this.umbrellaManager.currentBusiness ? this.umbrellaManager.currentBusiness.id : null
            };
            
            // Create user
            await this.umbrellaManager.createUser(userData);
            
            // Reset form
            document.getElementById('addUserForm').reset();
            
            // Show users list
            const tabButtons = document.querySelectorAll('#userManagementModal .tab-button');
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === 'users-list') {
                    button.click();
                }
            });
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('User created successfully', 'success');
            } else {
                alert('User created successfully');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            this.showError('userFormError', error.message);
        }
    }
    
    /**
     * Handle add business form submission
     */
    async handleAddBusiness() {
        const errorElement = document.getElementById('businessFormError');
        if (errorElement) errorElement.style.display = 'none';
        
        try {
            // Get form values
            const companyName = document.getElementById('companyName').value;
            const businessType = document.getElementById('businessType').value;
            const companyEmail = document.getElementById('companyEmail').value;
            const companyPhone = document.getElementById('companyPhone').value;
            
            // Create business data
            const businessData = {
                companyName,
                businessType,
                companyEmail,
                companyPhone
            };
            
            // Create business
            await this.umbrellaManager.createBusiness(businessData);
            
            // Reset form
            document.getElementById('addBusinessForm').reset();
            
            // Show business info
            const tabButtons = document.querySelectorAll('#businessManagementModal .tab-button');
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === 'business-info') {
                    button.click();
                }
            });
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Business created successfully', 'success');
            } else {
                alert('Business created successfully');
            }
        } catch (error) {
            console.error('Error creating business:', error);
            this.showError('businessFormError', error.message);
        }
    }
    
    /**
     * Handle edit business form submission
     */
    async handleEditBusiness() {
        const errorElement = document.getElementById('editBusinessFormError');
        if (errorElement) errorElement.style.display = 'none';
        
        try {
            // Get current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                this.showError('editBusinessFormError', 'No business selected');
                return;
            }
            
            // Get form values
            const companyName = document.getElementById('editCompanyName').value;
            const businessType = document.getElementById('editBusinessType').value;
            const companyEmail = document.getElementById('editCompanyEmail').value;
            const companyPhone = document.getElementById('editCompanyPhone').value;
            
            // Update business
            await window.firebaseManager.db.collection('businesses').doc(currentBusiness.id).update({
                companyName,
                businessType,
                companyEmail,
                companyPhone,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update local state
            this.umbrellaManager.setCurrentBusiness(currentBusiness.id, {
                ...currentBusiness,
                companyName,
                businessType,
                companyEmail,
                companyPhone
            });
            
            // Show business info
            const tabButtons = document.querySelectorAll('#businessManagementModal .tab-button');
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === 'business-info') {
                    button.click();
                }
            });
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Business updated successfully', 'success');
            } else {
                alert('Business updated successfully');
            }
        } catch (error) {
            console.error('Error updating business:', error);
            this.showError('editBusinessFormError', error.message);
        }
    }
    
    /**
     * Switch to a property
     * @param {string} propertyId - Property ID
     */
    async switchToProperty(propertyId) {
        try {
            await this.umbrellaManager.switchProperty(propertyId);
            this.closePropertyModal();
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Switched to property successfully', 'success');
            }
        } catch (error) {
            console.error('Error switching property:', error);
            alert('Error switching property: ' + error.message);
        }
    }
    
    /**
     * Edit property
     * @param {string} propertyId - Property ID
     */
    editProperty(propertyId) {
        // To be implemented
        alert('Edit property functionality coming soon!');
    }
    
    /**
     * Delete property
     * @param {string} propertyId - Property ID
     */
    async deleteProperty(propertyId) {
        if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
        
        try {
            // Get property data
            const propertyDoc = await window.firebaseManager.db.collection('properties').doc(propertyId).get();
            if (!propertyDoc.exists) throw new Error('Property not found');
            
            const propertyData = propertyDoc.data();
            
            // Prevent deleting main property
            if (propertyData.isMainProperty) {
                alert('Cannot delete the main property. Please set another property as main first.');
                return;
            }
            
            // Check if this is the current property
            if (this.umbrellaManager.currentProperty && this.umbrellaManager.currentProperty.id === propertyId) {
                // Switch to another property first
                const businessId = this.umbrellaManager.currentBusiness.id;
                await this.umbrellaManager.switchBusiness(businessId);
            }
            
            // Update business document to remove property reference
            await window.firebaseManager.db.collection('businesses').doc(propertyData.business).update({
                properties: firebase.firestore.FieldValue.arrayRemove(propertyId)
            });
            
            // Remove property access from users
            const usersSnapshot = await window.firebaseManager.db.collection('users')
                .where('propertyAccess', 'array-contains', propertyId)
                .get();
            
            const userUpdatePromises = [];
            usersSnapshot.forEach(doc => {
                userUpdatePromises.push(
                    window.firebaseManager.db.collection('users').doc(doc.id).update({
                        propertyAccess: firebase.firestore.FieldValue.arrayRemove(propertyId)
                    })
                );
            });
            
            await Promise.all(userUpdatePromises);
            
            // Delete property document
            await window.firebaseManager.db.collection('properties').doc(propertyId).delete();
            
            // Refresh properties list
            this.loadProperties();
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Property deleted successfully', 'success');
            } else {
                alert('Property deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Error deleting property: ' + error.message);
        }
    }
    
    /**
     * Edit user
     * @param {string} userId - User ID
     */
    editUser(userId) {
        // To be implemented
        alert('Edit user functionality coming soon!');
    }
    
    /**
     * Delete user
     * @param {string} userId - User ID
     */
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            // Delete user document
            await window.firebaseManager.db.collection('users').doc(userId).delete();
            
            // Note: This doesn't delete the actual Firebase Auth user
            // For full deletion, we would need a Firebase function to handle that
            
            // Refresh users list
            this.loadUsers();
            
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('User deleted successfully', 'success');
            } else {
                alert('User deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
        }
    }
    
    /**
     * Update property access visibility based on role
     * @param {string} role - User role
     */
    updatePropertyAccessVisibility(role) {
        const container = document.getElementById('propertyAccessContainer');
        if (!container) return;
        
        if (role === 'manager' || role === 'employee') {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
    
    /**
     * Show error message
     * @param {string} elementId - Error element ID
     * @param {string} message - Error message
     */
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (!errorElement) return;
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
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
                return 'Employee';
            default:
                return role.charAt(0).toUpperCase() + role.slice(1);
        }
    }
    
    /**
     * Format business type for display
     * @param {string} type - Business type
     * @returns {string} - Formatted business type
     */
    formatBusinessType(type) {
        switch (type) {
            case 'restaurant':
                return 'Restaurant';
            case 'hotel':
                return 'Hotel';
            case 'retail':
                return 'Retail';
            case 'service':
                return 'Service';
            default:
                return type.charAt(0).toUpperCase() + type.slice(1);
        }
    }
}

// Add global functions to open account management modals
window.openPropertyManagement = () => {
    if (window.accountManagement) {
        window.accountManagement.showPropertyModal();
    }
};

window.openUserManagement = () => {
    if (window.accountManagement) {
        window.accountManagement.showUserModal();
    }
};

window.openBusinessManagement = () => {
    if (window.accountManagement) {
        window.accountManagement.showBusinessModal();
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the account management with a delay to ensure umbrella manager is loaded
    setTimeout(() => {
        window.accountManagement = new AccountManagement(window.umbrellaManager);
    }, 2000);
});

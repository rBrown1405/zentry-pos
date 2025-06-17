/**
 * User Management UI Module
 * Provides UI components and functionality for managing users in the umbrella account system
 */
class UserManager {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        this.users = [];
        this.properties = [];
        
        // Check if dependencies are loaded
        this.checkDependencies();
    }
    
    /**
     * Initialize the user manager
     */
    initialize() {
        // Create user management UI
        this.createUserManagementModal();
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
     * Create user management modal HTML
     */
    createUserManagementModal() {
        // Check if modal already exists
        if (document.getElementById('userManagementModal')) return;
        
        // Create modal element
        const modalHtml = `
            <div id="userManagementModal" class="modal-overlay">
                <div class="modal-content user-management">
                    <div class="modal-header">
                        <h3>User Management</h3>
                        <button class="close-button" onclick="window.userManager.closeUserModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="userList">Users</button>
                            <button class="tab-btn" data-tab="createUser">Create User</button>
                        </div>
                        
                        <div id="userList" class="tab-content active">
                            <div class="search-bar">
                                <input type="text" id="userSearchInput" placeholder="Search users..." class="search-input">
                            </div>
                            <div class="user-list" id="usersList">
                                <div class="loader">Loading users...</div>
                            </div>
                        </div>
                        
                        <div id="createUser" class="tab-content">
                            <form id="createUserForm">
                                <div class="form-row">
                                    <div class="form-group half">
                                        <label for="firstName">First Name *</label>
                                        <input type="text" id="firstName" class="form-control" required>
                                    </div>
                                    
                                    <div class="form-group half">
                                        <label for="lastName">Last Name *</label>
                                        <input type="text" id="lastName" class="form-control" required>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="email">Email Address *</label>
                                    <input type="email" id="email" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="password">Password *</label>
                                    <input type="password" id="password" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="role">Role *</label>
                                    <select id="role" class="form-control" required>
                                        <option value="">Select a role</option>
                                        <option value="manager">Manager</option>
                                        <option value="employee">Employee</option>
                                    </select>
                                </div>
                                
                                <div class="form-group" id="propertySelectorGroup">
                                    <label>Property Access *</label>
                                    <div id="propertiesCheckboxes" class="checkbox-group">
                                        <div class="loader">Loading properties...</div>
                                    </div>
                                </div>
                                
                                <div id="createUserError" class="error-message" style="display: none;"></div>
                                
                                <div class="form-actions">
                                    <button type="button" class="cancel-button" onclick="window.userManager.switchTab('userList')">Cancel</button>
                                    <button type="submit" class="primary-button">Create User</button>
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
        if (document.getElementById('userManagerStyles')) return;
        
        const styles = `
            /* User Management Modal Styles */
            .user-management {
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
            }
            
            .user-management .modal-body {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                flex: 1;
            }
            
            .checkbox-group {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #e2e8f0;
                padding: 0.5rem;
                border-radius: 4px;
                margin-top: 0.25rem;
            }
            
            .checkbox-item {
                display: flex;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid #f7fafc;
            }
            
            .checkbox-item:last-child {
                border-bottom: none;
            }
            
            .checkbox-item input {
                margin-right: 0.5rem;
            }
            
            /* User list styles */
            .user-list {
                flex: 1;
                overflow-y: auto;
            }
            
            .user-card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                padding: 1rem;
                margin-bottom: 1rem;
                transition: all 0.2s ease;
            }
            
            .user-card:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .user-card h4 {
                margin-top: 0;
                margin-bottom: 0.25rem;
                font-size: 1.1rem;
            }
            
            .user-card .user-email {
                color: #718096;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .user-card .user-role {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 500;
                margin-right: 0.5rem;
            }
            
            .user-card .role-employee {
                background: #e2e8f0;
                color: #4a5568;
            }
            
            .user-card .role-manager {
                background: #bee3f8;
                color: #2b6cb0;
            }
            
            .user-card .role-owner {
                background: #feebc8;
                color: #c05621;
            }
            
            .user-card .role-super_admin {
                background: #fed7d7;
                color: #c53030;
            }
            
            .user-card .user-properties {
                margin-top: 0.75rem;
                font-size: 0.9rem;
            }
            
            .user-card .property-tag {
                display: inline-block;
                background: #f7fafc;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                margin-right: 0.25rem;
                margin-bottom: 0.25rem;
                font-size: 0.8rem;
            }
            
            .user-card .user-actions {
                margin-top: 0.75rem;
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
            }
            
            .user-actions button {
                padding: 0.25rem 0.5rem;
                font-size: 0.8rem;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #cbd5e0;
                background: white;
            }
            
            .user-actions button.edit-btn {
                background: #4299e1;
                color: white;
                border: none;
            }
            
            .user-actions button.delete-btn {
                background: #f56565;
                color: white;
                border: none;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'userManagerStyles';
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
        
        // Create user form
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleCreateUser();
            });
        }
        
        // Role selector
        const roleSelector = document.getElementById('role');
        if (roleSelector) {
            roleSelector.addEventListener('change', () => {
                // Update UI based on selected role
                this.updateRolePermissions(roleSelector.value);
            });
        }
        
        // User search
        const searchInput = document.getElementById('userSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterUsers(searchInput.value);
            });
        }
    }
    
    /**
     * Update UI based on selected role
     * @param {string} role - Selected role
     */
    updateRolePermissions(role) {
        const propertySelectorGroup = document.getElementById('propertySelectorGroup');
        
        // Show/hide property selector based on role
        if (propertySelectorGroup) {
            if (role === 'super_admin' || role === 'owner') {
                propertySelectorGroup.style.display = 'none';
            } else {
                propertySelectorGroup.style.display = 'block';
                this.loadProperties(); // Load properties for selection
            }
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
        
        // Load data based on active tab
        if (tabId === 'userList') {
            this.loadUsers();
        } else if (tabId === 'createUser') {
            this.loadProperties();
        }
    }
    
    /**
     * Show user management modal
     */
    showUserModal() {
        const modal = document.getElementById('userManagementModal');
        if (!modal) {
            this.createUserManagementModal();
            setTimeout(() => this.showUserModal(), 100);
            return;
        }
        
        // Show modal
        modal.classList.add('active');
        
        // Load users
        this.loadUsers();
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
     * Load users for the current business
     */
    async loadUsers() {
        try {
            const usersList = document.getElementById('usersList');
            if (!usersList) return;
            
            // Show loading state
            usersList.innerHTML = '<div class="loader">Loading users...</div>';
            
            // Get current business
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) {
                usersList.innerHTML = '<div class="no-results">No business selected</div>';
                return;
            }
            
            // Get users for current business from Firebase
            const db = window.firebaseServices.getDb();
            const usersRef = await db.collection('users')
                .where('businessId', '==', currentBusiness.id)
                .get();
                
            // Load properties for mapping
            await this.loadProperties(false);
                
            // Process users
            this.users = usersRef.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Render users
            this.renderUsers(this.users);
        } catch (error) {
            console.error('Error loading users:', error);
            const usersList = document.getElementById('usersList');
            if (usersList) {
                usersList.innerHTML = '<div class="error-message">Error loading users</div>';
            }
        }
    }
    
    /**
     * Load properties for the current business
     * @param {boolean} renderCheckboxes - Whether to render checkboxes
     */
    async loadProperties(renderCheckboxes = true) {
        try {
            // Get properties from umbrella manager
            const currentBusiness = this.umbrellaManager.currentBusiness;
            if (!currentBusiness) return;
            
            this.properties = await this.umbrellaManager.getPropertiesForBusiness(currentBusiness.id);
            
            // Render property checkboxes if needed
            if (renderCheckboxes) {
                this.renderPropertyCheckboxes();
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            const checkboxContainer = document.getElementById('propertiesCheckboxes');
            if (checkboxContainer) {
                checkboxContainer.innerHTML = '<div class="error-message">Error loading properties</div>';
            }
        }
    }
    
    /**
     * Render property checkboxes
     */
    renderPropertyCheckboxes() {
        const checkboxContainer = document.getElementById('propertiesCheckboxes');
        if (!checkboxContainer) return;
        
        // Check if there are properties
        if (!this.properties || this.properties.length === 0) {
            checkboxContainer.innerHTML = '<div class="no-results">No properties available</div>';
            return;
        }
        
        // Clear existing content
        checkboxContainer.innerHTML = '';
        
        // Render checkboxes for each property
        this.properties.forEach(property => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            checkboxItem.innerHTML = `
                <input type="checkbox" id="property_${property.id}" name="propertyAccess" value="${property.id}">
                <label for="property_${property.id}">${property.propertyName}</label>
            `;
            
            checkboxContainer.appendChild(checkboxItem);
        });
    }
    
    /**
     * Render users in the list
     * @param {Array} users - List of users
     */
    renderUsers(users) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        // Check if there are users
        if (!users || users.length === 0) {
            usersList.innerHTML = '<div class="no-results">No users found</div>';
            return;
        }
        
        // Clear existing content
        usersList.innerHTML = '';
        
        // Get current user ID
        const currentUser = this.umbrellaManager.firebaseManager.getCurrentUser();
        const currentUserId = currentUser ? currentUser.uid : null;
        
        // Render each user
        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            
            // Map property IDs to names
            const propertyNames = this.mapPropertyIdsToNames(user.propertyAccess || []);
            
            userCard.innerHTML = `
                <h4>${user.firstName} ${user.lastName}</h4>
                <div class="user-email">${user.email}</div>
                <div class="user-role role-${user.role}">${this.formatRole(user.role)}</div>
                ${propertyNames.length > 0 ? `
                    <div class="user-properties">
                        <div>Properties: ${this.renderPropertyTags(propertyNames)}</div>
                    </div>
                ` : ''}
                ${user.id !== currentUserId ? `
                    <div class="user-actions">
                        <button class="edit-btn" data-id="${user.id}">Edit</button>
                        <button class="delete-btn" data-id="${user.id}">Delete</button>
                    </div>
                ` : '<div class="user-actions"><span class="current-user-label">Current User</span></div>'}
            `;
            
            // Add event listeners
            const editBtn = userCard.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.editUser(user.id);
                });
            }
            
            const deleteBtn = userCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.confirmDeleteUser(user.id, `${user.firstName} ${user.lastName}`);
                });
            }
            
            usersList.appendChild(userCard);
        });
    }
    
    /**
     * Map property IDs to names
     * @param {Array} propertyIds - Array of property IDs
     * @returns {Array} - Array of property names
     */
    mapPropertyIdsToNames(propertyIds) {
        if (!propertyIds || !this.properties) return [];
        
        return propertyIds.map(id => {
            const property = this.properties.find(p => p.id === id);
            return property ? property.propertyName : 'Unknown Property';
        });
    }
    
    /**
     * Render property tags HTML
     * @param {Array} propertyNames - Array of property names
     * @returns {string} - HTML for property tags
     */
    renderPropertyTags(propertyNames) {
        return propertyNames.map(name => `<span class="property-tag">${name}</span>`).join('');
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
                return role || 'Unknown';
        }
    }
    
    /**
     * Filter users by search term
     * @param {string} searchTerm - Search term
     */
    filterUsers(searchTerm) {
        if (!this.users) return;
        
        // Filter users by name or email
        const filtered = this.users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return fullName.includes(searchLower) || 
                   (user.email && user.email.toLowerCase().includes(searchLower)) ||
                   (user.username && user.username.toLowerCase().includes(searchLower));
        });
        
        // Render filtered users
        this.renderUsers(filtered);
    }
    
    /**
     * Handle create user form submission
     */
    async handleCreateUser() {
        try {
            const errorElement = document.getElementById('createUserError');
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
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.getElementById('role').value;
            
            // Validate required fields
            if (!firstName || !lastName || !email || !password || !role) {
                this.showError('All required fields must be filled');
                return;
            }
            
            // Get selected properties
            const propertyCheckboxes = document.querySelectorAll('input[name="propertyAccess"]:checked');
            const propertyAccess = Array.from(propertyCheckboxes).map(cb => cb.value);
            
            // Validate properties if not super_admin or owner
            if (role !== 'super_admin' && role !== 'owner' && propertyAccess.length === 0) {
                this.showError('Please select at least one property');
                return;
            }
            
            // Create user data object
            const userData = {
                firstName,
                lastName,
                email,
                password,
                role,
                businessId: currentBusiness.id,
                propertyAccess,
                accessLevel: role === 'super_admin' ? 'global' : 
                             role === 'owner' ? 'business' : 'property',
            };
            
            // Create user
            await this.umbrellaManager.createUser(userData);
            
            // Show success message and switch to user list
            if (typeof showNotification === 'function') {
                showNotification(`User "${firstName} ${lastName}" created successfully`, 'success');
            }
            
            // Reset form
            document.getElementById('createUserForm').reset();
            
            // Switch to user list tab
            this.switchTab('userList');
        } catch (error) {
            console.error('Error creating user:', error);
            this.showError(error.message || 'Failed to create user');
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorElement = document.getElementById('createUserError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    /**
     * Edit user
     * @param {string} userId - User ID
     */
    editUser(userId) {
        // TODO: Implement user editing functionality
        console.log(`Edit user ${userId}`);
        alert('User editing will be implemented in a future update.');
    }
    
    /**
     * Confirm user deletion
     * @param {string} userId - User ID
     * @param {string} userName - User name
     */
    confirmDeleteUser(userId, userName) {
        if (confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
            this.deleteUser(userId);
        }
    }
    
    /**
     * Delete user
     * @param {string} userId - User ID
     */
    async deleteUser(userId) {
        try {
            const db = window.firebaseServices.getDb();
            
            // Delete user document from Firestore
            await db.collection('users').doc(userId).delete();
            
            // TODO: Add Firebase function to delete authentication user
            
            // Show success notification
            if (typeof showNotification === 'function') {
                showNotification('User deleted successfully', 'success');
            }
            
            // Reload users
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error deleting user', 'error');
            }
        }
    }
}

// Add global function to show user management modal
window.showUserManagement = () => {
    if (window.userManager) {
        window.userManager.showUserModal();
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the user manager with a delay to ensure umbrella manager is loaded
    setTimeout(() => {
        window.userManager = new UserManager(window.umbrellaManager);
    }, 1500);
});

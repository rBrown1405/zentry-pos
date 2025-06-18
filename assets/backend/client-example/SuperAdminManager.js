/**
 * SuperAdminManager class for handling business management operations
 * This class uses the API Manager to communicate with the MongoDB backend
 */
import ApiManager from '../../js/api-manager.js';

class SuperAdminManager {
    constructor() {
        this.api = new ApiManager('http://localhost:3000/api');
    }

    /**
     * Login a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - User data with tokens
     */
    async login(email, password) {
        try {
            return await this.api.login(email, password);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout the current user
     */
    logout() {
        this.api.logout();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    isAuthenticated() {
        return this.api.isAuthenticated();
    }

    /**
     * Refresh the access token
     * @returns {Promise<string>} - New access token
     */
    async refreshAccessToken() {
        try {
            return await this.api.refreshAccessToken();
        } catch (error) {
            console.error('Error refreshing token:', error);
            // Force logout if refresh token is invalid
            this.logout();
            throw error;
        }
    }
    
    /**
     * Get the current user profile
     * @returns {Promise<Object>} - User profile data
     */
    async getUserProfile() {
        try {
            return await this.api.getUserProfile();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }
    
    /**
     * Get all businesses
     * @returns {Promise<Array>} - List of businesses
     */
    async getBusinesses() {
        try {
            return await this.api.getBusinesses();
        } catch (error) {
            console.error('Error getting businesses:', error);
            throw error;
        }
    }
    
    /**
     * Get business by ID
     * @param {string} id - Business ID
     * @returns {Promise<Object>} - Business data
     */
    async getBusiness(id) {
        try {
            return await this.api.getBusiness(id);
        } catch (error) {
            console.error(`Error getting business ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Create new business
     * @param {Object} businessData - Business data
     * @returns {Promise<Object>} - Created business
     */
    async createBusiness(businessData) {
        try {
            return await this.api.createBusiness(businessData);
        } catch (error) {
            console.error('Error creating business:', error);
            throw error;
        }
    }
    
    /**
     * Update business
     * @param {string} id - Business ID
     * @param {Object} businessData - Updated business data
     * @returns {Promise<Object>} - Updated business
     */
    async updateBusiness(id, businessData) {
        try {
            return await this.api.updateBusiness(id, businessData);
        } catch (error) {
            console.error(`Error updating business ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete business
     * @param {string} id - Business ID
     * @returns {Promise<void>}
     */
    async deleteBusiness(id) {
        try {
            return await this.api.deleteBusiness(id);
        } catch (error) {
            console.error(`Error deleting business ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Get all properties
     * @param {string} businessId - Optional business ID filter
     * @returns {Promise<Array>} - List of properties
     */
    async getProperties(businessId = null) {
        try {
            return await this.api.getProperties(businessId);
        } catch (error) {
            console.error('Error getting properties:', error);
            throw error;
        }
    }
    
    /**
     * Get property by ID
     * @param {string} id - Property ID
     * @returns {Promise<Object>} - Property data
     */
    async getProperty(id) {
        try {
            return await this.api.getProperty(id);
        } catch (error) {
            console.error(`Error getting property ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Create new property
     * @param {Object} propertyData - Property data
     * @returns {Promise<Object>} - Created property
     */
    async createProperty(propertyData) {
        try {
            return await this.api.createProperty(propertyData);
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }
    
    /**
     * Update property
     * @param {string} id - Property ID
     * @param {Object} propertyData - Updated property data
     * @returns {Promise<Object>} - Updated property
     */
    async updateProperty(id, propertyData) {
        try {
            return await this.api.updateProperty(id, propertyData);
        } catch (error) {
            console.error(`Error updating property ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete property
     * @param {string} id - Property ID
     * @returns {Promise<void>}
     */
    async deleteProperty(id) {
        try {
            return await this.api.deleteProperty(id);
        } catch (error) {
            console.error(`Error deleting property ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Assign property to business
     * @param {string} propertyId - Property ID
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Updated property
     */
    async assignPropertyToBusiness(propertyId, businessId) {
        try {
            return await this.api.assignPropertyToBusiness(propertyId, businessId);
        } catch (error) {
            console.error(`Error assigning property ${propertyId} to business ${businessId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get all users
     * @returns {Promise<Array>} - List of users
     */
    async getUsers() {
        try {
            return await this.api.getUsers();
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }
    
    /**
     * Get user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object>} - User data
     */
    async getUser(id) {
        try {
            return await this.api.getUser(id);
        } catch (error) {
            console.error(`Error getting user ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - Created user
     */
    async createUser(userData) {
        try {
            return await this.api.createUser(userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} - Updated user
     */
    async updateUser(id, userData) {
        try {
            return await this.api.updateUser(id, userData);
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete user
     * @param {string} id - User ID
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        try {
            return await this.api.deleteUser(id);
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Assign user to business
     * @param {string} userId - User ID
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Updated user
     */
    async assignUserToBusiness(userId, businessId) {
        try {
            return await this.api.assignUserToBusiness(userId, businessId);
        } catch (error) {
            console.error(`Error assigning user ${userId} to business ${businessId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get users by business
     * @param {string} businessId - Business ID
     * @returns {Promise<Array>} - List of users
     */
    async getUsersByBusiness(businessId) {
        try {
            return await this.api.getUsersByBusiness(businessId);
        } catch (error) {
            console.error(`Error getting users for business ${businessId}:`, error);
            throw error;
        }
    }

    /**
     * Get all businesses from the API
     * @returns {Promise<Array>} - Array of businesses
     */
    async getBusinesses() {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/businesses`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch businesses');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error fetching businesses:', error);
            throw error;
        }
    }

    /**
     * Helper method to make authenticated fetch requests
     * @param {string} url - The URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     * @private
     */
    async _authenticatedFetch(url, options = {}) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }
        
        // Add authorization header
        const headers = {
            ...options.headers || {},
            'Authorization': `Bearer ${this.accessToken}`
        };
        
        // Make the request
        let response = await fetch(url, { ...options, headers });
        
        // If unauthorized, try to refresh token and retry
        if (response.status === 401 && this.refreshToken) {
            try {
                await this.refreshAccessToken();
                
                // Retry with new token
                headers.Authorization = `Bearer ${this.accessToken}`;
                response = await fetch(url, { ...options, headers });
            } catch (error) {
                console.error('Token refresh failed:', error);
                throw new Error('Authentication failed');
            }
        }
        
        return response;
    }
    
    /**
     * Create a new business
     * @param {Object} businessData - The business data to create
     * @returns {Promise<Object>} - The created business
     */
    async createBusiness(businessData) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/businesses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(businessData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create business');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error creating business:', error);
            throw error;
        }
    }

    /**
     * Get a specific business by ID
     * @param {string} businessId - The ID of the business to fetch
     * @returns {Promise<Object>} - The business data
     */
    async getBusiness(businessId) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/businesses/${businessId}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch business');
            }
            
            return result.data;
        } catch (error) {
            console.error(`Error fetching business ${businessId}:`, error);
            throw error;
        }
    }

    /**
     * Update a business
     * @param {string} businessId - The ID of the business to update 
     * @param {Object} businessData - The updated business data
     * @returns {Promise<Object>} - The updated business
     */
    async updateBusiness(businessId, businessData) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/businesses/${businessId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(businessData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to update business');
            }
            
            return result.data;
        } catch (error) {
            console.error(`Error updating business ${businessId}:`, error);
            throw error;
        }
    }

    /**
     * Delete a business
     * @param {string} businessId - The ID of the business to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deleteBusiness(businessId) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/businesses/${businessId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to delete business');
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting business ${businessId}:`, error);
            throw error;
        }
    }

    /**
     * Get current user profile
     * @returns {Promise<Object>} - User data
     */
    async getUserProfile() {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/auth/me`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch user profile');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Create a new property for a business
     * @param {Object} propertyData - The property data including businessId
     * @returns {Promise<Object>} - The created property
     */
    async createProperty(propertyData) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create property');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    /**
     * Get all properties for a business
     * @param {string} businessId - The ID of the business
     * @returns {Promise<Array>} - Array of properties
     */
    async getProperties(businessId) {
        try {
            // The API will filter by business ID on the server side
            const response = await this._authenticatedFetch(
                `${this.apiUrl}/properties${businessId ? `?business=${businessId}` : ''}`
            );
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch properties');
            }
            
            return result.data;
        } catch (error) {
            console.error(`Error fetching properties for business ${businessId}:`, error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Created user
     */
    async registerUser(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to register user');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    /**
     * Get all users
     * @returns {Promise<Array>} - List of users
     */
    async getUsers() {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/users`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to get users');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    /**
     * Get a specific user by ID
     * @param {string} userId - The ID of the user to fetch
     * @returns {Promise<Object>} - The user data
     */
    async getUser(userId) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/users/${userId}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to get user');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - The user data to create
     * @returns {Promise<Object>} - The created user
     */
    async createUser(userData) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create user');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Update an existing user
     * @param {string} userId - The ID of the user to update
     * @param {Object} userData - The updated user data
     * @returns {Promise<Object>} - The updated user
     */
    async updateUser(userId, userData) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to update user');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete a user
     * @param {string} userId - The ID of the user to delete
     * @returns {Promise<Object>} - Success message
     */
    async deleteUser(userId) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/users/${userId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to delete user');
            }
            
            return result;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Assign a user to a business
     * @param {string} userId - The ID of the user
     * @param {string} businessId - The ID of the business
     * @returns {Promise<Object>} - The updated user
     */
    async assignUserToBusiness(userId, businessId) {
        try {
            const response = await this._authenticatedFetch(`${this.apiUrl}/users/${userId}/assign-business`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ businessId })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to assign user to business');
            }
            
            return result.data;
        } catch (error) {
            console.error('Error assigning user to business:', error);
            throw error;
        }
    }
}

// Export the class for use in other modules
export default SuperAdminManager;

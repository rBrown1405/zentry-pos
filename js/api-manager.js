/**
 * API Manager for Zentry POS System
 * Handles all API requests to the backend server
 */
class ApiManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.accessToken = localStorage.getItem('accessToken') || null;
        this.refreshToken = localStorage.getItem('refreshToken') || null;
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    /**
     * Check if the user is authenticated
     * @returns {boolean} - True if authenticated
     */
    isAuthenticated() {
        return this.accessToken !== null;
    }

    /**
     * Get the current user's role
     * @returns {string|null} - User role or null if not authenticated
     */
    getUserRole() {
        return this.user ? this.user.role : null;
    }

    /**
     * Get the current user's information
     * @returns {Object|null} - User object or null if not authenticated
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     */
    async _authenticatedFetch(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.accessToken) {
            headers.Authorization = `Bearer ${this.accessToken}`;
        }

        let response = await fetch(url, { ...options, headers });

        // If token is expired (401 Unauthorized), try to refresh it
        if (response.status === 401 && this.refreshToken) {
            try {
                await this._refreshToken();
                
                // Retry with new token
                headers.Authorization = `Bearer ${this.accessToken}`;
                response = await fetch(url, { ...options, headers });
            } catch (error) {
                console.error('Token refresh failed:', error);
                this._handleAuthError();
                throw new Error('Authentication failed');
            }
        }
        
        return response;
    }

    /**
     * Refresh the access token
     */
    async _refreshToken() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to refresh token');
            }
            
            this.accessToken = data.data.accessToken;
            localStorage.setItem('accessToken', this.accessToken);
            
            return this.accessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this._handleAuthError();
            throw error;
        }
    }

    /**
     * Handle authentication errors
     */
    _handleAuthError() {
        // Clear authentication data
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login.html';
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Registration response
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }
            
            return data.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login response
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Store authentication data
            this.accessToken = data.data.accessToken;
            this.refreshToken = data.data.refreshToken;
            this.user = {
                id: data.data._id,
                username: data.data.username,
                email: data.data.email,
                role: data.data.role,
                business: data.data.business
            };
            
            localStorage.setItem('accessToken', this.accessToken);
            localStorage.setItem('refreshToken', this.refreshToken);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return this.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout the current user
     */
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    /**
     * Get user profile
     * @returns {Promise<Object>} - User profile data
     */
    async getProfile() {
        try {
            const response = await this._authenticatedFetch('/auth/me');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get profile');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    // Business APIs

    /**
     * Create a new business
     * @param {Object} businessData - Business data
     * @returns {Promise<Object>} - Created business
     */
    async createBusiness(businessData) {
        try {
            const response = await this._authenticatedFetch('/businesses', {
                method: 'POST',
                body: JSON.stringify(businessData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to create business');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error creating business:', error);
            throw error;
        }
    }

    /**
     * Get all businesses
     * @returns {Promise<Array>} - List of businesses
     */
    async getBusinesses() {
        try {
            const response = await this._authenticatedFetch('/businesses');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get businesses');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting businesses:', error);
            throw error;
        }
    }

    /**
     * Get a specific business
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Business data
     */
    async getBusiness(businessId) {
        try {
            const response = await this._authenticatedFetch(`/businesses/${businessId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get business');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting business:', error);
            throw error;
        }
    }

    /**
     * Update a business
     * @param {string} businessId - Business ID
     * @param {Object} businessData - Updated business data
     * @returns {Promise<Object>} - Updated business
     */
    async updateBusiness(businessId, businessData) {
        try {
            const response = await this._authenticatedFetch(`/businesses/${businessId}`, {
                method: 'PUT',
                body: JSON.stringify(businessData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update business');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error updating business:', error);
            throw error;
        }
    }

    /**
     * Delete a business
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Success response
     */
    async deleteBusiness(businessId) {
        try {
            const response = await this._authenticatedFetch(`/businesses/${businessId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete business');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting business:', error);
            throw error;
        }
    }

    // Property APIs

    /**
     * Create a new property
     * @param {Object} propertyData - Property data
     * @returns {Promise<Object>} - Created property
     */
    async createProperty(propertyData) {
        try {
            const response = await this._authenticatedFetch('/properties', {
                method: 'POST',
                body: JSON.stringify(propertyData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to create property');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    /**
     * Get all properties
     * @returns {Promise<Array>} - List of properties
     */
    async getProperties() {
        try {
            const response = await this._authenticatedFetch('/properties');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get properties');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting properties:', error);
            throw error;
        }
    }

    /**
     * Get a specific property
     * @param {string} propertyId - Property ID
     * @returns {Promise<Object>} - Property data
     */
    async getProperty(propertyId) {
        try {
            const response = await this._authenticatedFetch(`/properties/${propertyId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get property');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting property:', error);
            throw error;
        }
    }

    /**
     * Update a property
     * @param {string} propertyId - Property ID
     * @param {Object} propertyData - Updated property data
     * @returns {Promise<Object>} - Updated property
     */
    async updateProperty(propertyId, propertyData) {
        try {
            const response = await this._authenticatedFetch(`/properties/${propertyId}`, {
                method: 'PUT',
                body: JSON.stringify(propertyData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update property');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    /**
     * Delete a property
     * @param {string} propertyId - Property ID
     * @returns {Promise<Object>} - Success response
     */
    async deleteProperty(propertyId) {
        try {
            const response = await this._authenticatedFetch(`/properties/${propertyId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete property');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }

    // User APIs

    /**
     * Get all users
     * @returns {Promise<Array>} - List of users
     */
    async getUsers() {
        try {
            const response = await this._authenticatedFetch('/users');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get users');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    /**
     * Get a specific user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - User data
     */
    async getUser(userId) {
        try {
            const response = await this._authenticatedFetch(`/users/${userId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get user');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - Created user
     */
    async createUser(userData) {
        try {
            const response = await this._authenticatedFetch('/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to create user');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Update a user
     * @param {string} userId - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} - Updated user
     */
    async updateUser(userId, userData) {
        try {
            const response = await this._authenticatedFetch(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update user');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Success response
     */
    async deleteUser(userId) {
        try {
            const response = await this._authenticatedFetch(`/users/${userId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete user');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Assign a user to a business
     * @param {string} userId - User ID
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Updated user
     */
    async assignUserToBusiness(userId, businessId) {
        try {
            const response = await this._authenticatedFetch(`/users/${userId}/assign-business`, {
                method: 'PUT',
                body: JSON.stringify({ businessId })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to assign user to business');
            }
            
            return data.data;
        } catch (error) {
            console.error('Error assigning user to business:', error);
            throw error;
        }
    }
}

// Export the ApiManager class
window.ApiManager = ApiManager;

/**
 * API Manager for Zentry POS System
 * Handles authentication and API requests to the backend server
 */
class ApiManager {
    constructor(apiUrl = 'http://localhost:3000/api') {
        this.apiUrl = apiUrl;
        this.accessToken = localStorage.getItem('accessToken') || null;
        this.refreshToken = localStorage.getItem('refreshToken') || null;
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.refreshPromise = null;
        
        // Auto refresh setup - refresh token before it expires
        this._setupTokenRefresh();
    }

    /**
     * Setup auto token refresh
     * @private
     */
    _setupTokenRefresh() {
        // Clear any existing refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // If we have an access token, set up a refresh interval (45 minutes)
        if (this.accessToken) {
            // Refresh every 45 minutes (token expires in 1 hour)
            this.refreshInterval = setInterval(() => {
                this.refreshAccessToken().catch(err => {
                    console.error('Auto refresh token failed:', err);
                    // If refresh fails, clear the interval and log out
                    this.logout();
                });
            }, 45 * 60 * 1000); // 45 minutes
        }
    }

    /**
     * Make authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @param {boolean} requireAuth - Whether request requires authentication
     * @param {boolean} retry - Whether this is a retry after refreshing the token
     * @returns {Promise<Object>} - API response
     */
    async request(endpoint, options = {}, requireAuth = true, retry = true) {
        const url = `${this.apiUrl}${endpoint}`;
        
        // Set up headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add auth header if required
        if (requireAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        
        // Add CSRF token header if it exists
        const csrfToken = this._getCsrfToken();
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            const result = await response.json();
            
            // If unauthorized and retry is allowed, try to refresh the token
            if (response.status === 401 && retry && requireAuth && this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    // Retry the request with the new token
                    return this.request(endpoint, options, requireAuth, false);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    this.logout();
                    throw new Error('Authentication failed. Please login again.');
                }
            }
            
            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }
            
            return result.data;
        } catch (error) {
            console.error(`API request error (${endpoint}):`, error);
            throw error;
        }
    }
    
    /**
     * Get CSRF token from cookies
     * @returns {string|null} - CSRF token or null
     * @private
     */
    _getCsrfToken() {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return value;
            }
        }
        return null;
    }
    
    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - User data
     */
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }, false);
    }
    
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - User data with tokens
     */
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }, false);
        
        // Store tokens and user data
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.user = {
            id: data._id,
            username: data.username,
            email: data.email,
            role: data.role,
            business: data.business
        };
        
        // Save to localStorage
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        // Set up token refresh
        this._setupTokenRefresh();
        
        return this.user;
    }
    
    /**
     * Logout user
     */
    logout() {
        // Clear tokens and user data
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Clear refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    /**
     * Refresh access token
     * @returns {Promise<string>} - New access token
     */
    async refreshAccessToken() {
        // If a refresh is already in progress, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        
        // Create a new refresh promise
        this.refreshPromise = new Promise(async (resolve, reject) => {
            try {
                if (!this.refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                const response = await fetch(`${this.apiUrl}/auth/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken: this.refreshToken })
                });
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Failed to refresh token');
                }
                
                // Update access token
                this.accessToken = result.data.accessToken;
                localStorage.setItem('accessToken', this.accessToken);
                
                resolve(this.accessToken);
            } catch (error) {
                console.error('Error refreshing token:', error);
                
                // Force logout if refresh token is invalid
                this.logout();
                reject(error);
            } finally {
                // Clear the refresh promise
                this.refreshPromise = null;
            }
        });
        
        return this.refreshPromise;
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    isAuthenticated() {
        return this.accessToken !== null;
    }
    
    /**
     * Get current user profile
     * @returns {Promise<Object>} - User profile data
     */
    async getUserProfile() {
        return this.request('/auth/me');
    }
    
    // Business Management APIs
    
    /**
     * Get all businesses
     * @returns {Promise<Array>} - List of businesses
     */
    async getBusinesses() {
        return this.request('/businesses');
    }
    
    /**
     * Get business by ID
     * @param {string} id - Business ID
     * @returns {Promise<Object>} - Business data
     */
    async getBusiness(id) {
        return this.request(`/businesses/${id}`);
    }
    
    /**
     * Create new business
     * @param {Object} businessData - Business data
     * @returns {Promise<Object>} - Created business
     */
    async createBusiness(businessData) {
        return this.request('/businesses', {
            method: 'POST',
            body: JSON.stringify(businessData)
        });
    }
    
    /**
     * Update business
     * @param {string} id - Business ID
     * @param {Object} businessData - Updated business data
     * @returns {Promise<Object>} - Updated business
     */
    async updateBusiness(id, businessData) {
        return this.request(`/businesses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(businessData)
        });
    }
    
    /**
     * Delete business
     * @param {string} id - Business ID
     * @returns {Promise<void>}
     */
    async deleteBusiness(id) {
        return this.request(`/businesses/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Property Management APIs
    
    /**
     * Get all properties
     * @param {string} businessId - Optional business ID filter
     * @returns {Promise<Array>} - List of properties
     */
    async getProperties(businessId = null) {
        const endpoint = businessId ? 
            `/businesses/${businessId}/properties` : 
            '/properties';
        return this.request(endpoint);
    }
    
    /**
     * Get property by ID
     * @param {string} id - Property ID
     * @returns {Promise<Object>} - Property data
     */
    async getProperty(id) {
        return this.request(`/properties/${id}`);
    }
    
    /**
     * Create new property
     * @param {Object} propertyData - Property data
     * @returns {Promise<Object>} - Created property
     */
    async createProperty(propertyData) {
        return this.request('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
    }
    
    /**
     * Update property
     * @param {string} id - Property ID
     * @param {Object} propertyData - Updated property data
     * @returns {Promise<Object>} - Updated property
     */
    async updateProperty(id, propertyData) {
        return this.request(`/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(propertyData)
        });
    }
    
    /**
     * Delete property
     * @param {string} id - Property ID
     * @returns {Promise<void>}
     */
    async deleteProperty(id) {
        return this.request(`/properties/${id}`, {
            method: 'DELETE'
        });
    }
    
    /**
     * Assign property to business
     * @param {string} propertyId - Property ID
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Updated property
     */
    async assignPropertyToBusiness(propertyId, businessId) {
        return this.request(`/properties/${propertyId}/assign-business`, {
            method: 'PUT',
            body: JSON.stringify({ businessId })
        });
    }
    
    // User Management APIs
    
    /**
     * Get all users
     * @returns {Promise<Array>} - List of users
     */
    async getUsers() {
        return this.request('/users');
    }
    
    /**
     * Get user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object>} - User data
     */
    async getUser(id) {
        return this.request(`/users/${id}`);
    }
    
    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - Created user
     */
    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} - Updated user
     */
    async updateUser(id, userData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
    
    /**
     * Delete user
     * @param {string} id - User ID
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }
    
    /**
     * Assign user to business
     * @param {string} userId - User ID
     * @param {string} businessId - Business ID
     * @returns {Promise<Object>} - Updated user
     */
    async assignUserToBusiness(userId, businessId) {
        return this.request(`/users/${userId}/assign-business`, {
            method: 'PUT',
            body: JSON.stringify({ businessId })
        });
    }
    
    /**
     * Get users by business
     * @param {string} businessId - Business ID
     * @returns {Promise<Array>} - List of users
     */
    async getUsersByBusiness(businessId) {
        return this.request(`/businesses/${businessId}/users`);
    }
    
    /**
     * Legacy support - load data from localStorage if available
     * @returns {Object|null} - Local storage data or null
     * @private
     */
    _getLocalStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error parsing localStorage data (${key}):`, error);
            return null;
        }
    }
}

export default ApiManager;
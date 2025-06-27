/**
 * Firebase Service Manager for Zentry POS System
 * Handles all Firebase interactions for authentication, database, and storage
 */
class FirebaseManager {
  constructor() {
    // Verify Firebase services are available
    if (!window.firebaseServices) {
      throw new Error('Firebase services not available');
    }
    
    // Get Firebase services with validation
    this.app = window.firebaseServices.getApp();
    this.auth = window.firebaseServices.getAuth();
    this.db = window.firebaseServices.getDb();
    this.storage = window.firebaseServices.getStorage(); // Can be null
    
    // Validate essential services
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }
    
    console.log('FirebaseManager initialized with services:', {
      auth: !!this.auth,
      db: !!this.db,
      storage: !!this.storage
    });
    
    // User information - Firebase only, no localStorage
    this.user = null;
    
    // Set up auth state change listener
    this.auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: user.customClaims ? user.customClaims.role : 'employee' // Default role
        };
        
        console.log('User signed in:', this.user.email);
      } else {
        // User is signed out
        this.user = null;
        console.log('User signed out');
      }
    });
  }
  
  /**
   * Check if the user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return this.auth.currentUser !== null;
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
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise resolving to user credentials
   */
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      // Store role information
      this.user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        role: idTokenResult.claims.role || 'employee'
      };
      
      console.log('User logged in successfully:', this.user.email);
      return this.user;
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  }
  
  /**
   * Log out the current user
   * @returns {Promise} - Promise resolving to void
   */
  async logout() {
    try {
      await this.auth.signOut();
      this.user = null;
      console.log('User logged out successfully');
    } catch (error) {
      console.error("Logout failed:", error.message);
      throw error;
    }
  }
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise} - Promise resolving to user credentials
   */
  async register(email, password, userData = {}) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Update profile
      if (userData.displayName) {
        await userCredential.user.updateProfile({
          displayName: userData.displayName,
          photoURL: userData.photoURL || null
        });
      }
      
      // Store additional user data in Firestore
      await this.db.collection('users').doc(userCredential.user.uid).set({
        email: email,
        displayName: userData.displayName || '',
        role: userData.role || 'employee',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...userData
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Registration failed:", error.message);
      throw error;
    }
  }
  
  // Menu Items CRUD Operations
  
  /**
   * Get all menu items
   * @returns {Promise<Array>} - Promise resolving to array of menu items
   */
  async getMenuItems() {
    try {
      const menuSnapshot = await this.db.collection('menu_items').get();
      return menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      throw error;
    }
  }
  
  /**
   * Add a new menu item
   * @param {Object} menuItem - Menu item data
   * @returns {Promise<string>} - Promise resolving to created document ID
   */
  async addMenuItem(menuItem) {
    try {
      const docRef = await this.db.collection('menu_items').add({
        ...menuItem,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to add menu item:", error);
      throw error;
    }
  }
  
  /**
   * Update a menu item
   * @param {string} id - Menu item ID
   * @param {Object} menuItemData - Updated menu item data
   * @returns {Promise<void>}
   */
  async updateMenuItem(id, menuItemData) {
    try {
      await this.db.collection('menu_items').doc(id).update({
        ...menuItemData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to update menu item:", error);
      throw error;
    }
  }
  
  /**
   * Delete a menu item
   * @param {string} id - Menu item ID
   * @returns {Promise<void>}
   */
  async deleteMenuItem(id) {
    try {
      await this.db.collection('menu_items').doc(id).delete();
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      throw error;
    }
  }
  
  // Tables management
  
  /**
   * Get all tables
   * @returns {Promise<Array>} - Promise resolving to array of tables
   */
  async getTables() {
    try {
      const tablesSnapshot = await this.db.collection('tables').get();
      return tablesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      throw error;
    }
  }
  
  /**
   * Add a new table
   * @param {Object} tableData - Table data
   * @returns {Promise<string>} - Promise resolving to created document ID
   */
  async addTable(tableData) {
    try {
      const docRef = await this.db.collection('tables').add({
        ...tableData,
        status: tableData.status || 'available',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to add table:", error);
      throw error;
    }
  }
  
  /**
   * Update a table
   * @param {string} id - Table ID
   * @param {Object} tableData - Updated table data
   * @returns {Promise<void>}
   */
  async updateTable(id, tableData) {
    try {
      await this.db.collection('tables').doc(id).update({
        ...tableData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to update table:", error);
      throw error;
    }
  }
  
  // Orders management
  
  /**
   * Get all orders
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Promise resolving to array of orders
   */
  async getOrders(options = {}) {
    try {
      let query = this.db.collection('orders');
      
      if (options.status) {
        query = query.where('status', '==', options.status);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const ordersSnapshot = await query.orderBy('createdAt', 'desc').get();
      return ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  }
  
  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} - Promise resolving to order data
   */
  async getOrderById(id) {
    try {
      const orderDoc = await this.db.collection('orders').doc(id).get();
      if (!orderDoc.exists) {
        throw new Error(`Order with ID ${id} not found`);
      }
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      };
    } catch (error) {
      console.error("Failed to fetch order:", error);
      throw error;
    }
  }
  
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<string>} - Promise resolving to created document ID
   */
  async createOrder(orderData) {
    try {
      // Add a new order
      const orderRef = await this.db.collection('orders').add({
        ...orderData,
        status: orderData.status || 'new',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // If order is associated with a table, update table status
      if (orderData.tableId) {
        await this.db.collection('tables').doc(orderData.tableId).update({
          status: 'occupied',
          currentOrderId: orderRef.id,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return orderRef.id;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }
  
  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  async updateOrderStatus(id, status) {
    try {
      await this.db.collection('orders').doc(id).update({
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // If order is completed or cancelled, update table status
      const orderDoc = await this.db.collection('orders').doc(id).get();
      const orderData = orderDoc.data();
      
      if ((status === 'completed' || status === 'cancelled') && orderData.tableId) {
        await this.db.collection('tables').doc(orderData.tableId).update({
          status: 'available',
          currentOrderId: null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  }
  
  // Real-time listeners
  
  /**
   * Listen to menu item changes
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  onMenuItemsChange(callback) {
    return this.db.collection('menu_items')
      .onSnapshot(snapshot => {
        const menuItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(menuItems);
      }, error => {
        console.error("Menu items listener error:", error);
      });
  }
  
  /**
   * Listen to table changes
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  onTablesChange(callback) {
    return this.db.collection('tables')
      .onSnapshot(snapshot => {
        const tables = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(tables);
      }, error => {
        console.error("Tables listener error:", error);
      });
  }
  
  /**
   * Listen to order changes
   * @param {Function} callback - Callback function
   * @param {Object} options - Query options
   * @returns {Function} - Unsubscribe function
   */
  onOrdersChange(callback, options = {}) {
    let query = this.db.collection('orders');
    
    if (options.status) {
      query = query.where('status', '==', options.status);
    }
    
    return query.orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(orders);
      }, error => {
        console.error("Orders listener error:", error);
      });
  }
  
  /**
   * Upload an image to Firebase Storage
   * @param {File} file - Image file
   * @param {string} path - Path in storage
   * @returns {Promise<string>} - Promise resolving to download URL
   */
  async uploadImage(file, path = 'images') {
    try {
      const storageRef = this.storage.ref();
      const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
      
      // Upload file
      await fileRef.put(file);
      
      // Get download URL
      const downloadURL = await fileRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    }
  }
}

// Enhanced Firebase Manager initialization with better error handling
class FirebaseInitializer {
  constructor() {
    this.maxAttempts = 150; // 15 seconds max wait time
    this.attemptInterval = 100; // 100ms between attempts
    this.initialized = false;
    this.callbacks = [];
  }

  // Add callback to be executed when Firebase Manager is ready
  onReady(callback) {
    if (this.initialized && window.firebaseManager) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  // Check if Firebase services are ready using the new provider
  checkFirebaseServices() {
    try {
      // Check if Firebase provider is available
      if (!window.firebaseProvider) {
        return { ready: false, reason: 'firebaseProvider not available' };
      }

      // Check if provider is initialized
      if (!window.firebaseProvider.isReady()) {
        return { ready: false, reason: 'firebaseProvider not initialized' };
      }

      // Check if services are available
      if (!window.firebaseServices) {
        return { ready: false, reason: 'firebaseServices not available' };
      }

      const auth = window.firebaseServices.getAuth();
      const db = window.firebaseServices.getDb();

      if (!auth || !db) {
        return { ready: false, reason: 'auth or db services not initialized' };
      }

      // Additional check to ensure services are actually working
      if (typeof auth.onAuthStateChanged !== 'function' || typeof db.collection !== 'function') {
        return { ready: false, reason: 'services not properly initialized' };
      }

      return { ready: true };
    } catch (error) {
      return { ready: false, reason: `error checking services: ${error.message}` };
    }
  }

  // Initialize Firebase Manager with retry logic
  async initializeFirebaseManager() {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const attemptInit = () => {
        attempts++;
        const status = this.checkFirebaseServices();

        if (status.ready) {
          try {
            console.log('✅ Firebase services ready, creating Firebase Manager...');
            window.firebaseManager = new FirebaseManager();
            this.initialized = true;
            
            // Execute all pending callbacks
            this.callbacks.forEach(callback => {
              try {
                callback();
              } catch (error) {
                console.error('Error in Firebase ready callback:', error);
              }
            });
            this.callbacks = [];

            console.log('🎉 Firebase Manager created and ready');
            window.dispatchEvent(new CustomEvent('firebaseManagerReady'));
            resolve();
            return;
          } catch (error) {
            console.error('❌ Error creating Firebase Manager:', error);
            if (attempts < this.maxAttempts) {
              setTimeout(attemptInit, this.attemptInterval);
            } else {
              reject(new Error(`Failed to create Firebase Manager after ${attempts} attempts: ${error.message}`));
            }
            return;
          }
        }

        // Not ready yet
        if (attempts < this.maxAttempts) {
          // Log progress every 2 seconds
          if (attempts % 20 === 0) {
            const secondsWaited = (attempts * this.attemptInterval) / 1000;
            console.log(`⏳ Waiting for Firebase services... (${secondsWaited}s) - ${status.reason}`);
          }
          setTimeout(attemptInit, this.attemptInterval);
        } else {
          const errorMsg = `❌ Firebase services not available after ${(this.maxAttempts * this.attemptInterval) / 1000} seconds`;
          console.error(errorMsg);
          console.log('🔍 Debug info:', {
            firebaseProvider: !!window.firebaseProvider,
            providerReady: window.firebaseProvider ? window.firebaseProvider.isReady() : false,
            firebaseServices: !!window.firebaseServices,
            getAuth: !!(window.firebaseServices && window.firebaseServices.getAuth),
            getDb: !!(window.firebaseServices && window.firebaseServices.getDb),
            getStorage: !!(window.firebaseServices && window.firebaseServices.getStorage),
            lastCheckReason: status.reason
          });
          reject(new Error(errorMsg));
        }
      };

      attemptInit();
    });
  }
}

// Create global Firebase initializer
window.firebaseInitializer = new FirebaseInitializer();

// Start initialization when Firebase services are ready
const startFirebaseManagerInit = () => {
  console.log('🚀 Starting Firebase Manager initialization...');
  window.firebaseInitializer.initializeFirebaseManager().catch(error => {
    console.error('💥 Failed to initialize Firebase Manager:', error);
    window.dispatchEvent(new CustomEvent('firebaseManagerError', { detail: error }));
  });
};

// Listen for Firebase services ready event
window.addEventListener('firebaseServicesReady', startFirebaseManagerInit);

// Also try to start if services are already ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure Firebase services provider has had time to initialize
  setTimeout(() => {
    if (window.firebaseProvider && window.firebaseProvider.isReady()) {
      startFirebaseManagerInit();
    }
  }, 100);
});

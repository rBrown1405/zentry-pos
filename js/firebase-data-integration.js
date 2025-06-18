/**
 * Firebase Data Integration for Zentry POS
 * Provides integration functions for working with Firebase data in the umbrella account system
 */
class FirebaseDataIntegration {
    constructor() {
        this.firebaseManager = window.firebaseManager;
        this.umbrellaManager = window.umbrellaManager;
        this.db = window.firebaseServices ? window.firebaseServices.getDb() : null;
        
        if (!this.db || !this.firebaseManager || !this.umbrellaManager) {
            console.error('Firebase integration requires Firebase and Umbrella Account systems');
            return;
        }
        
        // Register event listeners
        document.addEventListener('propertyChanged', this.handlePropertyChange.bind(this));
        document.addEventListener('businessChanged', this.handleBusinessChange.bind(this));
    }
    
    /**
     * Handle property change event
     * @param {CustomEvent} event - Property changed event
     */
    handlePropertyChange(event) {
        const property = event.detail.property;
        if (!property) return;
        
        // Update property-specific data
        this.loadPropertyData(property.id);
    }
    
    /**
     * Handle business change event
     * @param {CustomEvent} event - Business changed event
     */
    handleBusinessChange(event) {
        const business = event.detail.business;
        if (!business) return;
        
        // Business changes are handled by umbrella-account-manager.js
        // which will also trigger a property change if needed
    }
    
    /**
     * Load data for a specific property
     * @param {string} propertyId - Property ID
     */
    async loadPropertyData(propertyId) {
        try {
            // Load property-specific menu items
            this.loadMenuItemsForProperty(propertyId);
            
            // Load property-specific tables
            this.loadTablesForProperty(propertyId);
            
            // Load property-specific orders
            this.loadOrdersForProperty(propertyId);
        } catch (error) {
            console.error('Error loading property data:', error);
        }
    }
    
    /**
     * Load menu items for a specific property
     * @param {string} propertyId - Property ID
     */
    async loadMenuItemsForProperty(propertyId) {
        try {
            // Query menu items specific to this property
            const menuItemsRef = await this.db.collection('menu_items')
                .where('propertyId', '==', propertyId)
                .get();
                
            const menuItems = menuItemsRef.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Store in localStorage for use in the existing system
            localStorage.setItem(`property_${propertyId}_menu_items`, JSON.stringify(menuItems));
            
            // Trigger menu refresh if needed
            if (typeof loadMenuItems === 'function' && 
                this.umbrellaManager.currentProperty &&
                this.umbrellaManager.currentProperty.id === propertyId) {
                loadMenuItems();
            }
            
            return menuItems;
        } catch (error) {
            console.error('Error loading menu items for property:', error);
            return [];
        }
    }
    
    /**
     * Load tables for a specific property
     * @param {string} propertyId - Property ID
     */
    async loadTablesForProperty(propertyId) {
        try {
            // Query tables specific to this property
            const tablesRef = await this.db.collection('tables')
                .where('propertyId', '==', propertyId)
                .get();
                
            const tables = tablesRef.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Store in localStorage for use in the existing system
            localStorage.setItem(`property_${propertyId}_tables`, JSON.stringify(tables));
            
            // Trigger table refresh if needed
            if (typeof initializeTables === 'function' && 
                this.umbrellaManager.currentProperty &&
                this.umbrellaManager.currentProperty.id === propertyId &&
                window.currentView === 'tables') {
                initializeTables();
            }
            
            return tables;
        } catch (error) {
            console.error('Error loading tables for property:', error);
            return [];
        }
    }
    
    /**
     * Load orders for a specific property
     * @param {string} propertyId - Property ID
     */
    async loadOrdersForProperty(propertyId) {
        try {
            // Query recent orders for this property
            const ordersRef = await this.db.collection('orders')
                .where('propertyId', '==', propertyId)
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();
                
            const orders = ordersRef.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Store in localStorage for use in the existing system
            localStorage.setItem(`property_${propertyId}_orders`, JSON.stringify(orders));
            
            // Trigger kitchen display refresh if needed
            if (typeof updateKitchenDisplay === 'function' && 
                this.umbrellaManager.currentProperty &&
                this.umbrellaManager.currentProperty.id === propertyId &&
                window.currentView === 'kitchen') {
                updateKitchenDisplay();
            }
            
            return orders;
        } catch (error) {
            console.error('Error loading orders for property:', error);
            return [];
        }
    }
    
    /**
     * Save menu item with proper property association
     * @param {Object} menuItem - Menu item data
     * @returns {Promise<string>} - Menu item ID
     */
    async saveMenuItem(menuItem) {
        try {
            if (!this.umbrellaManager.currentProperty) {
                throw new Error('No property selected');
            }
            
            // Add property ID to the menu item
            const menuItemData = {
                ...menuItem,
                propertyId: this.umbrellaManager.currentProperty.id,
                businessId: this.umbrellaManager.currentBusiness.id,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // If it has an ID, update it; otherwise create new
            let menuItemId;
            if (menuItem.id) {
                menuItemId = menuItem.id;
                await this.db.collection('menu_items').doc(menuItemId).update(menuItemData);
            } else {
                menuItemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const menuItemRef = await this.db.collection('menu_items').add(menuItemData);
                menuItemId = menuItemRef.id;
            }
            
            // Refresh menu items
            await this.loadMenuItemsForProperty(this.umbrellaManager.currentProperty.id);
            
            return menuItemId;
        } catch (error) {
            console.error('Error saving menu item:', error);
            throw error;
        }
    }
    
    /**
     * Save table with proper property association
     * @param {Object} table - Table data
     * @returns {Promise<string>} - Table ID
     */
    async saveTable(table) {
        try {
            if (!this.umbrellaManager.currentProperty) {
                throw new Error('No property selected');
            }
            
            // Add property ID to the table
            const tableData = {
                ...table,
                propertyId: this.umbrellaManager.currentProperty.id,
                businessId: this.umbrellaManager.currentBusiness.id,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // If it has an ID, update it; otherwise create new
            let tableId;
            if (table.id) {
                tableId = table.id;
                await this.db.collection('tables').doc(tableId).update(tableData);
            } else {
                tableData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const tableRef = await this.db.collection('tables').add(tableData);
                tableId = tableRef.id;
            }
            
            // Refresh tables
            await this.loadTablesForProperty(this.umbrellaManager.currentProperty.id);
            
            return tableId;
        } catch (error) {
            console.error('Error saving table:', error);
            throw error;
        }
    }
    
    /**
     * Save order with proper property association
     * @param {Object} order - Order data
     * @returns {Promise<string>} - Order ID
     */
    async saveOrder(order) {
        try {
            if (!this.umbrellaManager.currentProperty) {
                throw new Error('No property selected');
            }
            
            // Add property ID to the order
            const orderData = {
                ...order,
                propertyId: this.umbrellaManager.currentProperty.id,
                businessId: this.umbrellaManager.currentBusiness.id,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // If it has an ID, update it; otherwise create new
            let orderId;
            if (order.id) {
                orderId = order.id;
                await this.db.collection('orders').doc(orderId).update(orderData);
            } else {
                orderData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const orderRef = await this.db.collection('orders').add(orderData);
                orderId = orderRef.id;
            }
            
            // Refresh orders
            await this.loadOrdersForProperty(this.umbrellaManager.currentProperty.id);
            
            return orderId;
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    }
    
    /**
     * Initialize a new property with default data
     * @param {string} propertyId - Property ID
     */
    async initializePropertyData(propertyId) {
        try {
            // Check if data already exists
            const menuItemsRef = await this.db.collection('menu_items')
                .where('propertyId', '==', propertyId)
                .limit(1)
                .get();
                
            if (!menuItemsRef.empty) {
                console.log('Property already has data, skipping initialization');
                return;
            }
            
            // Create default menu items
            const defaultMenuItems = [
                { name: 'Burger', price: 9.99, category: 'Main Course' },
                { name: 'Pizza', price: 12.99, category: 'Main Course' },
                { name: 'Caesar Salad', price: 7.99, category: 'Starter' },
                { name: 'Soft Drink', price: 2.99, category: 'Beverage' }
            ];
            
            for (const item of defaultMenuItems) {
                await this.saveMenuItem({
                    ...item,
                    propertyId
                });
            }
            
            // Create default tables
            const defaultTables = [
                { number: 1, capacity: 4, status: 'available' },
                { number: 2, capacity: 4, status: 'available' },
                { number: 3, capacity: 6, status: 'available' },
                { number: 4, capacity: 2, status: 'available' }
            ];
            
            for (const table of defaultTables) {
                await this.saveTable({
                    ...table,
                    propertyId
                });
            }
            
            console.log('Property initialized with default data');
        } catch (error) {
            console.error('Error initializing property data:', error);
        }
    }
}

// Create instance when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a delay to ensure other components are loaded
    setTimeout(() => {
        if (window.firebaseServices && window.umbrellaManager) {
            window.firebaseDataIntegration = new FirebaseDataIntegration();
        }
    }, 2500);
});

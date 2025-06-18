/**
 * Data Migration Script for Zentry POS
 * This script helps migrate your local storage data to Firebase
 * Run this script once after setting up Firebase to transfer your existing data
 */

// Data Migration Utility for Zentry POS
// Handles migration from localStorage to Firebase

class DataMigrationUtil {
    constructor(firebaseServices) {
        this.db = firebaseServices.getDb();
        this.auth = firebaseServices.getAuth();
    }

    /**
     * Check if migration is needed
     * @returns {boolean}
     */
    needsMigration() {
        // Check if we have any data in localStorage
        return Object.keys(localStorage).some(key => 
            key.startsWith('zentry_') || 
            key.startsWith('business_') || 
            key.startsWith('property_'));
    }

    /**
     * Migrate data from localStorage to Firebase
     * @returns {Promise<void>}
     */
    async migrateData() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User must be logged in to migrate data');
            }

            // Start a batch write
            const batch = this.db.batch();

            // Migrate businesses
            const businesses = this._getLocalStorageItems('business_');
            for (const business of businesses) {
                const businessRef = this.db.collection('businesses').doc();
                batch.set(businessRef, {
                    ...business,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    migratedFrom: 'localStorage',
                    migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Create business access for the user
                const accessRef = this.db.collection('businessAccess')
                    .doc(`${user.uid}_${businessRef.id}`);
                batch.set(accessRef, {
                    userId: user.uid,
                    businessId: businessRef.id,
                    role: 'businessAdmin',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Migrate properties
            const properties = this._getLocalStorageItems('property_');
            for (const property of properties) {
                const propertyRef = this.db.collection('properties').doc();
                batch.set(propertyRef, {
                    ...property,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    migratedFrom: 'localStorage',
                    migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Create property access for the user
                const accessRef = this.db.collection('propertyAccess')
                    .doc(`${user.uid}_${propertyRef.id}`);
                batch.set(accessRef, {
                    userId: user.uid,
                    propertyId: propertyRef.id,
                    role: 'propertyManager',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Update user document with migration status
            const userRef = this.db.collection('users').doc(user.uid);
            batch.update(userRef, {
                dataMigrated: true,
                dataMigratedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Commit the batch
            await batch.commit();

            // Clear migrated data from localStorage
            this._clearMigratedData();

            console.log('Data migration completed successfully');
        } catch (error) {
            console.error('Error migrating data:', error);
            throw error;
        }
    }

    /**
     * Get items from localStorage by prefix
     * @private
     */
    _getLocalStorageItems(prefix) {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    items.push(item);
                } catch (error) {
                    console.warn(`Failed to parse item ${key} from localStorage`, error);
                }
            }
        }
        return items;
    }

    /**
     * Clear migrated data from localStorage
     * @private
     */
    _clearMigratedData() {
        const prefixes = ['zentry_', 'business_', 'property_'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (prefixes.some(prefix => key.startsWith(prefix))) {
                localStorage.removeItem(key);
            }
        }
    }
}

// Function to migrate data from localStorage to Firebase
async function migrateDataToFirebase() {
  console.log('Starting data migration to Firebase...');
  const firebaseManager = window.firebaseManager;
  
  // Check if Firebase is initialized
  if (!firebaseManager) {
    console.error('Firebase Manager not initialized. Aborting migration.');
    return;
  }

  try {
    // Check if migration has already been completed
    const migrationDoc = await firebaseManager.db.collection('system').doc('migration').get();
    if (migrationDoc.exists && migrationDoc.data().completed) {
      console.log('Migration already completed. Skipping...');
      return;
    }

    // Start transaction for atomic migration
    await firebaseManager.db.runTransaction(async (transaction) => {
      // 1. Create migration record
      transaction.set(firebaseManager.db.collection('system').doc('migration'), {
        started: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 2. Migrate data
      await migrateMenuItems();
      await migrateTableData();
      await migrateOrderData();
      await migrateUmbrellaAccountData();

      // 3. Mark migration as complete
      transaction.update(firebaseManager.db.collection('system').doc('migration'), {
        completed: true,
        completedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    console.log('✅ Data migration completed successfully!');
    alert('Data successfully migrated to Firebase!');

    // Clear localStorage after successful migration
    clearLocalStorage();
  } catch (error) {
    console.error('❌ Data migration failed:', error);
    alert('Data migration failed. Check console for details.');
  }
  
  // Migrate Menu Items
  async function migrateMenuItems() {
    const localMenuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
    console.log(`Migrating ${localMenuItems.length} menu items...`);
    
    const promises = localMenuItems.map(async (item) => {
      try {
        // Add ID if not present
        const menuItem = {
          name: item.name,
          price: parseFloat(item.price),
          category: item.category || 'Uncategorized',
          description: item.description || '',
          emoji: item.emoji || '🍽️'
        };
        
        // Add to Firebase
        await firebaseManager.addMenuItem(menuItem);
        return true;
      } catch (error) {
        console.error(`Failed to migrate menu item ${item.name}:`, error);
        return false;
      }
    });
    
    const results = await Promise.all(promises);
    const successCount = results.filter(result => result).length;
    console.log(`✓ Migrated ${successCount}/${localMenuItems.length} menu items`);
  }
  
  // Migrate Table Data
  async function migrateTableData() {
    const localTables = JSON.parse(localStorage.getItem('tables') || '[]');
    console.log(`Migrating ${localTables.length} tables...`);
    
    const promises = localTables.map(async (table) => {
      try {
        // Format table data for Firebase
        const tableData = {
          number: table.number,
          capacity: table.capacity || 4,
          status: table.status || 'available',
          shape: table.shape || 'circle',
          x: table.x || 0,
          y: table.y || 0,
          width: table.width || 80,
          height: table.height || 80
        };
        
        // Add to Firebase
        await firebaseManager.addTable(tableData);
        return true;
      } catch (error) {
        console.error(`Failed to migrate table ${table.number}:`, error);
        return false;
      }
    });
    
    const results = await Promise.all(promises);
    const successCount = results.filter(result => result).length;
    console.log(`✓ Migrated ${successCount}/${localTables.length} tables`);
  }
  
  // Migrate Order Data
  async function migrateOrderData() {
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    console.log(`Migrating ${localOrders.length} orders...`);
    
    const promises = localOrders.map(async (order, index) => {
      try {
        // Format order data for Firebase
        const orderData = {
          orderNumber: order.orderNumber || `ORD-${String(index + 1).padStart(4, '0')}`,
          items: order.items || [],
          total: order.total || 0,
          status: order.status || 'new',
          tableId: order.tableId,
          tableNumber: order.tableNumber,
          createdAt: new Date(order.createdAt) || new Date()
        };
        
        // Add to Firebase
        await firebaseManager.createOrder(orderData);
        return true;
      } catch (error) {
        console.error(`Failed to migrate order ${order.orderNumber || index}:`, error);
        return false;
      }
    });
    
    const results = await Promise.all(promises);
    const successCount = results.filter(result => result).length;
    console.log(`✓ Migrated ${successCount}/${localOrders.length} orders`);
  }
  
  // Migrate Umbrella Account Data
  async function migrateUmbrellaAccountData() {
    console.log('Migrating umbrella account data...');
    
    // Check if umbrella manager is initialized
    if (!window.umbrellaManager) {
      console.warn('Umbrella Account Manager not initialized. Skipping umbrella data migration.');
      return;
    }
    
    try {
      // 1. Migrate business data
      await migrateBusinessData();
      
      // 2. Migrate property data
      await migratePropertyData();
      
      // 3. Update user permissions
      await updateUserPermissions();
      
      console.log('✓ Umbrella account data migration complete');
    } catch (error) {
      console.error('Failed to migrate umbrella account data:', error);
      throw error;
    }
  }
  
  // Migrate business data
  async function migrateBusinessData() {
    const businessData = JSON.parse(localStorage.getItem('businessInfo') || 'null');
    if (!businessData) {
      console.log('No business data found in local storage. Skipping business migration.');
      return;
    }
    
    console.log('Migrating business data...');
    
    try {
      // Create business in Firebase
      const businessId = await window.umbrellaManager.createBusiness({
        companyName: businessData.name || businessData.companyName || 'Untitled Business',
        businessType: businessData.type || businessData.businessType || 'restaurant',
        companyEmail: businessData.email || businessData.companyEmail || firebaseManager.getCurrentUser().email,
        companyPhone: businessData.phone || businessData.companyPhone || '',
        address: businessData.address || {}
      });
      
      console.log(`✓ Business migrated successfully with ID: ${businessId}`);
      localStorage.setItem('migratedBusinessId', businessId);
      return businessId;
    } catch (error) {
      console.error('Failed to migrate business data:', error);
      throw error;
    }
  }
  
  // Migrate property data
  async function migratePropertyData() {
    // Get migrated business ID or current business
    const businessId = localStorage.getItem('migratedBusinessId') || 
                       (window.umbrellaManager.currentBusiness ? 
                        window.umbrellaManager.currentBusiness.id : null);
    
    if (!businessId) {
      console.warn('No business ID available. Skipping property migration.');
      return;
    }
    
    const locationData = JSON.parse(localStorage.getItem('locationInfo') || 'null');
    if (!locationData) {
      console.log('No location data found in local storage. Creating default property.');
      
      // Create default property
      const propertyId = await window.umbrellaManager.createProperty(businessId, {
        propertyName: 'Main Location',
        address: {}
      });
      
      console.log(`✓ Default property created with ID: ${propertyId}`);
      return;
    }
    
    console.log('Migrating property data...');
    
    try {
      // Create property in Firebase
      const propertyId = await window.umbrellaManager.createProperty(businessId, {
        propertyName: locationData.name || 'Main Location',
        address: locationData.address || {}
      });
      
      console.log(`✓ Property migrated successfully with ID: ${propertyId}`);
      return propertyId;
    } catch (error) {
      console.error('Failed to migrate property data:', error);
      throw error;
    }
  }
  
  // Update user permissions
  async function updateUserPermissions() {
    const user = firebaseManager.getCurrentUser();
    if (!user) {
      console.warn('No authenticated user. Skipping user permission update.');
      return;
    }
    
    console.log('Updating user permissions...');
    
    try {
      // Get migrated business ID
      const businessId = localStorage.getItem('migratedBusinessId') || 
                         (window.umbrellaManager.currentBusiness ? 
                          window.umbrellaManager.currentBusiness.id : null);
      
      if (!businessId) {
        console.warn('No business ID available. Skipping user permission update.');
        return;
      }
      
      // Update user document to be an owner of the business
      await firebaseManager.db.collection('users').doc(user.uid).update({
        role: 'owner',
        accessLevel: 'business',
        businessId: businessId
      });
      
      console.log(`✓ User permissions updated for user: ${user.uid}`);
    } catch (error) {
      console.error('Failed to update user permissions:', error);
      throw error;
    }
  }
}

// Clear localStorage after successful migration
function clearLocalStorage() {
  // List of keys to preserve (Firebase and essential system data)
  const preserveKeys = [
    'firebase:host:*',  // Firebase hosting data
    'firebase:auth:*',  // Firebase auth data
    'firebase:session', // Firebase session
  ];

  // Get all localStorage keys
  const keys = Object.keys(localStorage);

  // Remove all items except preserved keys
  keys.forEach(key => {
    if (!preserveKeys.some(pattern => 
      pattern.endsWith('*') 
        ? key.startsWith(pattern.slice(0, -1))
        : key === pattern
    )) {
      localStorage.removeItem(key);
    }
  });

  console.log('localStorage cleared except for essential Firebase data');
}

// Add a migration button to the UI
function addMigrationButton() {
  const header = document.querySelector('.header-actions');
  if (header) {
    const migrationButton = document.createElement('button');
    migrationButton.className = 'header-btn';
    migrationButton.innerHTML = '🔄 Migrate Data';
    migrationButton.onclick = migrateDataToFirebase;
    header.appendChild(migrationButton);
    console.log('Migration button added to header');
  }
}

// Execute when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Add a slight delay to ensure Firebase is initialized
  setTimeout(() => {
    addMigrationButton();
  }, 2000);
});

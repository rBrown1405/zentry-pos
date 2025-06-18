/**
 * Data Migration Script for Zentry POS
 * This script helps migrate your local storage data to Firebase
 * Run this script once after setting up Firebase to transfer your existing data
 */

// Function to migrate data from localStorage to Firebase
function migrateDataToFirebase() {
  console.log('Starting data migration to Firebase...');
  const firebaseManager = window.firebaseManager;
  
  // Check if Firebase is initialized
  if (!firebaseManager) {
    console.error('Firebase Manager not initialized. Aborting migration.');
    return;
  }
  
  // 1. Migrate Menu Items
  migrateMenuItems()
    .then(() => migrateTableData())
    .then(() => migrateOrderData())
    .then(() => migrateUmbrellaAccountData())
    .then(() => {
      console.log('✅ Data migration completed successfully!');
      alert('Data successfully migrated to Firebase!');
    })
    .catch(error => {
      console.error('❌ Data migration failed:', error);
      alert('Data migration failed. Check console for details.');
    });
  
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

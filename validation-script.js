// End-to-End Multi-Property System Validation Script
// This script demonstrates the complete workflow of the multi-property system

console.log('=== Multi-Property System End-to-End Validation ===');

// Step 1: Create a business account
console.log('\n1. Creating business account...');
const businessResult = MultiPropertyManager.createBusinessAccount({
    businessName: 'Demo Restaurant Group',
    businessType: 'restaurant',
    ownerName: 'John Doe',
    email: 'john@demorestaurant.com',
    phone: '555-0100',
    address: '100 Demo Street, Demo City, DC 10001'
});

if (businessResult.success) {
    console.log('✓ Business account created:', businessResult.businessId);
    console.log('✓ Connection code:', businessResult.connectionCode);
    
    const businessId = businessResult.businessId;
    const connectionCode = businessResult.connectionCode;
    
    // Step 2: Add multiple properties
    console.log('\n2. Adding properties...');
    const properties = [
        {
            name: 'Main Restaurant',
            type: 'restaurant',
            address: '100 Demo Street',
            city: 'Demo City',
            state: 'DC',
            zip: '10001'
        },
        {
            name: 'Downtown Café',
            type: 'cafe',
            address: '200 Downtown Ave',
            city: 'Demo City',
            state: 'DC',
            zip: '10002'
        },
        {
            name: 'Airport Location',
            type: 'restaurant',
            address: '300 Airport Blvd',
            city: 'Demo City',
            state: 'DC',
            zip: '10003'
        }
    ];
    
    const propertyIds = [];
    properties.forEach((property, index) => {
        const propResult = MultiPropertyManager.addProperty(businessId, property);
        if (propResult.success) {
            propertyIds.push(propResult.propertyId);
            console.log(`✓ Property ${index + 1} added: ${property.name} (${propResult.propertyId})`);
        } else {
            console.log(`✗ Failed to add property ${index + 1}: ${propResult.message}`);
        }
    });
    
    // Step 3: Register staff members
    console.log('\n3. Registering staff members...');
    const staffMembers = [
        {
            firstName: 'Alice',
            lastName: 'Manager',
            email: 'alice@demorestaurant.com',
            phone: '555-0101',
            role: 'manager',
            connectionCode: connectionCode
        },
        {
            firstName: 'Bob',
            lastName: 'Server',
            email: 'bob@demorestaurant.com',
            phone: '555-0102',
            role: 'server',
            connectionCode: connectionCode
        }
    ];
    
    const staffIds = [];
    staffMembers.forEach((staff, index) => {
        const staffResult = MultiPropertyManager.registerStaff(staff);
        if (staffResult.success) {
            staffIds.push(staffResult.staffId);
            console.log(`✓ Staff ${index + 1} registered: ${staff.firstName} ${staff.lastName} (${staffResult.staffId})`);
        } else {
            console.log(`✗ Failed to register staff ${index + 1}: ${staffResult.message}`);
        }
    });
    
    // Step 4: Grant property access
    console.log('\n4. Granting property access...');
    staffIds.forEach((staffId, staffIndex) => {
        propertyIds.forEach((propertyId, propIndex) => {
            const accessResult = MultiPropertyManager.grantPropertyAccess(staffId, propertyId);
            if (accessResult.success) {
                console.log(`✓ Access granted: Staff ${staffIndex + 1} -> Property ${propIndex + 1}`);
            } else {
                console.log(`✗ Access grant failed: Staff ${staffIndex + 1} -> Property ${propIndex + 1}: ${accessResult.message}`);
            }
        });
    });
    
    // Step 5: Test property switching
    console.log('\n5. Testing property switching...');
    if (staffIds.length > 0) {
        // Simulate staff login
        localStorage.setItem('currentStaffId', staffIds[0]);
        console.log(`✓ Simulated login for staff: ${staffIds[0]}`);
        
        // Initialize property switcher
        if (typeof PropertySwitcher !== 'undefined') {
            console.log('✓ PropertySwitcher available, initializing...');
            
            // Get accessible properties
            const accessibleProperties = PropertySwitcher.getAccessibleProperties(staffIds[0]);
            console.log(`✓ Found ${accessibleProperties.length} accessible properties:`);
            
            accessibleProperties.forEach((property, index) => {
                console.log(`  ${index + 1}. ${property.name} (${property.id})`);
            });
            
            // Test switching to first property
            if (accessibleProperties.length > 0) {
                const switchResult = PropertySwitcher.switchProperty(accessibleProperties[0].id);
                if (switchResult.success) {
                    console.log(`✓ Successfully switched to: ${accessibleProperties[0].name}`);
                    console.log(`✓ Current property context: ${PropertySwitcher.currentProperty?.name || 'None'}`);
                } else {
                    console.log(`✗ Property switch failed: ${switchResult.message}`);
                }
            }
        } else {
            console.log('✗ PropertySwitcher not available');
        }
    }
    
    // Step 6: Display system status
    console.log('\n6. System Status Summary:');
    const allBusinesses = MultiPropertyManager.getAllBusinessAccounts();
    const allStaff = MultiPropertyManager.getAllStaff();
    
    console.log(`✓ Total business accounts: ${allBusinesses.length}`);
    console.log(`✓ Total registered staff: ${allStaff.length}`);
    console.log(`✓ Total properties: ${propertyIds.length}`);
    
    // Display current property context
    const currentStaffId = localStorage.getItem('currentStaffId');
    const currentPropertyId = localStorage.getItem('currentPropertyId');
    
    console.log(`✓ Current staff context: ${currentStaffId || 'None'}`);
    console.log(`✓ Current property context: ${currentPropertyId || 'None'}`);
    
    console.log('\n=== End-to-End Validation Complete ===');
    
} else {
    console.log('✗ Failed to create business account:', businessResult.message);
}

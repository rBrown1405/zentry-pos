// Test Data Generator for POS System
// Run this in browser console to create sample data for testing

function createTestData() {
    console.log('Creating test business and staff data...');

    // Test Business Data - Multiple Businesses for Super Admin Demo
    const testBusinesses = [
        {
            businessID: 'BIZTST123XY567',
            businessCode: 'TST1234',
            companyName: 'Test Restaurant Co.',
            ownerName: 'John Smith',
            companyEmail: 'owner@testrestaurant.com',
            companyPhone: '(555) 123-4567',
            businessType: 'restaurant',
            createdAt: new Date().toISOString(),
            role: 'admin',
            properties: [{
                propertyName: 'Main Restaurant',
                businessType: 'restaurant',
                address: '123 Main St, Test City, TC 12345',
                country: 'united-states',
                state: 'california',
                propertyCode: 'MARST123',
                createdAt: new Date().toISOString(),
                isActive: true
            }]
        },
        {
            businessID: 'BIZCAFE456AB890',
            businessCode: 'CAF5678',
            companyName: 'Downtown Cafe & Bistro',
            ownerName: 'Sarah Johnson',
            companyEmail: 'sarah@downtowncafe.com',
            companyPhone: '(555) 234-5678',
            businessType: 'cafe',
            createdAt: new Date().toISOString(),
            role: 'admin',
            properties: [{
                propertyName: 'Downtown Cafe',
                businessType: 'cafe',
                address: '456 Downtown Ave, Metro City, MC 67890',
                country: 'united-states',
                state: 'new-york',
                propertyCode: 'DWCAF456',
                createdAt: new Date().toISOString(),
                isActive: true
            }]
        },
        {
            businessID: 'BIZBAR789CD123',
            businessCode: 'BAR9012',
            companyName: 'The Golden Tap Sports Bar',
            ownerName: 'Mike Rodriguez',
            companyEmail: 'mike@goldentap.com',
            companyPhone: '(555) 345-6789',
            businessType: 'bar',
            createdAt: new Date().toISOString(),
            role: 'admin',
            properties: [{
                propertyName: 'Golden Tap Bar',
                businessType: 'bar',
                address: '789 Sports Blvd, Bar City, BC 13579',
                country: 'united-states',
                state: 'texas',
                propertyCode: 'GTBAR789',
                createdAt: new Date().toISOString(),
                isActive: true
            }]
        }
    ];

    // Store business data
    testBusinesses.forEach(business => {
        localStorage.setItem(`business_id_${business.businessID}`, JSON.stringify(business));
        localStorage.setItem(`business_${business.businessCode}`, JSON.stringify(business));
    });

    // Test Staff Data - Multiple businesses
    const testStaff = [
        // Test Restaurant Staff
        {
            staffId: 'JSSV1001',
            businessCode: 'TST1234',
            fullName: 'Jane Server',
            email: 'jane@testrestaurant.com',
            phone: '(555) 234-5678',
            position: 'server',
            pin: '1234',
            createdAt: new Date().toISOString(),
            role: 'staff',
            status: 'active'
        },
        {
            staffId: 'MBMG2001',
            businessCode: 'TST1234',
            fullName: 'Mike Manager',
            email: 'mike@testrestaurant.com',
            phone: '(555) 345-6789',
            position: 'manager',
            pin: '5678',
            createdAt: new Date().toISOString(),
            role: 'manager',
            status: 'active'
        },
        {
            staffId: 'SKCS3001',
            businessCode: 'TST1234',
            fullName: 'Sarah Cashier',
            email: 'sarah@testrestaurant.com',
            phone: '(555) 456-7890',
            position: 'cashier',
            pin: '9012',
            createdAt: new Date().toISOString(),
            role: 'staff',
            status: 'active'
        },
        // Downtown Cafe Staff
        {
            staffId: 'EMBT4001',
            businessCode: 'CAF5678',
            fullName: 'Emily Barista',
            email: 'emily@downtowncafe.com',
            phone: '(555) 567-8901',
            position: 'barista',
            pin: '3456',
            createdAt: new Date().toISOString(),
            role: 'staff',
            status: 'active'
        },
        {
            staffId: 'TAMG5001',
            businessCode: 'CAF5678',
            fullName: 'Tom Manager',
            email: 'tom@downtowncafe.com',
            phone: '(555) 678-9012',
            position: 'manager',
            pin: '7890',
            createdAt: new Date().toISOString(),
            role: 'manager',
            status: 'active'
        },
        // Golden Tap Bar Staff
        {
            staffId: 'RBBT6001',
            businessCode: 'BAR9012',
            fullName: 'Rebecca Bartender',
            email: 'rebecca@goldentap.com',
            phone: '(555) 789-0123',
            position: 'bartender',
            pin: '1357',
            createdAt: new Date().toISOString(),
            role: 'staff',
            status: 'active'
        },
        {
            staffId: 'CHMG7001',
            businessCode: 'BAR9012',
            fullName: 'Chris Manager',
            email: 'chris@goldentap.com',
            phone: '(555) 890-1234',
            position: 'manager',
            pin: '2468',
            createdAt: new Date().toISOString(),
            role: 'manager',
            status: 'active'
        }
    ];

    // Store staff data
    testStaff.forEach(staff => {
        localStorage.setItem(`staff_${staff.staffId}`, JSON.stringify(staff));
    });

    // Test Business Settings for each business
    const businessSettings = [
        {
            businessCode: 'TST1234',
            settings: {
                name: 'Test Restaurant Co.',
                type: 'restaurant',
                address: '123 Main St, Test City, TC 12345',
                phone: '(555) 123-4567',
                email: 'owner@testrestaurant.com',
                website: 'https://testrestaurant.com',
                primaryColor: '#007bff',
                secondaryColor: '#6c757d',
                logoText: 'TR',
                autoPrintReceipts: false,
                showTableNumbers: true,
                enableTips: true,
                taxRate: 8.25,
                currency: 'USD'
            }
        },
        {
            businessCode: 'CAF5678',
            settings: {
                name: 'Downtown Cafe & Bistro',
                type: 'cafe',
                address: '456 Downtown Ave, Metro City, MC 67890',
                phone: '(555) 234-5678',
                email: 'sarah@downtowncafe.com',
                website: 'https://downtowncafe.com',
                primaryColor: '#28a745',
                secondaryColor: '#ffc107',
                logoText: 'DC',
                autoPrintReceipts: true,
                showTableNumbers: false,
                enableTips: true,
                taxRate: 8.75,
                currency: 'USD'
            }
        },
        {
            businessCode: 'BAR9012',
            settings: {
                name: 'The Golden Tap Sports Bar',
                type: 'bar',
                address: '789 Sports Blvd, Bar City, BC 13579',
                phone: '(555) 345-6789',
                email: 'mike@goldentap.com',
                website: 'https://goldentap.com',
                primaryColor: '#dc3545',
                secondaryColor: '#fd7e14',
                logoText: 'GT',
                autoPrintReceipts: false,
                showTableNumbers: true,
                enableTips: true,
                taxRate: 7.5,
                currency: 'USD'
            }
        }
    ];

    // Store business settings (this would be used by business-specific settings)
    businessSettings.forEach(({ businessCode, settings }) => {
        localStorage.setItem(`businessSettings_${businessCode}`, JSON.stringify(settings));
    });

    // Store main business settings (for current context)
    localStorage.setItem('businessSettings', JSON.stringify(businessSettings[0].settings));

    console.log('✅ Test data created successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('==========================================');
    console.log('👑 SUPER ADMIN LOGIN:');
    console.log('   Username: superadmin');
    console.log('   Password: MacrosPOS2025!');
    console.log('   (Global access to ALL businesses & properties)');
    console.log('\n🏢 Business Logins:');
    console.log('   Test Restaurant: BIZTST123XY567');
    console.log('   Downtown Cafe: BIZCAFE456AB890');
    console.log('   Golden Tap Bar: BIZBAR789CD123');
    console.log('\n👥 Staff Logins:');
    console.log('   📍 Test Restaurant:');
    console.log('     - Server: JSSV1001 (Jane Server)');
    console.log('     - Manager: MBMG2001 (Mike Manager)');
    console.log('     - Cashier: SKCS3001 (Sarah Cashier)');
    console.log('   📍 Downtown Cafe:');
    console.log('     - Barista: EMBT4001 (Emily Barista)');
    console.log('     - Manager: TAMG5001 (Tom Manager)');
    console.log('   📍 Golden Tap Bar:');
    console.log('     - Bartender: RBBT6001 (Rebecca Bartender)');
    console.log('     - Manager: CHMG7001 (Chris Manager)');
    console.log('==========================================');
    console.log('\n🎯 SUPER ADMIN FEATURES:');
    console.log('- View all businesses and staff across the system');
    console.log('- Access any business POS interface');
    console.log('- Global settings and management');
    console.log('- System-wide analytics and reports');
    console.log('- Staff management across all properties');
    console.log('\n💡 DEMO: Login as super admin to see all 3 businesses and 7 staff members!');
    
    return {
        businesses: testBusinesses,
        staff: testStaff,
        settings: businessSettings
    };
}

// Helper function to clear all test data
function clearTestData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith('business_') ||
            key.startsWith('staff_') ||
            key === 'businessSettings' ||
            key === 'currentUser' ||
            key === 'propertyType' ||
            key === 'propertyName' ||
            key === 'firstLogin'
        )) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Test data cleared successfully!');
}

// Helper function to show current data
function showCurrentData() {
    console.log('📊 Current POS Data:');
    console.log('==========================================');
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        console.log('👤 Current User:', JSON.parse(currentUser));
    }
    
    const businessSettings = localStorage.getItem('businessSettings');
    if (businessSettings) {
        console.log('⚙️ Business Settings:', JSON.parse(businessSettings));
    }
    
    console.log('\n💼 Businesses:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('business_id_')) {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`   ${data.businessID}: ${data.companyName}`);
        }
    }
    
    console.log('\n👥 Staff Members:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('staff_')) {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`   ${data.staffId}: ${data.fullName} (${data.position})`);
        }
    }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('🎯 POS Test Data Generator Ready!');
    console.log('Commands available:');
    console.log('- createTestData() - Create sample business and staff data');
    console.log('- clearTestData() - Clear all POS data');
    console.log('- showCurrentData() - Display current data');
}

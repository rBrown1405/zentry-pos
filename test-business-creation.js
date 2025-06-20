// Test script for business creation functionality
// Run this in browser console after loading firebase-config.js and multi-property-manager.js

async function testBusinessCreation() {
    console.log('=== Testing Business Creation ===');
    
    try {
        // Wait for Firebase services to be available
        if (!window.firebaseServices) {
            console.error('❌ Firebase services not found');
            return;
        }
        
        console.log('✅ Firebase services found');
        console.log('Firebase connected:', window.firebaseServices.isConnected());
        console.log('Using Firebase:', window.firebaseServices.isUsingFirebase());
        
        // Test data
        const testBusinessData = {
            businessName: 'Test Hotel ' + Date.now(),
            businessType: 'hotel',
            address: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            phone: '555-0123',
            email: 'test@testhotel.com',
            hotelBrand: 'Independent',
            rewardsProgram: 'None'
        };
        
        console.log('Test business data:', testBusinessData);
        
        // Check if MultiPropertyManager is available
        if (!window.MultiPropertyManager) {
            console.error('❌ MultiPropertyManager not found');
            return;
        }
        
        console.log('✅ MultiPropertyManager found');
        
        // Create business account
        console.log('Creating business account...');
        const result = await window.MultiPropertyManager.createBusinessAccount(testBusinessData);
        
        if (result.success) {
            console.log('✅ Business creation successful!');
            console.log('Result:', result);
            
            // Test data retrieval
            console.log('Testing data retrieval...');
            const businesses = await window.firebaseServices.db.collection('businesses').get();
            console.log(`Found ${businesses.docs.length} businesses in storage`);
            
            businesses.forEach(doc => {
                console.log(`Business ID: ${doc.id}`, doc.data());
            });
            
        } else {
            console.error('❌ Business creation failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error);
        console.error(error.stack);
    }
}

// Auto-run test when Firebase is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        testBusinessCreation();
    }, 3000); // Wait 3 seconds for Firebase initialization
});

console.log('Test script loaded. Run testBusinessCreation() to test manually.');

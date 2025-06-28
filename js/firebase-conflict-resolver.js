// Firebase Conflict Resolver
// Ensures only one Firebase app is initialized with the correct configuration

(function() {
    'use strict';
    
    console.log('🔧 Firebase Conflict Resolver loading...');
    
    // Expected configuration for validation
    const EXPECTED_CONFIG = {
        apiKey: "AIzaSyAl5d3kJsCYGJ_PpkLhvYYQr9cQq9kuAVE",
        authDomain: "zentry-pos-b737b.firebaseapp.com",
        projectId: "zentry-pos-b737b",
        storageBucket: "zentry-pos-b737b.firebasestorage.app",
        messagingSenderId: "67930798018",
        appId: "1:67930798018:web:9fdc2413f766731c7d485b"
    };
    
    // Wait for Firebase to be available
    function waitForFirebase() {
        return new Promise((resolve) => {
            if (typeof firebase !== 'undefined') {
                resolve();
                return;
            }
            
            const checkInterval = setInterval(() => {
                if (typeof firebase !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('❌ Firebase SDK not loaded within timeout');
                resolve();
            }, 5000);
        });
    }
    
    // Validate and fix Firebase configuration
    async function validateFirebaseConfig() {
        await waitForFirebase();
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not available');
            return false;
        }
        
        try {
            // Check existing apps
            const existingApps = firebase.apps || [];
            
            if (existingApps.length === 0) {
                console.log('✅ No existing Firebase apps found');
                return true;
            }
            
            // Check if any app has wrong configuration
            let hasWrongConfig = false;
            
            existingApps.forEach((app, index) => {
                const config = app.options;
                console.log(`🔍 Checking Firebase app ${index}:`, config.apiKey?.substring(0, 10) + '...');
                
                if (config.apiKey !== EXPECTED_CONFIG.apiKey) {
                    console.warn(`⚠️ App ${index} has wrong API key: ${config.apiKey?.substring(0, 10)}...`);
                    hasWrongConfig = true;
                }
                
                if (config.projectId !== EXPECTED_CONFIG.projectId) {
                    console.warn(`⚠️ App ${index} has wrong project ID: ${config.projectId}`);
                    hasWrongConfig = true;
                }
            });
            
            if (hasWrongConfig) {
                console.log('🔄 Deleting apps with wrong configuration...');
                
                // Delete all existing apps
                const deletePromises = existingApps.map(app => {
                    try {
                        return app.delete();
                    } catch (error) {
                        console.warn('Warning deleting app:', error);
                        return Promise.resolve();
                    }
                });
                
                await Promise.all(deletePromises);
                console.log('✅ All existing Firebase apps deleted');
                
                // Force a reload to reinitialize with correct config
                console.log('🔄 Reloading page to reinitialize Firebase...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
                return false;
            }
            
            console.log('✅ Firebase configuration is correct');
            return true;
            
        } catch (error) {
            console.error('❌ Error validating Firebase config:', error);
            return false;
        }
    }
    
    // Auto-run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', validateFirebaseConfig);
    } else {
        validateFirebaseConfig();
    }
    
    // Make function available globally for debugging
    window.validateFirebaseConfig = validateFirebaseConfig;
    
})();

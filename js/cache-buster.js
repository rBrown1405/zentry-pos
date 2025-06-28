// Cache Busting and Version Management for Firebase Configuration
// This script ensures browsers always load the latest Firebase configuration

(function() {
    'use strict';
    
    const CONFIG_VERSION = '20250627001';
    const CONFIG_KEY = 'firebase_config_version';
    
    // Check if we need to clear cache
    const lastVersion = localStorage.getItem(CONFIG_KEY);
    
    if (lastVersion !== CONFIG_VERSION) {
        console.log(`🔄 Firebase config version updated from ${lastVersion} to ${CONFIG_VERSION}`);
        
        // Clear Firebase-related localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('firebase') || key.startsWith('firestore'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
                console.log(`🗑️ Cleared cached data: ${key}`);
            } catch (error) {
                console.warn(`Warning: Could not clear ${key}:`, error);
            }
        });
        
        // Update version
        localStorage.setItem(CONFIG_KEY, CONFIG_VERSION);
        
        // Force a hard reload if this is not the first load
        if (lastVersion && window.location.search.indexOf('cache_cleared=1') === -1) {
            console.log('🔄 Forcing cache refresh...');
            const separator = window.location.search ? '&' : '?';
            window.location.href = window.location.href + separator + 'cache_cleared=1';
            return;
        }
    }
    
    console.log(`✅ Firebase config version ${CONFIG_VERSION} loaded`);
    
})();

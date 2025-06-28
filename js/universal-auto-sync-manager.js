/**
 * Universal Auto-Sync Manager for Zentry POS
 * Ensures business context and menu data are always synchronized across all browsers and sessions
 */

class UniversalAutoSyncManager {
    constructor() {
        this.isInitialized = false;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncInterval = null;
        this.changeListeners = new Set();
        this.retryCount = 0;
        this.maxRetries = 3;
        this.umbrellaManagerRetryCount = 0;
        this.maxUmbrellaManagerRetries = 5;
        
        // Sync configuration
        this.config = {
            autoSyncInterval: 30000, // 30 seconds
            forceSync: true,
            enableRealTimeSync: true,
            debugMode: true
        };
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        this.log('🔄 Initializing Universal Auto-Sync Manager...', 'info');
        
        // Wait for dependencies
        await this.waitForDependencies();
        
        // Set up all sync mechanisms
        this.setupAutoSync();
        this.setupChangeListeners();
        this.setupVisibilitySync();
        this.setupStorageSync();
        this.setupPeriodicSync();
        
        // Initial sync
        await this.performFullSync();
        
        this.isInitialized = true;
        this.log('✅ Universal Auto-Sync Manager initialized successfully', 'success');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('autoSyncManagerReady'));
    }

    async waitForDependencies() {
        this.log('⏳ Waiting for dependencies...', 'info');
        
        // Wait for Firebase services (optional)
        let attempts = 0;
        while (!window.firebaseServices && attempts < 50) { // Reduced timeout for Firebase
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firebaseServices) {
            this.log('✅ Firebase services available', 'success');
        } else {
            this.log('⚠️ Firebase services not available - continuing without Firebase sync', 'warn');
        }
        
        // Wait for umbrella manager (optional)
        attempts = 0;
        while (!window.umbrellaManager && attempts < 50) { // Reduced timeout for umbrella manager
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.umbrellaManager) {
            this.log('✅ Umbrella manager available', 'success');
        } else {
            this.log('⚠️ Umbrella manager not available - continuing with localStorage-only sync', 'warn');
        }
        
        this.log('✅ Dependency check completed', 'success');
    }

    /**
     * Check if umbrella manager is ready and has required methods
     * @returns {boolean}
     */
    isUmbrellaManagerReady() {
        return !!(window.umbrellaManager && 
                  typeof window.umbrellaManager.setCurrentBusiness === 'function' &&
                  typeof window.umbrellaManager.currentBusiness !== 'undefined');
    }

    setupAutoSync() {
        // Sync on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.log('📄 Page loaded - triggering sync', 'info');
            this.performFullSync();
        });

        // Sync when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.log('👁️ Page became visible - triggering sync', 'info');
                this.performFullSync();
            }
        });

        // Sync on window focus
        window.addEventListener('focus', () => {
            this.log('🎯 Window focused - triggering sync', 'info');
            this.performFullSync();
        });

        // Sync on window blur (when leaving tab)
        window.addEventListener('blur', () => {
            this.log('📤 Window blurred - final sync before leaving', 'info');
            this.performFullSync();
        });

        // Sync on page show/hide events
        window.addEventListener('pageshow', () => {
            this.log('📥 Page shown - triggering sync', 'info');
            this.performFullSync();
        });

        window.addEventListener('pagehide', () => {
            this.log('📤 Page hiding - final sync', 'info');
            this.performFullSync();
        });

        // Sync before page unload
        window.addEventListener('beforeunload', () => {
            this.log('⚡ Before unload - emergency sync', 'info');
            this.performImmediateSync(); // Synchronous sync
        });

        // Sync on online/offline events
        window.addEventListener('online', () => {
            this.log('🌐 Back online - triggering full sync', 'info');
            this.performFullSync();
        });

        window.addEventListener('offline', () => {
            this.log('📶 Going offline - final sync', 'info');
            this.performFullSync();
        });

        // Sync when umbrella manager is ready
        window.addEventListener('umbrellaManagerReady', () => {
            this.log('🏢 Umbrella manager ready - triggering sync', 'info');
            this.performFullSync();
        });

        // Sync when business context changes
        window.addEventListener('businessContextConnected', () => {
            this.log('🔗 Business context connected - triggering sync', 'info');
            this.performFullSync();
        });

        // Enhanced activity detection
        this.setupActivityDetection();
        
        // Network change detection
        this.setupNetworkMonitoring();
        
        // Form and input monitoring
        this.setupFormMonitoring();
        
        // Button click monitoring for save actions
        this.setupSaveActionMonitoring();
    }

    setupChangeListeners() {
        // Listen for localStorage changes
        window.addEventListener('storage', (event) => {
            if (this.isBusinessRelatedKey(event.key)) {
                this.log(`💾 Storage changed: ${event.key} - triggering sync`, 'info');
                this.performFullSync();
            }
        });

        // Listen for menu changes
        document.addEventListener('menuItemsChanged', () => {
            this.log('📋 Menu items changed - triggering sync', 'info');
            this.syncMenuData();
        });

        // Listen for business changes
        document.addEventListener('businessChanged', () => {
            this.log('🏢 Business changed - triggering sync', 'info');
            this.performFullSync();
        });

        // Enhanced change detection
        this.setupMutationObserver();
        this.setupKeyboardActivityMonitoring();
        this.setupMouseActivityMonitoring();
    }

    setupActivityDetection() {
        let activityTimeout;
        const triggerActivitySync = () => {
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                this.log('🎯 User activity detected - triggering sync', 'info');
                this.performFullSync();
            }, 2000); // 2 second delay after activity stops
        };

        // Mouse activity
        ['mousedown', 'mouseup', 'click', 'dblclick'].forEach(event => {
            document.addEventListener(event, triggerActivitySync, { passive: true });
        });

        // Keyboard activity
        ['keydown', 'keyup'].forEach(event => {
            document.addEventListener(event, triggerActivitySync, { passive: true });
        });

        // Touch activity
        ['touchstart', 'touchend'].forEach(event => {
            document.addEventListener(event, triggerActivitySync, { passive: true });
        });

        // Scroll activity
        window.addEventListener('scroll', triggerActivitySync, { passive: true });
    }

    setupNetworkMonitoring() {
        // Monitor connection changes
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.log('📶 Network connection changed - triggering sync', 'info');
                this.performFullSync();
            });
        }

        // Periodic connectivity check
        setInterval(async () => {
            try {
                const response = await fetch('/?timestamp=' + Date.now(), { 
                    method: 'HEAD',
                    cache: 'no-cache' 
                });
                if (response.ok && !this.wasOnline) {
                    this.log('🌐 Network connectivity restored - triggering sync', 'info');
                    this.performFullSync();
                    this.wasOnline = true;
                }
            } catch (error) {
                this.wasOnline = false;
            }
        }, 15000); // Check every 15 seconds
    }

    setupFormMonitoring() {
        // Monitor all form submissions
        document.addEventListener('submit', (event) => {
            this.log('📝 Form submitted - triggering sync', 'info');
            this.performFullSync();
        });

        // Monitor input changes in business-related forms
        document.addEventListener('input', (event) => {
            const form = event.target.closest('form');
            if (form && this.isBusinessRelatedForm(form)) {
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => {
                    this.log('✏️ Business form input detected - triggering sync', 'info');
                    this.performFullSync();
                }, 3000); // 3 second delay after input stops
            }
        });

        // Monitor changes in specific business-related fields
        const businessFields = document.querySelectorAll(
            'input[name*="business"], input[id*="business"], ' +
            'input[name*="menu"], input[id*="menu"], ' +
            'textarea[name*="business"], textarea[id*="business"], ' +
            'select[name*="business"], select[id*="business"]'
        );

        businessFields.forEach(field => {
            field.addEventListener('change', () => {
                this.log(`📝 Business field changed: ${field.name || field.id} - triggering sync`, 'info');
                this.performFullSync();
            });
        });
    }

    setupSaveActionMonitoring() {
        // Monitor save button clicks
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // Check if it's a save button
            if (this.isSaveButton(target)) {
                this.log('💾 Save button clicked - triggering sync', 'info');
                this.performFullSync();
            }

            // Check if it's a menu-related button
            if (this.isMenuButton(target)) {
                this.log('📋 Menu action button clicked - triggering sync', 'info');
                this.performFullSync();
            }

            // Check if it's a business-related button
            if (this.isBusinessButton(target)) {
                this.log('🏢 Business action button clicked - triggering sync', 'info');
                this.performFullSync();
            }
        });

        // Monitor specific function calls that might change data
        this.overrideSaveFunctions();
    }

    setupMutationObserver() {
        // Watch for DOM changes that might indicate data updates
        const observer = new MutationObserver((mutations) => {
            let shouldSync = false;
            
            mutations.forEach((mutation) => {
                // Check if menu items were added/removed
                if (mutation.target.classList?.contains('menu-item') || 
                    mutation.target.closest?.('.menu-items') ||
                    mutation.target.id?.includes('menu')) {
                    shouldSync = true;
                }

                // Check for business context changes
                if (mutation.target.classList?.contains('business-info') ||
                    mutation.target.closest?.('.business-context') ||
                    mutation.target.id?.includes('business')) {
                    shouldSync = true;
                }
            });

            if (shouldSync) {
                clearTimeout(this.mutationTimeout);
                this.mutationTimeout = setTimeout(() => {
                    this.log('🔄 DOM mutations detected - triggering sync', 'info');
                    this.performFullSync();
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id', 'data-business-id']
        });

        this.mutationObserver = observer;
    }

    setupKeyboardActivityMonitoring() {
        // Monitor specific key combinations that might trigger saves
        document.addEventListener('keydown', (event) => {
            // Ctrl+S or Cmd+S
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault(); // Prevent browser save dialog
                this.log('⌨️ Save shortcut detected - triggering sync', 'info');
                this.performFullSync();
            }

            // Escape key (might cancel edits, need to sync)
            if (event.key === 'Escape') {
                this.log('⌨️ Escape key pressed - triggering sync', 'info');
                this.performFullSync();
            }

            // Enter key in forms
            if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
                const form = event.target.closest('form');
                if (form && this.isBusinessRelatedForm(form)) {
                    this.log('⌨️ Enter in business form - triggering sync', 'info');
                    this.performFullSync();
                }
            }
        });
    }

    setupMouseActivityMonitoring() {
        // Monitor right-click context menu (might indicate user actions)
        document.addEventListener('contextmenu', () => {
            clearTimeout(this.contextTimeout);
            this.contextTimeout = setTimeout(() => {
                this.log('🖱️ Context menu activity - triggering sync', 'info');
                this.performFullSync();
            }, 1000);
        });

        // Monitor drag and drop operations
        document.addEventListener('dragstart', () => {
            this.log('🖱️ Drag operation started', 'info');
        });

        document.addEventListener('drop', () => {
            this.log('🖱️ Drop operation completed - triggering sync', 'info');
            this.performFullSync();
        });
    }

    setupVisibilitySync() {
        // Enhanced visibility change handling
        let wasHidden = false;
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                wasHidden = true;
            } else if (wasHidden) {
                this.log('🔄 Returning from background - full sync', 'info');
                this.performFullSync();
                wasHidden = false;
            }
        });
    }

    setupStorageSync() {
        // Monitor localStorage for any business-related changes
        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        const self = this;

        localStorage.setItem = function(key, value) {
            const result = originalSetItem.apply(this, arguments);
            if (self.isBusinessRelatedKey(key)) {
                self.log(`💾 localStorage.setItem(${key}) - triggering sync`, 'info');
                setTimeout(() => self.performFullSync(), 100);
            }
            return result;
        };

        localStorage.removeItem = function(key) {
            const result = originalRemoveItem.apply(this, arguments);
            if (self.isBusinessRelatedKey(key)) {
                self.log(`🗑️ localStorage.removeItem(${key}) - triggering sync`, 'info');
                setTimeout(() => self.performFullSync(), 100);
            }
            return result;
        };
    }

    setupPeriodicSync() {
        // Main periodic sync every 30 seconds
        this.syncInterval = setInterval(() => {
            this.log('⏰ Periodic sync triggered (30s)', 'info');
            this.performFullSync();
        }, this.config.autoSyncInterval);

        // More frequent sync when page has focus (every 15 seconds)
        this.activeSyncInterval = setInterval(() => {
            if (!document.hidden && document.hasFocus()) {
                this.log('⏰ Active session sync triggered (15s)', 'info');
                this.performFullSync();
            }
        }, 15000);

        // Heartbeat sync every 2 minutes to ensure we never go too long without syncing
        this.heartbeatInterval = setInterval(() => {
            this.log('💓 Heartbeat sync triggered (2m)', 'info');
            this.performFullSync();
        }, 120000);

        // Ultra-frequent sync for critical business operations (every 10 seconds when editing)
        this.criticalSyncInterval = setInterval(() => {
            if (this.isInCriticalEditingMode()) {
                this.log('🔥 Critical editing mode sync (10s)', 'info');
                this.performFullSync();
            }
        }, 10000);
    }

    isInCriticalEditingMode() {
        // Check if user is actively editing business data
        const activeElement = document.activeElement;
        
        // Check if currently editing a form
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            const form = activeElement.closest('form');
            if (form && this.isBusinessRelatedForm(form)) {
                return true;
            }
        }

        // Check if on menu editor page
        if (window.location.pathname.includes('menu-editor') || 
            document.title.includes('Menu Editor')) {
            return true;
        }

        // Check if on business settings page
        if (window.location.pathname.includes('business-settings') || 
            document.title.includes('Business Settings')) {
            return true;
        }

        // Check if any business-related modals are open
        const modals = document.querySelectorAll('.modal:not([style*="display: none"]), .popup:not([style*="display: none"])');
        for (let modal of modals) {
            if (this.isBusinessRelatedForm(modal)) {
                return true;
            }
        }

        return false;
    }

    async performFullSync() {
        if (this.syncInProgress) {
            this.log('⚠️ Sync already in progress, skipping', 'warn');
            return;
        }

        this.syncInProgress = true;
        this.log('🔄 Starting full sync...', 'info');

        try {
            // 1. Sync business context
            await this.syncBusinessContext();
            
            // 2. Sync menu data
            await this.syncMenuData();
            
            // 3. Update UI status
            this.updateSyncStatus();
            
            this.lastSyncTime = new Date();
            this.retryCount = 0;
            this.log('✅ Full sync completed successfully', 'success');
            
            // Dispatch sync complete event
            document.dispatchEvent(new CustomEvent('autoSyncCompleted', {
                detail: { timestamp: this.lastSyncTime }
            }));

        } catch (error) {
            this.log(`❌ Sync failed: ${error.message}`, 'error');
            this.handleSyncError(error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Synchronous sync for critical moments (page unload)
    performImmediateSync() {
        try {
            this.log('⚡ Performing immediate sync...', 'info');
            
            // Use sendBeacon for reliable data transmission during page unload
            const syncData = {
                timestamp: Date.now(),
                businessData: localStorage.getItem('currentBusiness'),
                menuData: localStorage.getItem('menuItems'),
                userData: localStorage.getItem('currentUser')
            };

            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(syncData)], { type: 'application/json' });
                const sent = navigator.sendBeacon('/api/emergency-sync', blob);
                this.log(`📡 Emergency sync beacon sent: ${sent}`, sent ? 'success' : 'warn');
            }

            // Also try immediate Firebase sync if available
            if (window.firebaseServices?.getDb()) {
                this.syncBusinessContextImmediate();
                this.syncMenuDataImmediate();
            }

        } catch (error) {
            this.log(`❌ Immediate sync failed: ${error.message}`, 'error');
        }
    }

    syncBusinessContextImmediate() {
        try {
            const localBusiness = localStorage.getItem('currentBusiness');
            const localUser = localStorage.getItem('currentUser');
            
            if (localBusiness && localUser && window.firebaseServices?.getDb()) {
                const businessData = JSON.parse(localBusiness);
                const userData = JSON.parse(localUser);
                const db = window.firebaseServices.getDb();
                
                // Fire and forget immediate sync
                db.collection('businesses').doc(businessData.id || `business_${Date.now()}`).set({
                    ...businessData,
                    lastEmergencySync: new Date().toISOString(),
                    emergencySyncSource: 'page_unload'
                }, { merge: true });
            }
        } catch (error) {
            this.log(`❌ Immediate business sync failed: ${error.message}`, 'error');
        }
    }

    syncMenuDataImmediate() {
        try {
            const menuData = localStorage.getItem('menuItems');
            const businessId = JSON.parse(localStorage.getItem('currentBusiness') || '{}').id;
            
            if (menuData && businessId && window.firebaseServices?.getDb()) {
                const db = window.firebaseServices.getDb();
                
                // Fire and forget immediate sync
                db.collection('menus').doc(`${businessId}_restaurant`).set({
                    items: JSON.parse(menuData),
                    lastEmergencySync: new Date().toISOString(),
                    emergencySyncSource: 'page_unload'
                }, { merge: true });
            }
        } catch (error) {
            this.log(`❌ Immediate menu sync failed: ${error.message}`, 'error');
        }
    }

    async syncBusinessContext() {
        this.log('🏢 Syncing business context...', 'info');

        try {
            // Check if we have localStorage business data
            const localBusiness = localStorage.getItem('currentBusiness');
            const localUser = localStorage.getItem('currentUser');

            if (!localBusiness || !localUser) {
                this.log('⚠️ No local business data found', 'warn');
                return;
            }

            const businessData = JSON.parse(localBusiness);
            const userData = JSON.parse(localUser);

            // Ensure umbrella manager has the business context
            if (!window.umbrellaManager?.currentBusiness && this.isUmbrellaManagerReady()) {
                this.log('🔗 Setting business in umbrella manager...', 'info');
                
                const umbrellaBusinessData = {
                    id: businessData.id || `business_${Date.now()}`,
                    companyName: businessData.name || businessData.businessName || userData.businessName,
                    businessType: userData.businessType || businessData.type || 'restaurant',
                    businessCode: businessData.id,
                    ownerName: userData.name,
                    companyEmail: userData.email || '',
                    companyPhone: userData.phone || '',
                    isActive: true,
                    createdAt: businessData.createdAt || new Date().toISOString(),
                    source: 'auto_sync_manager'
                };

                try {
                    window.umbrellaManager.setCurrentBusiness(umbrellaBusinessData.id, umbrellaBusinessData);
                    this.log(`✅ Business set in umbrella manager: ${umbrellaBusinessData.companyName}`, 'success');
                } catch (methodError) {
                    this.log(`⚠️ Umbrella manager method error: ${methodError.message}`, 'warn');
                }
            } else if (!this.isUmbrellaManagerReady()) {
                this.umbrellaManagerRetryCount++;
                
                if (this.umbrellaManagerRetryCount <= this.maxUmbrellaManagerRetries) {
                    this.log(`⚠️ Umbrella manager not ready - scheduling retry ${this.umbrellaManagerRetryCount}/${this.maxUmbrellaManagerRetries}`, 'warn');
                    // Retry after a short delay if umbrella manager is not ready
                    setTimeout(() => {
                        if (this.isUmbrellaManagerReady()) {
                            this.log('🔄 Umbrella manager now ready - retrying business context sync', 'info');
                            this.umbrellaManagerRetryCount = 0; // Reset on success
                            this.syncBusinessContext();
                        }
                    }, 3000); // Retry after 3 seconds
                } else {
                    this.log(`❌ Umbrella manager not available after ${this.maxUmbrellaManagerRetries} attempts - stopping retries`, 'error');
                    this.umbrellaManagerRetryCount = 0; // Reset for next cycle
                }
            }

            // Sync to Firebase if available
            if (window.firebaseServices?.getDb()) {
                await this.syncBusinessToFirebase(businessData, userData);
            }

        } catch (error) {
            this.log(`❌ Business context sync failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async syncBusinessToFirebase(businessData, userData) {
        try {
            const db = window.firebaseServices.getDb();
            
            const firebaseBusinessData = {
                id: businessData.id || `business_${Date.now()}`,
                companyName: businessData.name || businessData.businessName || userData.businessName,
                businessType: userData.businessType || businessData.type || 'restaurant',
                companyEmail: userData.email || businessData.email || '',
                companyPhone: userData.phone || businessData.phone || '',
                address: businessData.address || {},
                isActive: true,
                createdAt: businessData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastSyncedAt: new Date().toISOString(),
                source: 'auto_sync_manager'
            };

            await db.collection('businesses').doc(firebaseBusinessData.id).set(firebaseBusinessData, { merge: true });
            this.log('✅ Business data synced to Firebase', 'success');

            // Update localStorage with synced ID
            if (!businessData.id) {
                businessData.id = firebaseBusinessData.id;
                localStorage.setItem('currentBusiness', JSON.stringify(businessData));
            }

        } catch (error) {
            this.log(`⚠️ Firebase business sync failed: ${error.message}`, 'warn');
            // Don't throw - this is not critical for local operation
        }
    }

    async syncMenuData() {
        this.log('📋 Syncing menu data...', 'info');

        try {
            if (!window.umbrellaManager?.currentBusiness) {
                this.log('⚠️ No business context for menu sync', 'warn');
                return;
            }

            if (!window.firebaseServices?.getDb()) {
                this.log('⚠️ Firebase not available for menu sync', 'warn');
                return;
            }

            const db = window.firebaseServices.getDb();
            const businessId = window.umbrellaManager.currentBusiness.id;

            // Get local menu data
            const localMenuData = localStorage.getItem('menuItems');
            
            if (localMenuData) {
                const menuItems = JSON.parse(localMenuData);
                
                // Upload to Firebase
                const menuDoc = {
                    businessId: businessId,
                    menuType: 'restaurant',
                    items: menuItems,
                    lastUpdated: new Date().toISOString(),
                    lastSyncedAt: new Date().toISOString(),
                    isActive: true,
                    editorVersion: '2.0',
                    totalItems: menuItems.length,
                    source: 'auto_sync_manager'
                };

                await db.collection('menus').doc(`${businessId}_restaurant`).set(menuDoc, { merge: true });
                this.log(`✅ Menu synced to Firebase: ${menuItems.length} items`, 'success');
            }

            // Also try to sync from Firebase to localStorage (in case cloud has newer data)
            const cloudMenuDoc = await db.collection('menus').doc(`${businessId}_restaurant`).get();
            if (cloudMenuDoc.exists) {
                const cloudMenu = cloudMenuDoc.data();
                const cloudItems = cloudMenu.items || [];
                
                // Compare timestamps to see which is newer
                const localTimestamp = localMenuData ? new Date(JSON.parse(localMenuData)[0]?.lastUpdated || 0) : new Date(0);
                const cloudTimestamp = new Date(cloudMenu.lastUpdated || 0);
                
                if (cloudTimestamp > localTimestamp && cloudItems.length > 0) {
                    localStorage.setItem('menuItems', JSON.stringify(cloudItems));
                    this.log(`✅ Newer menu downloaded from cloud: ${cloudItems.length} items`, 'success');
                    
                    // Trigger menu refresh if we're on menu editor
                    if (typeof renderMenuItems === 'function') {
                        renderMenuItems();
                    }
                }
            }

        } catch (error) {
            this.log(`❌ Menu sync failed: ${error.message}`, 'error');
            // Don't throw - menu sync failure shouldn't break other functionality
        }
    }

    updateSyncStatus() {
        // Update cloud status in menu editor if present
        if (typeof updateCloudStatus === 'function' && window.umbrellaManager?.currentBusiness) {
            const business = window.umbrellaManager.currentBusiness;
            updateCloudStatus('connected', `Connected to ${business.companyName} (auto-synced)`);
        }

        // Update any sync indicators
        const syncIndicators = document.querySelectorAll('.sync-indicator, .cloud-status');
        syncIndicators.forEach(indicator => {
            if (window.umbrellaManager?.currentBusiness) {
                indicator.classList.remove('offline', 'error');
                indicator.classList.add('connected');
            }
        });
    }

    handleSyncError(error) {
        this.retryCount++;
        
        if (this.retryCount < this.maxRetries) {
            const retryDelay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
            this.log(`🔄 Retrying sync in ${retryDelay}ms (attempt ${this.retryCount}/${this.maxRetries})`, 'warn');
            
            setTimeout(() => {
                this.performFullSync();
            }, retryDelay);
        } else {
            this.log(`❌ Sync failed after ${this.maxRetries} attempts`, 'error');
            this.retryCount = 0; // Reset for next sync cycle
        }
    }

    isBusinessRelatedKey(key) {
        const businessKeys = [
            'currentBusiness',
            'currentUser',
            'menuItems',
            'currentBusinessContext',
            'selectedProperty',
            'businessInfo',
            'propertyContext',
            'businessLoginData',
            'currentBusinessId',
            'roomServiceMenu',
            'staffMembers',
            'businessSettings'
        ];
        return businessKeys.some(businessKey => key && (key === businessKey || key.includes(businessKey)));
    }

    isBusinessRelatedForm(form) {
        if (!form) return false;
        
        const businessIdentifiers = [
            'business', 'menu', 'restaurant', 'property', 'staff', 'settings'
        ];
        
        const formId = form.id?.toLowerCase() || '';
        const formClass = form.className?.toLowerCase() || '';
        
        return businessIdentifiers.some(identifier => 
            formId.includes(identifier) || formClass.includes(identifier)
        );
    }

    isSaveButton(element) {
        if (!element) return false;
        
        const text = element.textContent?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';
        const className = element.className?.toLowerCase() || '';
        const onclick = element.getAttribute('onclick')?.toLowerCase() || '';
        
        const saveIdentifiers = ['save', 'submit', 'update', 'confirm', 'apply'];
        
        return saveIdentifiers.some(identifier => 
            text.includes(identifier) || 
            id.includes(identifier) || 
            className.includes(identifier) ||
            onclick.includes(identifier)
        );
    }

    isMenuButton(element) {
        if (!element) return false;
        
        const text = element.textContent?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';
        const className = element.className?.toLowerCase() || '';
        const onclick = element.getAttribute('onclick')?.toLowerCase() || '';
        
        const menuIdentifiers = ['menu', 'item', 'add', 'delete', 'edit', 'category'];
        
        return menuIdentifiers.some(identifier => 
            text.includes(identifier) || 
            id.includes(identifier) || 
            className.includes(identifier) ||
            onclick.includes(identifier)
        );
    }

    isBusinessButton(element) {
        if (!element) return false;
        
        const text = element.textContent?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';
        const className = element.className?.toLowerCase() || '';
        const onclick = element.getAttribute('onclick')?.toLowerCase() || '';
        
        const businessIdentifiers = ['business', 'register', 'login', 'switch', 'connect', 'sync'];
        
        return businessIdentifiers.some(identifier => 
            text.includes(identifier) || 
            id.includes(identifier) || 
            className.includes(identifier) ||
            onclick.includes(identifier)
        );
    }

    overrideSaveFunctions() {
        // Override common save functions if they exist
        const functionsToOverride = [
            'saveMenuData',
            'saveMenuItem', 
            'addMenuItem',
            'editMenuItem',
            'deleteMenuItem',
            'saveBusiness',
            'registerBusiness',
            'updateBusiness',
            'saveSettings',
            'connectBusiness'
        ];

        functionsToOverride.forEach(funcName => {
            if (window[funcName] && typeof window[funcName] === 'function') {
                const originalFunc = window[funcName];
                window[funcName] = async (...args) => {
                    this.log(`🔧 ${funcName} called - triggering pre-sync`, 'info');
                    await this.performFullSync();
                    
                    const result = await originalFunc.apply(this, args);
                    
                    this.log(`🔧 ${funcName} completed - triggering post-sync`, 'info');
                    setTimeout(() => this.performFullSync(), 500);
                    
                    return result;
                };
                this.log(`🔧 Overridden function: ${funcName}`, 'info');
            }
        });
    }

    log(message, type = 'info') {
        if (!this.config.debugMode) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = '[AutoSync]';
        
        switch (type) {
            case 'success':
                console.log(`%c${prefix} ${timestamp} ${message}`, 'color: #22c55e; font-weight: bold');
                break;
            case 'warn':
                console.warn(`%c${prefix} ${timestamp} ${message}`, 'color: #f59e0b; font-weight: bold');
                break;
            case 'error':
                console.error(`%c${prefix} ${timestamp} ${message}`, 'color: #ef4444; font-weight: bold');
                break;
            default:
                console.log(`%c${prefix} ${timestamp} ${message}`, 'color: #3b82f6; font-weight: bold');
        }
    }

    // Public API
    async forceSyncNow() {
        this.log('🚀 Force sync requested', 'info');
        await this.performFullSync();
    }

    enableDebugMode() {
        this.config.debugMode = true;
        this.log('🐛 Debug mode enabled', 'info');
    }

    disableDebugMode() {
        this.config.debugMode = false;
    }

    getLastSyncTime() {
        return this.lastSyncTime;
    }

    isInSync() {
        return !this.syncInProgress && this.lastSyncTime && (Date.now() - this.lastSyncTime.getTime()) < 60000;
    }

    destroy() {
        // Clear all intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        if (this.activeSyncInterval) {
            clearInterval(this.activeSyncInterval);
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.criticalSyncInterval) {
            clearInterval(this.criticalSyncInterval);
        }

        // Clear all timeouts
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
        }
        if (this.mutationTimeout) {
            clearTimeout(this.mutationTimeout);
        }
        if (this.contextTimeout) {
            clearTimeout(this.contextTimeout);
        }

        // Disconnect mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.changeListeners.clear();
        this.isInitialized = false;
        this.log('🛑 Auto-sync manager destroyed', 'info');
    }

    // Enhanced public API methods
    async forceSyncNow() {
        this.log('🚀 Force sync requested via API', 'info');
        this.syncInProgress = false; // Allow force sync even if one is in progress
        await this.performFullSync();
    }

    async emergencySync() {
        this.log('🚨 Emergency sync requested', 'warn');
        this.performImmediateSync();
        return new Promise(resolve => {
            setTimeout(async () => {
                await this.forceSyncNow();
                resolve();
            }, 100);
        });
    }

    getSyncStatus() {
        const timeSinceLastSync = this.lastSyncTime ? Date.now() - this.lastSyncTime.getTime() : null;
        
        return {
            isInitialized: this.isInitialized,
            syncInProgress: this.syncInProgress,
            lastSyncTime: this.lastSyncTime,
            timeSinceLastSync,
            retryCount: this.retryCount,
            isInCriticalMode: this.isInCriticalEditingMode(),
            config: this.config
        };
    }

    updateSyncFrequency(intervalMs) {
        this.config.autoSyncInterval = intervalMs;
        
        // Restart intervals with new frequency
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = setInterval(() => {
                this.log('⏰ Periodic sync triggered (custom)', 'info');
                this.performFullSync();
            }, intervalMs);
        }
        
        this.log(`⚙️ Sync frequency updated to ${intervalMs}ms`, 'info');
    }

    enableAggressiveSync() {
        this.config.autoSyncInterval = 15000; // 15 seconds
        this.updateSyncFrequency(15000);
        this.log('🔥 Aggressive sync mode enabled (15s intervals)', 'warn');
    }

    enableRelaxedSync() {
        this.config.autoSyncInterval = 60000; // 1 minute
        this.updateSyncFrequency(60000);
        this.log('😌 Relaxed sync mode enabled (60s intervals)', 'info');
    }
}

// Auto-initialize when script loads (can be disabled by setting window.disableAutoSyncAutoInit = true)
let globalAutoSyncManager = null;

// Initialize after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoSync);
} else {
    initializeAutoSync();
}

function initializeAutoSync() {
    // Allow disabling auto-initialization
    if (window.disableAutoSyncAutoInit) {
        console.log('🚫 Auto-sync auto-initialization disabled');
        return;
    }
    
    if (!globalAutoSyncManager) {
        globalAutoSyncManager = new UniversalAutoSyncManager();
        window.autoSyncManager = globalAutoSyncManager;
    }
}

// Expose globally
window.UniversalAutoSyncManager = UniversalAutoSyncManager;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalAutoSyncManager;
}

// Hotel Mode Management System for Macros POS
class HotelMode {
    static HOTEL_BRANDS = {
        'marriott': {
            name: 'Marriott International',
            loyaltyProgram: 'Marriott Bonvoy',
            tiers: ['Non-Member', 'Member', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Titanium Elite', 'Ambassador Elite']
        },
        'hilton': {
            name: 'Hilton Hotels & Resorts',
            loyaltyProgram: 'Hilton Honors',
            tiers: ['Member', 'Silver', 'Gold', 'Diamond']
        },
        'hyatt': {
            name: 'Hyatt Hotels Corporation',
            loyaltyProgram: 'World of Hyatt',
            tiers: ['Member', 'Discoverist', 'Explorist', 'Globalist']
        },
        'ihg': {
            name: 'InterContinental Hotels Group',
            loyaltyProgram: 'IHG One Rewards',
            tiers: ['Club', 'Gold Elite', 'Platinum Elite', 'Spire Elite']
        },
        'accor': {
            name: 'Accor Hotels',
            loyaltyProgram: 'ALL - Accor Live Limitless',
            tiers: ['Classic', 'Silver', 'Gold', 'Platinum', 'Diamond']
        },
        'wyndham': {
            name: 'Wyndham Hotels & Resorts',
            loyaltyProgram: 'Wyndham Rewards',
            tiers: ['Blue', 'Gold', 'Platinum', 'Diamond']
        },
        'choice': {
            name: 'Choice Hotels',
            loyaltyProgram: 'Choice Privileges',
            tiers: ['Member', 'Gold', 'Platinum', 'Diamond']
        },
        'independent': {
            name: 'Independent Hotel',
            loyaltyProgram: 'Custom Loyalty Program',
            tiers: ['Member', 'Silver', 'Gold', 'Platinum']
        },
        'other': {
            name: 'Other Brand',
            loyaltyProgram: 'Custom Loyalty Program',
            tiers: ['Member', 'Silver', 'Gold', 'Platinum']
        }
    };

    /**
     * Check if Hotel Mode should be activated for the current business
     */
    static isHotelModeActive() {
        try {
            const businessSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            // Check if business type is hotel
            if (businessSettings.type === 'hotel') {
                return true;
            }
            
            // Check property type from user context
            if (currentUser.propertyType === 'hotel') {
                return true;
            }
            
            // Check localStorage property type
            const propertyType = localStorage.getItem('propertyType');
            if (propertyType === 'hotel') {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking hotel mode status:', error);
            return false;
        }
    }

    /**
     * Activate Hotel Mode for the business
     */
    static activateHotelMode(hotelBrand = 'independent') {
        try {
            const businessSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
            
            // Update business settings
            businessSettings.hotelMode = true;
            businessSettings.type = 'hotel';
            businessSettings.hotelBrand = hotelBrand;
            businessSettings.activatedAt = new Date().toISOString();
            
            // Set default hotel-specific settings if not already set
            if (!businessSettings.taxRate) {
                businessSettings.taxRate = 0.0875; // 8.75% default tax
            }
            if (!businessSettings.serviceCharge) {
                businessSettings.serviceCharge = 0.18; // 18% service charge
            }
            
            localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
            localStorage.setItem('hotelModeActive', 'true');
            
            console.log('🏨 Hotel Mode activated successfully:', hotelBrand);
            
            // Apply hotel styling if in a DOM environment
            if (typeof document !== 'undefined') {
                this.applyHotelStyling();
            }
            
            return true;
        } catch (error) {
            console.error('Error activating Hotel Mode:', error);
            return false;
        }
    }

    /**
     * Deactivate Hotel Mode and switch to restaurant mode
     */
    static deactivateHotelMode() {
        try {
            const businessSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
            
            // Update business settings
            businessSettings.hotelMode = false;
            businessSettings.type = 'restaurant';
            businessSettings.deactivatedAt = new Date().toISOString();
            
            localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
            localStorage.removeItem('hotelModeActive');
            
            // Clear hotel-specific data
            localStorage.removeItem('roomServiceMenu');
            localStorage.removeItem('roomServiceOrders');
            
            console.log('🏢 Hotel Mode deactivated - switched to restaurant mode');
            
            return true;
        } catch (error) {
            console.error('Error deactivating Hotel Mode:', error);
            return false;
        }
    }

    /**
     * Get hotel brand information
     */
    static getHotelBrand() {
        try {
            const businessSettings = JSON.parse(localStorage.getItem('businessSettings') || '{}');
            return businessSettings.hotelBrand || 'independent';
        } catch (error) {
            console.error('Error getting hotel brand:', error);
            return 'independent';
        }
    }

    /**
     * Get loyalty program tiers for the current hotel brand
     */
    static getLoyaltyTiers() {
        const brand = this.getHotelBrand();
        return this.HOTEL_BRANDS[brand]?.tiers || this.HOTEL_BRANDS['independent'].tiers;
    }

    /**
     * Get loyalty program name for the current hotel brand
     */
    static getLoyaltyProgramName() {
        const brand = this.getHotelBrand();
        return this.HOTEL_BRANDS[brand]?.loyaltyProgram || this.HOTEL_BRANDS['independent'].loyaltyProgram;
    }

    /**
     * Initialize room service menu by copying from restaurant menu
     */
    static initializeRoomServiceMenu() {
        try {
            // Check if room service menu already exists
            const existingRoomServiceMenu = localStorage.getItem('roomServiceMenu');
            if (existingRoomServiceMenu) {
                console.log('Room service menu already exists');
                return JSON.parse(existingRoomServiceMenu);
            }

            // Get restaurant menu
            const restaurantMenu = JSON.parse(localStorage.getItem('menuItems') || '[]');
            
            // Create room service menu with sync flags
            const roomServiceMenu = restaurantMenu.map(item => ({
                ...item,
                id: `rs_${item.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                originalId: item.id || `orig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                syncedFromRestaurant: true,
                lastSyncDate: new Date().toISOString(),
                customized: false
            }));

            // Save room service menu
            localStorage.setItem('roomServiceMenu', JSON.stringify(roomServiceMenu));
            console.log('Room service menu initialized with', roomServiceMenu.length, 'items');
            
            return roomServiceMenu;
        } catch (error) {
            console.error('Error initializing room service menu:', error);
            return [];
        }
    }

    /**
     * Sync room service menu with restaurant menu updates
     */
    static syncMenus() {
        try {
            const restaurantMenu = JSON.parse(localStorage.getItem('menuItems') || '[]');
            const roomServiceMenu = JSON.parse(localStorage.getItem('roomServiceMenu') || '[]');
            
            let syncedItems = 0;
            const currentTime = new Date().toISOString();
            
            // Create a map of room service items by their original ID
            const roomServiceMap = new Map();
            roomServiceMenu.forEach(item => {
                if (item.originalId) {
                    roomServiceMap.set(item.originalId, item);
                }
            });
            
            // Sync restaurant items to room service
            const updatedRoomServiceMenu = [];
            
            restaurantMenu.forEach(restItem => {
                const roomServiceItem = roomServiceMap.get(restItem.id);
                
                if (roomServiceItem) {
                    // Item exists in room service
                    if (roomServiceItem.syncedFromRestaurant && !roomServiceItem.customized) {
                        // Update synced item that hasn't been customized
                        updatedRoomServiceMenu.push({
                            ...roomServiceItem,
                            name: restItem.name,
                            price: restItem.price,
                            category: restItem.category,
                            description: restItem.description,
                            lastSyncDate: currentTime
                        });
                        syncedItems++;
                    } else {
                        // Keep customized item as-is
                        updatedRoomServiceMenu.push(roomServiceItem);
                    }
                } else {
                    // New item from restaurant - add to room service
                    updatedRoomServiceMenu.push({
                        ...restItem,
                        id: `rs_${restItem.id}_${Math.random().toString(36).substr(2, 9)}`,
                        originalId: restItem.id,
                        syncedFromRestaurant: true,
                        lastSyncDate: currentTime,
                        customized: false
                    });
                    syncedItems++;
                }
            });
            
            // Add any room service exclusive items that don't have restaurant counterparts
            roomServiceMenu.forEach(rsItem => {
                if (!rsItem.originalId || !restaurantMenu.find(r => r.id === rsItem.originalId)) {
                    // This is a room service exclusive item
                    updatedRoomServiceMenu.push(rsItem);
                }
            });
            
            // Save updated room service menu
            localStorage.setItem('roomServiceMenu', JSON.stringify(updatedRoomServiceMenu));
            
            console.log(`Menu sync completed: ${syncedItems} items synced`);
            return { syncedItems, totalItems: updatedRoomServiceMenu.length };
        } catch (error) {
            console.error('Error syncing menus:', error);
            return { syncedItems: 0, totalItems: 0 };
        }
    }

    /**
     * Sync room service menu with a provided restaurant menu (for testing)
     */
    static syncMenuWithRestaurant(restaurantMenu) {
        try {
            if (!Array.isArray(restaurantMenu)) {
                throw new Error('Restaurant menu must be an array');
            }

            const currentTime = new Date().toISOString();
            let roomServiceMenu = JSON.parse(localStorage.getItem('roomServiceMenu') || '[]');
            
            // Add hotel-specific enhancements to restaurant items
            const enhancedMenu = restaurantMenu.map(item => ({
                ...item,
                id: item.id || `rs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                roomServicePrice: item.price * 1.2, // 20% markup for room service
                deliveryTime: '25-35 minutes',
                lastSyncDate: currentTime,
                isCustomized: false
            }));

            // Merge with existing room service items, preserving customized items
            const existingCustomizedItems = roomServiceMenu.filter(item => item.isCustomized);
            const mergedMenu = [...enhancedMenu, ...existingCustomizedItems];
            
            localStorage.setItem('roomServiceMenu', JSON.stringify(mergedMenu));
            
            console.log(`Synced ${enhancedMenu.length} items from restaurant menu to room service menu`);
            return mergedMenu;
        } catch (error) {
            console.error('Error syncing with restaurant menu:', error);
            return [];
        }
    }

    /**
     * Mark a room service item as customized (no longer syncs with restaurant)
     */
    static markItemAsCustomized(itemId) {
        try {
            const roomServiceMenu = JSON.parse(localStorage.getItem('roomServiceMenu') || '[]');
            const updatedMenu = roomServiceMenu.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        customized: true,
                        syncedFromRestaurant: false,
                        lastCustomizedDate: new Date().toISOString()
                    };
                }
                return item;
            });
            
            localStorage.setItem('roomServiceMenu', JSON.stringify(updatedMenu));
            console.log(`Item ${itemId} marked as customized`);
        } catch (error) {
            console.error('Error marking item as customized:', error);
        }
    }

    /**
     * Get room service menu
     */
    static getRoomServiceMenu() {
        try {
            return JSON.parse(localStorage.getItem('roomServiceMenu') || '[]');
        } catch (error) {
            console.error('Error getting room service menu:', error);
            return [];
        }
    }

    /**
     * Update room service menu
     */
    static updateRoomServiceMenu(menu) {
        try {
            localStorage.setItem('roomServiceMenu', JSON.stringify(menu));
        } catch (error) {
            console.error('Error updating room service menu:', error);
        }
    }

    /**
     * Add room service specific styling and behavior
     */
    static applyHotelStyling() {
        // Add hotel-specific CSS classes and styling
        document.body.classList.add('hotel-mode');
        
        // Update property name display
        const hotelNameElement = document.querySelector('.hotel-name');
        if (hotelNameElement) {
            hotelNameElement.innerHTML = '🏨 ' + hotelNameElement.textContent;
        }
    }

    /**
     * Process room service order with guest information
     */
    static processRoomServiceOrder(orderData) {
        try {
            // Add hotel-specific order processing
            const roomServiceOrder = {
                ...orderData,
                type: 'room_service',
                guestInfo: {
                    name: orderData.guestName,
                    room: orderData.roomNumber,
                    loyaltyStatus: orderData.loyaltyStatus
                },
                timestamp: new Date().toISOString(),
                estimatedDelivery: this.calculateDeliveryTime(),
                specialInstructions: orderData.specialInstructions || ''
            };

            // Store in room service orders
            const roomServiceOrders = JSON.parse(localStorage.getItem('roomServiceOrders') || '[]');
            roomServiceOrders.push(roomServiceOrder);
            localStorage.setItem('roomServiceOrders', JSON.stringify(roomServiceOrders));

            return roomServiceOrder;
        } catch (error) {
            console.error('Error processing room service order:', error);
            return null;
        }
    }

    /**
     * Calculate estimated delivery time for room service
     */
    static calculateDeliveryTime() {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + (30 * 60000)); // 30 minutes from now
        return deliveryTime.toISOString();
    }
}

// Auto-initialize hotel mode if applicable
document.addEventListener('DOMContentLoaded', () => {
    if (HotelMode.isHotelModeActive()) {
        console.log('🏨 Hotel Mode activated');
        HotelMode.applyHotelStyling();
        
        // Initialize room service menu if it doesn't exist
        setTimeout(() => {
            HotelMode.initializeRoomServiceMenu();
        }, 1000);
    }
});

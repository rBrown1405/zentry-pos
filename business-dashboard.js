// Initialize managers
const apiManager = new ApiManager();
const propertyManager = new MultiPropertyManager();

// Ensure user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized, checking authentication...');
    
    try {
        // Start with opacity 0
        document.body.style.opacity = '0';
        
        // Check both isLoggedIn and userRole to ensure proper authentication
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userRole = localStorage.getItem('userRole');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const currentBusiness = JSON.parse(localStorage.getItem('currentBusiness') || 'null');
        
        console.log('Auth state:', { isLoggedIn, userRole, currentUser, currentBusiness });
        
        if (!isLoggedIn) {
            throw new Error('Not logged in');
        }
        
        if (userRole !== 'admin') {
            throw new Error('Invalid role: ' + userRole);
        }
        
        if (!currentUser || !currentUser.businessName) {
            throw new Error('No user data found');
        }
        
        if (!currentBusiness || !currentBusiness.id) {
            throw new Error('No business data found');
        }
        
        // If we get here, authentication is valid
        console.log('Authentication successful, loading business data...');
        loadBusinessData();
        
        // NEW: Connect localStorage business data to umbrella manager
        // Wait a bit longer for umbrella manager to initialize
        setTimeout(() => {
            connectBusinessToUmbrellaManager(currentBusiness, currentUser);
        }, 1500);
        
        // Fade in the content
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in';
            document.body.style.opacity = '1';
        }, 100);
        
    } catch (error) {
        console.error('Authentication failed:', error);
        // Add a small delay before redirect to ensure logs are visible
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
});

// Load business data
function loadBusinessData() {
    try {
        // Get current user data which includes business info
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.businessName) {
            console.error('No business data found');
            handleLogout();
            return;
        }

        // Update UI elements
        document.getElementById('businessName').textContent = currentUser.businessName || 'N/A';
        document.getElementById('businessType').textContent = currentUser.businessType || 'N/A';
        document.getElementById('ownerName').textContent = currentUser.name || 'N/A';
    } catch (error) {
        console.error('Error loading business data:', error);
        handleLogout();
    }
}

// Profile menu toggle
function toggleProfileMenu() {
    const menu = document.getElementById('profileMenu');
    menu.classList.toggle('active');
}

// Handle logout
function handleLogout() {
    // Clear all authentication data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentBusiness');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentPropertyContext');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Add smooth navigation transition
function navigateWithTransition(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// NEW: Function to connect localStorage business data to umbrella manager
async function connectBusinessToUmbrellaManager(businessInfo, userInfo) {
    try {
        console.log('🔗 Connecting business to umbrella manager...', { businessInfo, userInfo });
        
        // Wait for umbrella manager to be available
        const waitForUmbrellaManager = () => {
            return new Promise((resolve) => {
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (window.umbrellaManager) {
                        console.log(`✅ Umbrella manager found after ${attempts} attempts`);
                        clearInterval(checkInterval);
                        resolve(window.umbrellaManager);
                    } else if (attempts % 10 === 0) {
                        console.log(`⏳ Still waiting for umbrella manager... (attempt ${attempts})`);
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    console.warn('⚠️ Umbrella manager wait timeout after 10 seconds');
                    clearInterval(checkInterval);
                    resolve(null);
                }, 10000);
            });
        };
        
        const umbrellaManager = await waitForUmbrellaManager();
        
        if (umbrellaManager) {
            console.log('🎯 Umbrella manager available, setting business context...');
            
            // Create business data object compatible with umbrella manager
            const businessData = {
                id: businessInfo.id,
                companyName: userInfo.businessName,
                businessType: userInfo.businessType || 'restaurant',
                businessCode: businessInfo.id, // Use business ID as code for localStorage businesses
                ownerName: userInfo.name,
                companyEmail: userInfo.email || '',
                companyPhone: userInfo.phone || '',
                isActive: true,
                createdAt: new Date().toISOString(),
                // Mark this as a localStorage-based business
                source: 'localStorage_login'
            };
            
            // Set the current business in umbrella manager
            umbrellaManager.setCurrentBusiness(businessInfo.id, businessData);
            
            console.log('✅ Business successfully connected to umbrella manager:', businessData.companyName);
            console.log('🔍 Current umbrella manager business:', umbrellaManager.currentBusiness);
            
            // Dispatch a custom event to notify other components
            const event = new CustomEvent('businessContextConnected', { 
                detail: { 
                    business: businessData,
                    source: 'localStorage_login'
                } 
            });
            document.dispatchEvent(event);
            
        } else {
            console.warn('⚠️ Umbrella manager not available after 10 seconds. Business context may not be set.');
        }
        
    } catch (error) {
        console.error('💥 Error connecting business to umbrella manager:', error);
    }
}

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

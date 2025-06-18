// Initialize managers
const apiManager = new ApiManager();
const propertyManager = new MultiPropertyManager();

// Ensure user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    // Check both isLoggedIn and userRole to ensure proper authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn || userRole !== 'admin') {
        console.error('Not authenticated or invalid role');
        window.location.href = 'login.html';
        return;
    }
    
    loadBusinessData();
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

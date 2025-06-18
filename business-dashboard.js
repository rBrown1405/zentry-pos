// Initialize managers
const apiManager = new ApiManager();
const propertyManager = new MultiPropertyManager();

// Ensure user is authenticated
document.addEventListener('DOMContentLoaded', function() {
    if (!apiManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadBusinessData();
});

// Load business data
function loadBusinessData() {
    try {
        const businessAccount = propertyManager.getBusinessAccount();
        if (!businessAccount) {
            console.error('No business account found');
            handleLogout();
            return;
        }

        // Update UI elements
        document.getElementById('businessName').textContent = businessAccount.businessName || 'N/A';
        document.getElementById('businessType').textContent = businessAccount.businessType || 'N/A';
        document.getElementById('ownerName').textContent = businessAccount.ownerName || 'N/A';
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
    apiManager.logout();
    window.location.href = 'login.html';
}

// Add smooth navigation transition
function navigateWithTransition(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

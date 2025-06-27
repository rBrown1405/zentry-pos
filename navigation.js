// Navigation utility functions with smooth transitions

// Update header information
function updateHeaderInfo() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentProperty = JSON.parse(localStorage.getItem('currentProperty') || '{}');
        
        const hotelName = document.querySelector('.hotel-name');
        const userRole = document.querySelector('.user-role');
        const systemInfo = document.querySelector('.system-name');
        
        // Update hotel/business name
        if (hotelName) {
            hotelName.textContent = currentProperty.name || currentUser.businessName || '';
        }
        
        // Update user role
        if (userRole && currentUser.role) {
            userRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        }
        
        // Update system name without dev mode
        if (systemInfo) {
            systemInfo.textContent = 'ZENTRY POS';
        }
        
        // Update property info if available
        const propertyInfo = document.querySelector('.property-info');
        if (propertyInfo && currentProperty) {
            propertyInfo.innerHTML = `
                <div class="property-name">${currentProperty.name || ''}</div>
                <div class="property-type">${currentProperty.type || ''}</div>
                ${currentProperty.location ? `<div class="property-location">${currentProperty.location}</div>` : ''}
            `;
        }
    } catch (error) {
        console.error('Error updating header:', error);
    }
}

// Navigate with smooth transition effect
function navigateWithTransition(url) {
    // Add loading effect
    const body = document.body;
    body.style.transition = 'opacity 0.3s ease-out';
    body.style.opacity = '0.7';
    
    // Navigate after brief delay for smooth effect
    setTimeout(() => {
        window.location.href = url;
    }, 150);
}

// Navigate back with transition
function navigateBack() {
    const body = document.body;
    body.style.transition = 'opacity 0.3s ease-out';
    body.style.opacity = '0.7';
    
    setTimeout(() => {
        window.history.back();
    }, 150);
}

// Initialize page with fade-in effect
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.4s ease-in';
    
    // Update header information
    updateHeaderInfo();
    
    // Fade in after page load
    setTimeout(() => {
        body.style.opacity = '1';
    }, 100);
});

// Add loading spinner during navigation
function showLoadingSpinner() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingSpinner() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

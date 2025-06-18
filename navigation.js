// Navigation utility functions with smooth transitions

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

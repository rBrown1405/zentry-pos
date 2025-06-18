// Main application initialization for index.html

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page animations
    initializeAnimations();
    
    // Check if user is already logged in
    checkExistingLogin();
    
    // Initialize feature cards interactions
    initializeFeatureCards();
});

function initializeAnimations() {
    // Fade in content after page load
    const welcomeContainer = document.querySelector('.welcome-container');
    if (welcomeContainer) {
        welcomeContainer.style.opacity = '0';
        welcomeContainer.style.transform = 'translateY(20px)';
        welcomeContainer.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        setTimeout(() => {
            welcomeContainer.style.opacity = '1';
            welcomeContainer.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Animate feature cards with stagger effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 400 + (index * 100));
    });
}

function checkExistingLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // User is already logged in, show option to continue
        const startButton = document.querySelector('.start-button');
        if (startButton) {
            startButton.innerHTML = '<span class="button-text">🏠 Continue to POS</span>';
            startButton.onclick = function() {
                navigateWithTransition('pos-interface-fixed.html');
            };
        }
        
        // Add logout option
        addLogoutOption();
    }
}

function addLogoutOption() {
    const quickAccess = document.querySelector('.quick-access');
    if (quickAccess) {
        const logoutButton = document.createElement('button');
        logoutButton.className = 'start-button secondary';
        logoutButton.style.marginTop = '10px';
        logoutButton.innerHTML = '<span class="button-text">🚪 Logout & Login as Different User</span>';
        logoutButton.onclick = function() {
            // Clear all user data
            localStorage.removeItem('currentUser');
            localStorage.removeItem('propertyType');
            localStorage.removeItem('propertyName');
            localStorage.removeItem('firstLogin');
            
            // Navigate to login
            navigateWithTransition('login.html');
        };
        quickAccess.appendChild(logoutButton);
    }
}

function initializeFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add click animation
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Utility function for smooth navigation (if navigation.js is not loaded)
if (typeof navigateWithTransition === 'undefined') {
    function navigateWithTransition(url) {
        window.location.href = url;
    }
}

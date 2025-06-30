// Simple clean JavaScript for the new design

// Tab switching for login page
function switchLoginTab(tabType) {
    // Hide all tabs
    document.getElementById('staffLogin').classList.add('hidden');
    document.getElementById('companyLogin').classList.add('hidden');
    document.getElementById('superadminLogin').classList.add('hidden');
    
    // Remove active styling from all tabs
    document.getElementById('staffTab').classList.remove('border-primary');
    document.getElementById('companyTab').classList.remove('border-primary');
    document.getElementById('superadminTab').classList.remove('border-primary');
    
    // Show selected tab and add active styling
    if (tabType === 'staff') {
        document.getElementById('staffLogin').classList.remove('hidden');
        document.getElementById('staffTab').classList.add('border-primary');
    } else if (tabType === 'company') {
        document.getElementById('companyLogin').classList.remove('hidden');
        document.getElementById('companyTab').classList.add('border-primary');
    } else if (tabType === 'superadmin') {
        document.getElementById('superadminLogin').classList.remove('hidden');
        document.getElementById('superadminTab').classList.add('border-primary');
    }
}

// Simple navigation function
function navigateWithTransition(url) {
    window.location.href = url;
}

// Simple loading state management
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.disabled = true;
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Simple error display
function showError(message, containerId = 'errorMessage') {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    }
}

function hideError(containerId = 'errorMessage') {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.classList.add('hidden');
    }
}

// Simple scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

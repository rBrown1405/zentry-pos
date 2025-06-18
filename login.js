// Initialize API Manager
const apiManager = new ApiManager();

// Login tab switching
function switchLoginTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.login-tabs .tab-button').forEach(button => {
        button.classList.toggle('active', 
            button.textContent.toLowerCase().includes(tabName));
    });

    // Update tab content
    document.querySelectorAll('.login-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Login').classList.add('active');
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    if (apiManager.isAuthenticated()) {
        const userRole = apiManager.getUserRole();
        // Use role to redirect appropriately
        switch (userRole) {
            case 'super_admin':
                navigateWithTransition('super-admin-dashboard.html');
                break;
            case 'admin':
                navigateWithTransition('business-dashboard.html');
                break;
            case 'user':
                navigateWithTransition('staff-dashboard.html');
                break;
            default:
                navigateWithTransition('dashboard.html');
        }
    }
});

// Handle staff login
async function handleStaffLogin() {
    const staffId = document.getElementById('staffId').value.trim();
    
    if (!staffId) {
        showError('Please enter your Staff ID');
        return;
    }
    
    try {
        // Show loading state
        const loginButton = document.querySelector('#staffLogin .login-button');
        const buttonText = loginButton.querySelector('.button-text');
        const originalText = buttonText.textContent;
        
        buttonText.textContent = 'Authenticating...';
        loginButton.disabled = true;
        
        // Try to login with the staffId as email and a default password pattern
        // In a real system, you would have proper staff authentication
        try {
            await apiManager.login(staffId + '@zentrypos.com', 'staff-' + staffId);
        } catch (error) {
            // For demo purposes, fallback to localStorage method if API fails
            console.warn('API login failed, falling back to localStorage method');
            return handleStaffLoginLegacy(staffId);
        }
        
        // Get user details after login
        const user = apiManager.getCurrentUser();
        
        if (user && user.role === 'user') {
            try {
                // Get user's profile with business details
                const profile = await apiManager.getProfile();
                
                // Store user information for UI context
                localStorage.setItem('currentUser', JSON.stringify({
                    type: 'staff',
                    id: user.id,
                    staffID: staffId,
                    name: user.username,
                    email: user.email,
                    role: user.role,
                    businessId: profile.business?._id,
                    businessName: profile.business?.name,
                    lastLogin: new Date().toISOString()
                }));
                
                // Set login flag for authentication
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to staff dashboard
                navigateWithTransition('staff-dashboard.html');
            } catch (error) {
                console.error('Error fetching user profile:', error);
                showError('Login successful but error loading profile');
            }
        } else {
            // If role doesn't match, log out and show error
            apiManager.logout();
            showError('Invalid Staff ID or insufficient permissions');
            buttonText.textContent = originalText;
            loginButton.disabled = false;
        }
    } catch (error) {
        showError('Login failed: ' + (error.message || 'Invalid credentials'));
        // Reset button
        const loginButton = document.querySelector('#staffLogin .login-button');
        loginButton.querySelector('.button-text').textContent = 'Staff Sign In';
        loginButton.disabled = false;
    }
}

// Legacy staff login function using localStorage
function handleStaffLoginLegacy(staffId) {
    try {
        // Get staff info from storage
        const staffInfo = JSON.parse(localStorage.getItem(`staff_${staffId}`));
        
        if (!staffInfo) {
            showError('Staff ID not found. Please check your ID and try again.');
            return;
        }

        // Check if staff account is approved
        if (!staffInfo.isApproved) {
            showError('Your account is pending approval from management. Please contact your manager.');
            return;
        }

        // Check if staff account is active
        if (!staffInfo.isActive) {
            showError('Your account is inactive. Please contact your administrator.');
            return;
        }

        // Get associated business info
        const businessInfo = JSON.parse(localStorage.getItem(`business_${staffInfo.businessCode}`));
        
        if (!businessInfo) {
            showError('Associated business not found. Please contact your administrator.');
            return;
        }

        // Update last login time
        staffInfo.lastLogin = new Date().toISOString();
        localStorage.setItem(`staff_${staffId}`, JSON.stringify(staffInfo));

        // Get accessible properties for this staff member
        const accessibleProperties = MultiPropertyManager.getAccessibleProperties(staffId);
        
        // Store comprehensive login information for multi-property system
        localStorage.setItem('currentUser', JSON.stringify({
            type: 'staff',
            id: staffId,
            staffID: staffInfo.staffID,
            name: staffInfo.fullName,
            firstName: staffInfo.firstName || staffInfo.fullName.split(' ')[0],
            lastName: staffInfo.lastName || staffInfo.fullName.split(' ').slice(1).join(' '),
            email: staffInfo.email,
            phone: staffInfo.phone,
            role: staffInfo.role,
            businessCode: staffInfo.businessCode,
            businessID: staffInfo.businessID,
            propertyAccess: staffInfo.propertyAccess,
            assignedProperties: staffInfo.assignedProperties,
            accessibleProperties: accessibleProperties,
            permissions: staffInfo.permissions,
            lastLogin: staffInfo.lastLogin
        }));
        
        // Set login flag for authentication
        localStorage.setItem('isLoggedIn', 'true');
        
        // Reset button
        const loginButton = document.querySelector('#staffLogin .login-button');
        loginButton.querySelector('.button-text').textContent = 'Staff Sign In';
        loginButton.disabled = false;

        // Set initial property context - use first accessible property or main property
        let initialProperty = null;
        if (accessibleProperties.length > 0) {
            // Use the main property if accessible, otherwise first available
            initialProperty = accessibleProperties.find(p => p.isMainProperty) || accessibleProperties[0];
        } else {
            // Fallback to business info
            initialProperty = {
                propertyName: businessInfo.companyName,
                businessType: businessInfo.businessType || 'restaurant'
            };
        }

        // Store property information for UI context
        localStorage.setItem('propertyType', initialProperty.businessType);
        localStorage.setItem('propertyName', initialProperty.propertyName);
        localStorage.setItem('firstLogin', 'true');

        // Set current property context if specific property
        if (initialProperty.propertyCode) {
            localStorage.setItem('currentPropertyContext', JSON.stringify({
                propertyCode: initialProperty.propertyCode,
                propertyName: initialProperty.propertyName,
                businessType: initialProperty.businessType,
                staffID: staffId
            }));
        }

        // Navigate to appropriate interface
        if (staffInfo.role === 'owner' || staffInfo.role === 'manager') {
            // Check if there are pending staff approvals
            const pendingStaff = MultiPropertyManager.getPendingStaff(staffInfo.businessCode, staffId);
            if (pendingStaff.length > 0) {
                if (confirm(`You have ${pendingStaff.length} pending staff approval(s). Would you like to review them now?`)) {
                    navigateWithTransition('staff-approval.html');
                    return;
                }
            }
        }

        // Navigate to POS interface
        navigateWithTransition('pos-interface-fixed.html');
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login. Please try again.');
    }
}

// Handle company login
async function handleCompanyLogin(event) {
    event.preventDefault();
    const businessId = document.getElementById('businessId').value.trim();
    
    if (!businessId) {
        showError('Please enter your Business ID');
        return;
    }
    
    try {
        // Show loading state
        const loginButton = document.querySelector('#companyLogin .login-button');
        loginButton.classList.add('loading');
        
        // Get business account
        const businessAccount = MultiPropertyManager.getBusinessAccount(businessId);
        
        if (!businessAccount) {
            throw new Error('Business ID not found. Please check your ID and try again.');
        }
        
        // Store business information for the session
        localStorage.setItem('currentBusiness', JSON.stringify({
            id: businessAccount.id,
            name: businessAccount.businessName,
            type: businessAccount.businessType,
            lastLogin: new Date().toISOString()
        }));
        
        // Set login flag
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'business');
        
        // Redirect to business dashboard
        navigateWithTransition('business-dashboard.html');
        
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    } finally {
        // Remove loading state
        const loginButton = document.querySelector('#companyLogin .login-button');
        loginButton.classList.remove('loading');
    }
}

// Handle super admin login
async function handleSuperAdminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }
    
    try {
        if (SuperAdminManager.loginSuperAdmin(username, password)) {
            // Store property information as global
            localStorage.setItem('propertyType', 'global');
            localStorage.setItem('propertyName', 'Super Admin Dashboard');
            localStorage.setItem('firstLogin', 'true');

            // Navigate to super admin dashboard
            navigateWithTransition('super-admin-dashboard.html');
        } else {
            alert('Invalid super admin credentials. Please try again.');
        }
    } catch (error) {
        console.error('Super admin login error:', error);
        alert('Error during super admin login. Please try again.');
    }
}

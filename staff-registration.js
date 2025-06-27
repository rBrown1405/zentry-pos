// Staff Registration Handler - Multi-Property System with Enhanced Firebase Integration
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when Firebase Manager is ready
    if (window.firebaseInitializer) {
        window.firebaseInitializer.onReady(initializeStaffRegistration);
    } else {
        // Fallback for older initialization
        window.addEventListener('firebaseManagerReady', initializeStaffRegistration);
        // Also try immediate initialization in case it's already ready
        setTimeout(initializeStaffRegistration, 100);
    }
});

function initializeStaffRegistration() {
    console.log('🎯 Initializing staff registration with Firebase Manager ready');
    
    // Form submission handler
    const form = document.getElementById('staffRegistrationForm');
    if (form) {
        form.addEventListener('submit', handleStaffRegistration);
    }

    // Property connection code validation
    const propertyCodeInput = document.getElementById('propertyConnectionCode');
    if (propertyCodeInput) {
        propertyCodeInput.addEventListener('input', validatePropertyConnectionCode);
        propertyCodeInput.addEventListener('blur', validatePropertyConnectionCode);
    }
}

async function validatePropertyConnectionCode() {
    const propertyCodeInput = document.getElementById('propertyConnectionCode');
    const businessInfo = document.getElementById('businessInfo');
    const code = propertyCodeInput.value.trim();

    // Clear previous validation
    propertyCodeInput.classList.remove('valid', 'invalid');
    businessInfo.style.display = 'none';

    // Check for 4-digit connection code (new system) or 6-character code (legacy)
    if (code.length !== 4 && code.length !== 6) {
        return;
    }

    try {
        // For 4-digit codes, try Firebase-based validation first
        if (code.length === 4 && /^\d{4}$/.test(code)) {
            console.log(`🔍 Validating 4-digit connection code: ${code}`);
            
            // Ensure Firebase Manager is available
            if (!window.firebaseManager) {
                console.warn('⚠️ Firebase Manager not available yet, waiting...');
                if (window.firebaseInitializer) {
                    window.firebaseInitializer.onReady(() => {
                        validatePropertyConnectionCode(); // Retry when ready
                    });
                }
                return;
            }

            // Try to find property by connection code using Firebase
            const property = await findPropertyByConnectionCode(code);
            if (property) {
                console.log('✅ Property found via Firebase:', property);
                propertyCodeInput.classList.add('valid');
                
                // Show business information
                businessInfo.style.display = 'block';
                businessInfo.querySelector('.business-name').textContent = property.businessName || 'Property Found';
                businessInfo.querySelector('.business-details').textContent = 
                    `Connection Code: ${code} | Type: ${property.type || 'Restaurant'}`;
                return;
            } else {
                console.log('❌ No property found for 4-digit code:', code);
            }
        }
        
        // Fallback to legacy validation for 6-character codes or failed 4-digit codes
        console.log(`🔍 Trying legacy validation for code: ${code}`);
        const validation = MultiPropertyManager.validatePropertyConnectionCode(code.toUpperCase());
        
        if (validation.valid) {
            propertyCodeInput.classList.add('valid');
            propertyCodeInput.value = code.toUpperCase(); // Ensure uppercase for legacy codes
            
            // Show business information
            businessInfo.style.display = 'block';
            businessInfo.querySelector('.business-name').textContent = validation.businessName;
            businessInfo.querySelector('.business-details').textContent = 
                `Properties: ${validation.umbrellaAccount.properties.length} | Since: ${new Date(validation.umbrellaAccount.createdAt).getFullYear()}`;
                
        } else {
            propertyCodeInput.classList.add('invalid');
            showError('Invalid connection code. Please check and try again.');
        }
    } catch (error) {
        propertyCodeInput.classList.add('invalid');
        showError('Unable to validate property connection code. Please try again.');
    }
}

// Helper function to find property by connection code using Firebase
async function findPropertyByConnectionCode(connectionCode) {
    // Enhanced validation and error handling
    if (!window.firebaseServices) {
        console.warn('🚫 Firebase services not available');
        return null;
    }
    
    const db = window.firebaseServices.getDb();
    if (!db) {
        console.warn('🚫 Firestore not available');
        return null;
    }
    
    try {
        console.log(`🔍 Searching for property with connection code: ${connectionCode}`);
        
        const propertiesRef = await db.collection('properties')
            .where('connectionCode', '==', connectionCode)
            .limit(1)
            .get();
            
        if (!propertiesRef.empty) {
            const propertyDoc = propertiesRef.docs[0];
            const propertyData = propertyDoc.data();
            
            console.log('✅ Property found:', propertyData);
            
            // Get business information
            let businessName = propertyData.name || 'Business Found';
            if (propertyData.business) {
                try {
                    const businessDoc = await db.collection('businesses').doc(propertyData.business).get();
                    if (businessDoc.exists) {
                        const businessData = businessDoc.data();
                        businessName = businessData.companyName || businessData.name || businessName;
                    }
                } catch (e) {
                    console.warn('⚠️ Could not fetch business name:', e);
                }
            }
            
            return {
                id: propertyDoc.id,
                businessName: businessName,
                type: propertyData.type || 'Restaurant',
                ...propertyData
            };
        }
        
        console.log('❌ No property found with connection code:', connectionCode);
        return null;
    } catch (error) {
        console.error('💥 Error finding property by connection code:', error);
        return null;
    }
}

async function handleStaffRegistration(event) {
    event.preventDefault();

    // Get form data
    const propertyConnectionCode = document.getElementById('propertyConnectionCode').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const requestedRole = document.getElementById('requestedRole').value;
    const pin = document.getElementById('pin').value;

    // Validate required fields
    if (!propertyConnectionCode || !fullName || !email || !phone || !requestedRole || !pin) {
        showError('Please fill in all required fields');
        return;
    }

    // Validate property connection code first (support both 4-digit and 6-character codes)
    let isValidCode = false;
    
    // Check 4-digit code with Firebase
    if (propertyConnectionCode.length === 4 && /^\d{4}$/.test(propertyConnectionCode)) {
        const property = await findPropertyByConnectionCode(propertyConnectionCode);
        isValidCode = property !== null;
    }
    
    // Fallback to legacy validation for 6-character codes
    if (!isValidCode && propertyConnectionCode.length === 6) {
        const validation = MultiPropertyManager.validatePropertyConnectionCode(propertyConnectionCode.toUpperCase());
        isValidCode = validation.valid;
    }
    
    if (!isValidCode) {
        showError('Invalid connection code. Please check and try again.');
        return;
    }

    // Validate PIN
    if (!/^\d{4}$/.test(pin)) {
        showError('PIN must be exactly 4 digits');
        return;
    }

    try {
        // Show loading state
        const submitButton = event.target.querySelector('.submit-button');
        const originalContent = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="button-text">Submitting...</span><span class="button-icon">⏳</span>';
        submitButton.disabled = true;

        // Prepare registration data
        const registrationData = {
            propertyConnectionCode,
            fullName,
            email,
            phone,
            requestedRole,
            pin
        };

        // Register staff member
        const result = await MultiPropertyManager.registerStaffMember(registrationData);

        if (result.success) {
            // Show success message
            document.querySelector('.registration-form').style.display = 'none';
            const successMessage = document.querySelector('.success-message');
            successMessage.style.display = 'block';
            successMessage.querySelector('.staff-id').textContent = result.staffID;
            successMessage.querySelector('.business-name-success').textContent = result.businessName;
        } else {
            throw new Error(result.message || 'Registration failed');
        }

    } catch (error) {
        console.error('Staff registration error:', error);
        showError(error.message || 'Registration failed. Please try again.');
        
        // Reset button
        const submitButton = event.target.querySelector('.submit-button');
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
    }
}

function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fee2e2;
        border: 1px solid #ef4444;
        color: #991b1b;
        padding: 12px;
        border-radius: 6px;
        margin: 10px 0;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    errorDiv.innerHTML = `
        <span>⚠️</span>
        <span>${message}</span>
    `;

    // Insert error message before the form
    const form = document.getElementById('staffRegistrationForm');
    form.parentNode.insertBefore(errorDiv, form);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Add styles for validation states
const style = document.createElement('style');
style.textContent = `
    .form-group input.valid {
        border-color: #10b981;
        background-color: #f0fdf4;
    }
    
    .form-group input.invalid {
        border-color: #ef4444;
        background-color: #fef2f2;
    }
    
    .business-info {
        margin: 15px 0;
    }
    
    .info-card {
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        border-radius: 8px;
        padding: 15px;
    }
    
    .info-card h4 {
        margin: 0 0 8px 0;
        color: #0c4a6e;
        font-size: 16px;
    }
    
    .business-name {
        font-weight: bold;
        color: #1e40af;
        margin: 0;
    }
    
    .business-details {
        color: #64748b;
        font-size: 14px;
        margin: 5px 0 0 0;
    }
    
    .approval-note {
        background: #fffbeb;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 12px;
        margin: 15px 0;
        color: #92400e;
        font-size: 14px;
    }
    
    .success-content {
        text-align: center;
    }
    
    .success-icon {
        font-size: 48px;
        margin: 20px 0;
    }
    
    .field-description {
        display: block;
        margin-top: 5px;
        font-size: 12px;
        color: #6b7280;
    }
`;
document.head.appendChild(style);

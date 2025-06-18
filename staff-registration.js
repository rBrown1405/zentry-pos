// Staff Registration Handler - Multi-Property System
document.addEventListener('DOMContentLoaded', () => {
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
});

async function validatePropertyConnectionCode() {
    const propertyCodeInput = document.getElementById('propertyConnectionCode');
    const businessInfo = document.getElementById('businessInfo');
    const code = propertyCodeInput.value.trim().toUpperCase();

    // Clear previous validation
    propertyCodeInput.classList.remove('valid', 'invalid');
    businessInfo.style.display = 'none';

    if (code.length !== 6) {
        return;
    }

    try {
        // Validate the property connection code
        const validation = MultiPropertyManager.validatePropertyConnectionCode(code);
        
        if (validation.valid) {
            propertyCodeInput.classList.add('valid');
            propertyCodeInput.value = code; // Ensure uppercase
            
            // Show business information
            businessInfo.style.display = 'block';
            businessInfo.querySelector('.business-name').textContent = validation.businessName;
            businessInfo.querySelector('.business-details').textContent = 
                `Properties: ${validation.umbrellaAccount.properties.length} | Since: ${new Date(validation.umbrellaAccount.createdAt).getFullYear()}`;
                
        } else {
            propertyCodeInput.classList.add('invalid');
            showError(validation.message);
        }
    } catch (error) {
        propertyCodeInput.classList.add('invalid');
        showError('Unable to validate property connection code');
    }
}

async function handleStaffRegistration(event) {
    event.preventDefault();

    // Get form data
    const propertyConnectionCode = document.getElementById('propertyConnectionCode').value.trim().toUpperCase();
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

    // Validate property connection code first
    const validation = MultiPropertyManager.validatePropertyConnectionCode(propertyConnectionCode);
    if (!validation.valid) {
        showError(validation.message);
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

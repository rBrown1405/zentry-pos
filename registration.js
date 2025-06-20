// Business Registration Handler - Updated for Multi-Property System
document.addEventListener('DOMContentLoaded', () => {
    // Populate country dropdown
    populateCountries();
    
    // Form submission handler
    const form = document.getElementById('businessRegistrationForm');
    if (form) {
        form.addEventListener('submit', handleRegistration);
    }
});

function populateCountries() {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) return;

    // Add major countries first (you can expand this list)
    const majorCountries = [
        'United States',
        'Canada',
        'United Kingdom',
        'Australia',
        // Add more major countries
    ];

    majorCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.toLowerCase().replace(/\s+/g, '-');
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

function updateStateField() {
    const country = document.getElementById('country').value;
    const stateContainer = document.getElementById('stateContainer');
    const stateSelect = document.getElementById('state');

    // Clear existing options
    stateSelect.innerHTML = '<option value="" disabled selected>Select your state</option>';

    // Show state field only for countries that need it
    if (country === 'united-states') {
        stateContainer.style.display = 'block';
        const usStates = [
            'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
            'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
            'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
            'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
            'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
            'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
            'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
            'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
            'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
            'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
        ];
        
        usStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state.toLowerCase().replace(/\s+/g, '-');
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    } else {
        stateContainer.style.display = 'none';
    }
}

function toggleHotelFields() {
    const businessType = document.getElementById('businessType').value;
    const hotelFields = document.querySelectorAll('.hotel-fields');
    
    if (businessType === 'hotel') {
        hotelFields.forEach(field => field.style.display = 'block');
    } else {
        hotelFields.forEach(field => field.style.display = 'none');
    }
}

function updateRewardsProgram() {
    const hotelBrand = document.getElementById('hotelBrand').value;
    const rewardsProgramField = document.getElementById('rewardsProgram');
    
    const rewardsPrograms = {
        'marriott': 'Marriott Bonvoy',
        'hilton': 'Hilton Honors',
        'hyatt': 'World of Hyatt',
        'ihg': 'IHG One Rewards',
        'accor': 'ALL - Accor Live Limitless',
        'wyndham': 'Wyndham Rewards',
        'choice': 'Choice Privileges',
        'independent': 'Custom Loyalty Program',
        'other': 'Custom Loyalty Program'
    };
    
    rewardsProgramField.value = rewardsPrograms[hotelBrand] || '';
}

async function handleRegistration(event) {
    event.preventDefault();

    try {
        // Validate form fields
        const requiredFields = ['companyName', 'ownerName', 'companyEmail', 'businessType'];
        const missingFields = requiredFields.filter(field => !document.getElementById(field).value);
        
        if (missingFields.length > 0) {
            throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        }

        // Get company information
        const companyName = document.getElementById('companyName').value.trim();
        const ownerName = document.getElementById('ownerName').value.trim();
        const companyEmail = document.getElementById('companyEmail').value.trim();
        const companyPhone = document.getElementById('companyPhone').value.trim();
        
        // Get property information
        const propertyName = document.getElementById('propertyName').value.trim();
        const businessType = document.getElementById('businessType').value;
        const address = document.getElementById('address').value.trim();
        const country = document.getElementById('country').value;
        const state = document.getElementById('state').value;
        
        // Get hotel-specific information if applicable
        let hotelBrand = '';
        let rewardsProgram = '';
        if (businessType === 'hotel') {
            hotelBrand = document.getElementById('hotelBrand').value.trim();
            rewardsProgram = document.getElementById('rewardsProgram').value;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(companyEmail)) {
            throw new Error('Please enter a valid email address');
        }        // Show loading state
        const submitButton = event.target.querySelector('.submit-button');
        const originalContent = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="button-text">Creating Account...</span><span class="button-icon">⏳</span>';
        submitButton.disabled = true;

        // Prepare business data
        const businessData = {
            companyName,
            ownerName,
            companyEmail,
            companyPhone,
            propertyName,
            businessType,
            address,
            country,
            state,
            hotelBrand,
            rewardsProgram
        };        // Ensure Firebase is initialized and authorized
        if (!window.firebaseServices || !window.firebaseServices.getDb()) {
            throw new Error('Firebase is not properly initialized. Please refresh the page and try again.');
        }

        // Create umbrella business account using new multi-property system
        const result = await MultiPropertyManager.createBusinessAccount(businessData);
        
        if (!result.success || !result.businessId) {
            throw new Error(result.message || 'Failed to create business account');
        }        // Show success message
        document.querySelector('.registration-form').style.display = 'none';
        const successMessage = document.querySelector('.success-message');
        successMessage.style.display = 'block';
        
        // Update all success message elements - check if elements exist before setting
        const businessIdElement = successMessage.querySelector('.business-id');
        const propertyCodeElement = successMessage.querySelector('.property-code');
        const propertyConnectionCodeElement = successMessage.querySelector('.property-connection-code');
        
        if (businessIdElement) {
            businessIdElement.textContent = result.businessId;
        }
        
        if (propertyCodeElement && result.umbrellaAccount && result.umbrellaAccount.mainPropertyCode) {
            propertyCodeElement.textContent = result.umbrellaAccount.mainPropertyCode;
        }
        
        if (propertyConnectionCodeElement) {
            propertyConnectionCodeElement.textContent = result.propertyConnectionCode;
        }

            // Log success for monitoring
            console.log('Business account created successfully:', result.businessId);

            // Optional: Clear the form
            event.target.reset();        } catch (error) {
            console.error('Registration error:', error);
            
            // Reset button state
            const submitButton = event.target.querySelector('.submit-button');
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="button-text">Create Business Account</span><span class="button-icon">→</span>';
            
            // Show error to user
            const errorMessage = error.code === 'permission-denied' ? 
                'You do not have permission to create a business account.' :
                error.message || 'Failed to create business account. Please try again.';
            
            const errorAlert = document.createElement('div');
            errorAlert.className = 'error-alert';
            errorAlert.textContent = errorMessage;
            
            const formContainer = document.querySelector('.registration-form');
            const existingError = formContainer.querySelector('.error-alert');
            if (existingError) {
                existingError.remove();
            }
            formContainer.insertBefore(errorAlert, formContainer.firstChild);
        }
}

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

    // Get company information
    const companyName = document.getElementById('companyName').value;
    const ownerName = document.getElementById('ownerName').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyPhone = document.getElementById('companyPhone').value;    // Get property information
    const propertyName = document.getElementById('propertyName').value;
    const businessType = document.getElementById('businessType').value;
    const address = document.getElementById('address').value;
    const country = document.getElementById('country').value;
    const state = document.getElementById('state').value;
    
    // Get hotel-specific information if applicable
    let hotelBrand = '';
    let rewardsProgram = '';
    if (businessType === 'hotel') {
        hotelBrand = document.getElementById('hotelBrand').value;
        rewardsProgram = document.getElementById('rewardsProgram').value;
    }    try {
        // Show loading state
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
        };

        // Create umbrella business account using new multi-property system
        const result = await MultiPropertyManager.createBusinessAccount(businessData);

        if (result.success) {
            // Show success message
            document.querySelector('.registration-form').style.display = 'none';
            const successMessage = document.querySelector('.success-message');
            successMessage.style.display = 'block';
            successMessage.querySelector('.business-id').textContent = result.businessID;
            successMessage.querySelector('.business-code').textContent = result.businessCode;
            successMessage.querySelector('.property-code').textContent = result.umbrellaAccount.mainPropertyCode;
            successMessage.querySelector('.property-connection-code').textContent = result.propertyConnectionCode;
        } else {
            throw new Error('Failed to create business account');
        }

    } catch (error) {
        alert('Error creating business account. Please try again.');
        console.error('Registration error:', error);
    }
}

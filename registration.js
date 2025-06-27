// Business Registration Handler - Updated for Firebase Integration
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔥 Business Registration page loading...');
    
    // Wait for Firebase services to be available
    let firebaseReady = false;
    let maxWaitTime = 10000; // 10 seconds
    let checkInterval = 100; // Check every 100ms
    let elapsed = 0;
    
    while (!firebaseReady && elapsed < maxWaitTime) {
        if (window.firebaseServices && window.firebaseServices.isInitialized()) {
            firebaseReady = true;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsed += checkInterval;
    }
    
    if (!firebaseReady) {
        console.error('❌ Firebase services failed to initialize within timeout');
        showError('Firebase connection failed. Please check your internet connection and reload the page.');
        return;
    }
    
    // Initialize managers
    try {
        console.log('🔥 Initializing Firebase Manager...');
        if (window.FirebaseManager) {
            window.firebaseManager = new window.FirebaseManager();
            await window.firebaseManager.initialize();
            console.log('✅ Firebase Manager initialized');
            
            if (window.UmbrellaAccountManager) {
                console.log('🔥 Initializing Umbrella Account Manager...');
                window.umbrellaManager = new window.UmbrellaAccountManager(window.firebaseManager);
                await window.umbrellaManager.initialize();
                console.log('✅ Umbrella Account Manager initialized');
            }
        }
    } catch (error) {
        console.error('❌ Manager initialization failed:', error);
        showError('Failed to initialize account management system. Please reload the page and try again.');
        return;
    }
    
    console.log('✅ Business Registration page ready');
    
    // Populate country dropdown
    populateCountries();
    
    // Form submission handler
    const form = document.getElementById('businessRegistrationForm');
    if (form) {
        form.addEventListener('submit', handleRegistration);
    }
});

function showError(message) {
    // Create or update error display
    let errorDiv = document.getElementById('firebase-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'firebase-error';
        errorDiv.style.cssText = `
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin: 20px;
            font-weight: 500;
            text-align: center;
        `;
        
        const container = document.querySelector('.registration-container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
        }
    }
    errorDiv.textContent = message;
}

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

    // Clear any previous errors
    const errorDiv = document.getElementById('firebase-error');
    if (errorDiv) {
        errorDiv.remove();
    }

    // Get company information
    const companyName = document.getElementById('companyName').value;
    const ownerName = document.getElementById('ownerName').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyPhone = document.getElementById('companyPhone').value;

    // Get property information
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
    }

    try {
        // Show loading state
        const submitButton = event.target.querySelector('.submit-button');
        const originalContent = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="button-text">Creating Account...</span><span class="button-icon">⏳</span>';
        submitButton.disabled = true;

        // Verify Firebase services are ready
        if (!window.firebaseServices || !window.firebaseServices.isInitialized()) {
            throw new Error('Firebase services are not ready. Please reload the page and try again.');
        }

        if (!window.firebaseManager) {
            throw new Error('Firebase manager is not initialized. Please reload the page and try again.');
        }

        if (!window.umbrellaManager) {
            throw new Error('Account manager is not initialized. Please reload the page and try again.');
        }

        console.log('🔥 Starting business registration...');

        // Prepare business data
        const businessData = {
            businessName: companyName,
            ownerName,
            email: companyEmail,
            phone: companyPhone,
            propertyName,
            businessType,
            address,
            country,
            state,
            hotelBrand,
            rewardsProgram
        };

        // Create umbrella business account using Firebase-backed system
        let result;
        
        console.log('Creating business with Firebase-backed UmbrellaAccountManager');
        
        try {
            // First, check if we need to create an owner account
            let ownerUser = window.firebaseManager.getCurrentUser();
            
            if (!ownerUser) {
                // Create owner account first
                console.log('No authenticated user found, creating owner account');
                
                // Generate a temporary password for the owner (they can change it later)
                const tempPassword = 'temp' + Math.random().toString(36).substr(2, 9);
                
                // Create the owner user account
                const userCredential = await window.firebaseManager.auth.createUserWithEmailAndPassword(
                    businessData.email, 
                    tempPassword
                );
                
                // Update user profile
                await userCredential.user.updateProfile({
                    displayName: businessData.ownerName
                });
                
                // Create user document in Firestore with owner role
                await window.firebaseManager.db.collection('users').doc(userCredential.user.uid).set({
                    username: businessData.email.split('@')[0],
                    email: businessData.email,
                    firstName: businessData.ownerName.split(' ')[0] || '',
                    lastName: businessData.ownerName.split(' ').slice(1).join(' ') || '',
                    role: 'owner',
                    accessLevel: 'business',
                    isActive: true,
                    tempPassword: tempPassword, // Store temp password so user can see it
                    mustChangePassword: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                    
                    console.log('Owner account created successfully');
                    
                    // Wait a bit for auth state to update
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Re-initialize umbrella manager to pick up the new user
                    await window.umbrellaManager.initialize();
                }
                
                // Now create the business account
                result = await window.umbrellaManager.createBusinessAccount(businessData);
                
                // Add temp password info to result if we created a new user
                if (!ownerUser && result.success) {
                    const currentUserDoc = await window.firebaseManager.db.collection('users').doc(window.firebaseManager.getCurrentUser().uid).get();
                    if (currentUserDoc.exists && currentUserDoc.data().tempPassword) {
                        result.tempPassword = currentUserDoc.data().tempPassword;
                        result.message += ` Your temporary password is: ${result.tempPassword}. Please change it after logging in.`;
                    }
                }
                
        } catch (firebaseError) {
            console.error('Firebase business creation failed:', firebaseError);
            alert('Failed to create business account: ' + firebaseError.message);
            
            // Reset button state
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
            }
            return;
        }

        if (result.success) {
            try {
                // Hide the registration form
                const registrationForm = document.querySelector('.registration-form');
                if (registrationForm) {
                    registrationForm.style.display = 'none';
                }

                // Show and populate the success message
                const successMessage = document.querySelector('.success-message');
                if (!successMessage) {
                    throw new Error('Success message container not found');
                }

                const businessIdElement = successMessage.querySelector('.business-id');
                const propertyCodeElement = successMessage.querySelector('.property-code');

                if (!businessIdElement || !propertyCodeElement) {
                    throw new Error('Success message elements not found');
                }

                // Show the success message container
                successMessage.style.display = 'block';

                // Update the display elements
                businessIdElement.textContent = result.businessId;
                propertyCodeElement.textContent = result.connectionCode;

                // Note: Codes are now stored in Firebase, not localStorage
                console.log('Business created successfully:', {
                    businessId: result.businessId,
                    connectionCode: result.connectionCode
                });

                // Scroll to the success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } catch (displayError) {
                console.error('Error displaying success message:', displayError);
                alert('Account created successfully! Your Business ID is: ' + result.businessId + 
                      ' and your Connection Code is: ' + result.connectionCode);
            }
        } else {
            throw new Error('Failed to create business account');
        }

    } catch (error) {
        alert('Error creating business account. Please try again.');
        console.error('Registration error:', error);
    }
}

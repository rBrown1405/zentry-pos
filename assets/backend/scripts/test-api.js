// API Testing Script
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
let accessToken = null;
let refreshToken = null;
let userId = null;
let businessId = null;
let propertyId = null;

// Test user credentials
const testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Test1234'
};

// Test business data
const testBusiness = {
    name: 'Test Business',
    address: '123 Test St, Test City',
    phone: '123-456-7890',
    email: 'testbusiness@example.com'
};

// Test property data
const testProperty = {
    name: 'Test Property',
    address: '456 Property Ave, Test City',
    isMainProperty: true
};

// Helper function to run tests sequentially
async function runTests() {
    try {
        console.log('Starting API Tests...');
        console.log('--------------------');

        // Register a test user
        await testRegister();

        // Login with test user
        await testLogin();

        // Get user profile
        await testGetProfile();

        // Create a business
        await testCreateBusiness();

        // Get businesses
        await testGetBusinesses();

        // Get specific business
        await testGetBusiness();

        // Create a property
        await testCreateProperty();

        // Get properties
        await testGetProperties();

        // Get specific property
        await testGetProperty();

        // Update the business
        await testUpdateBusiness();

        // Update the property
        await testUpdateProperty();

        // Create another user
        await testCreateUser();

        // Assign user to business
        await testAssignUserToBusiness();

        // Clean up - Delete property
        await testDeleteProperty();

        // Clean up - Delete business
        await testDeleteBusiness();

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

// Authentication Tests
async function testRegister() {
    console.log('\nTest: Register User');
    try {
        const response = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✓ User registered successfully');
        userId = response.data.data._id;
        return response.data;
    } catch (error) {
        // If user already exists, this is fine for our test
        if (error.response && error.response.status === 400 && error.response.data.message.includes('already exists')) {
            console.log('✓ User already exists, continuing with login');
            return null;
        } else {
            throw error;
        }
    }
}

async function testLogin() {
    console.log('\nTest: Login');
    const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
    });
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    userId = response.data.data._id;
    console.log('✓ Login successful');
    return response.data;
}

async function testGetProfile() {
    console.log('\nTest: Get User Profile');
    const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✓ Profile retrieved successfully');
    return response.data;
}

// Business Tests
async function testCreateBusiness() {
    console.log('\nTest: Create Business');
    const response = await axios.post(
        `${API_URL}/businesses`,
        testBusiness,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    businessId = response.data.data._id;
    console.log('✓ Business created successfully');
    return response.data;
}

async function testGetBusinesses() {
    console.log('\nTest: Get All Businesses');
    const response = await axios.get(
        `${API_URL}/businesses`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log(`✓ Retrieved ${response.data.count} businesses`);
    return response.data;
}

async function testGetBusiness() {
    console.log('\nTest: Get Specific Business');
    const response = await axios.get(
        `${API_URL}/businesses/${businessId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ Business retrieved successfully');
    return response.data;
}

async function testUpdateBusiness() {
    console.log('\nTest: Update Business');
    const response = await axios.put(
        `${API_URL}/businesses/${businessId}`,
        { name: testBusiness.name + ' Updated' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ Business updated successfully');
    return response.data;
}

async function testDeleteBusiness() {
    console.log('\nTest: Delete Business');
    const response = await axios.delete(
        `${API_URL}/businesses/${businessId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ Business deleted successfully');
    return response.data;
}

// Property Tests
async function testCreateProperty() {
    console.log('\nTest: Create Property');
    const response = await axios.post(
        `${API_URL}/properties`,
        { ...testProperty, businessId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    propertyId = response.data.data._id;
    console.log('✓ Property created successfully');
    return response.data;
}

async function testGetProperties() {
    console.log('\nTest: Get All Properties');
    const response = await axios.get(
        `${API_URL}/properties`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log(`✓ Retrieved ${response.data.count} properties`);
    return response.data;
}

async function testGetProperty() {
    console.log('\nTest: Get Specific Property');
    const response = await axios.get(
        `${API_URL}/properties/${propertyId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ Property retrieved successfully');
    return response.data;
}

async function testUpdateProperty() {
    console.log('\nTest: Update Property');
    const response = await axios.put(
        `${API_URL}/properties/${propertyId}`,
        { name: testProperty.name + ' Updated' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ Property updated successfully');
    return response.data;
}

async function testDeleteProperty() {
    console.log('\nTest: Delete Property');
    const response = await axios.delete(
        `${API_URL}/properties/${propertyId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ Property deleted successfully');
    return response.data;
}

// User Management Tests
async function testCreateUser() {
    console.log('\nTest: Create User');
    const newUser = {
        username: 'employeeuser',
        email: 'employee@example.com',
        password: 'Employee1234',
        role: 'user'
    };
    
    try {
        const response = await axios.post(
            `${API_URL}/users`,
            newUser,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log('✓ User created successfully');
        return response.data;
    } catch (error) {
        // If user already exists, this is fine for our test
        if (error.response && error.response.status === 400 && error.response.data.message.includes('already exists')) {
            console.log('✓ User already exists, continuing with tests');
            return null;
        } else {
            throw error;
        }
    }
}

async function testAssignUserToBusiness() {
    console.log('\nTest: Assign User to Business');
    // First get all users to find the employee
    const usersResponse = await axios.get(
        `${API_URL}/users`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const employeeUser = usersResponse.data.data.find(user => user.email === 'employee@example.com');
    
    if (!employeeUser) {
        console.log('✓ Employee user not found, skipping assignment test');
        return null;
    }
    
    const response = await axios.put(
        `${API_URL}/users/${employeeUser._id}/assign-business`,
        { businessId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✓ User assigned to business successfully');
    return response.data;
}

// Start the tests
runTests();

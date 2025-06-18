// Data migration script for transferring localStorage data to MongoDB
require('dotenv').config({ path: '../src/.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const connectDB = require('../src/config/db');
connectDB();

// Import models
const Business = require('../src/models/business.model');
const Property = require('../src/models/property.model');
const User = require('../src/models/user.model');

/**
 * Function to migrate data from localStorage JSON file to MongoDB
 * @param {string} filePath - Path to the JSON file with localStorage data
 */
async function migrateData(filePath) {
    try {
        console.log('Starting migration from localStorage to MongoDB...');
        
        // Read the JSON file
        const rawData = fs.readFileSync(filePath);
        const localStorageData = JSON.parse(rawData);
        
        console.log('Data loaded from file:', filePath);

        // Check if we have the required data
        if (!localStorageData.businesses || !Array.isArray(localStorageData.businesses)) {
            console.error('No businesses found in the data file');
            process.exit(1);
        }

        // Get existing data counts
        const existingBusinessCount = await Business.countDocuments();
        const existingPropertyCount = await Property.countDocuments();
        const existingUserCount = await User.countDocuments();
        
        console.log(`Existing data in MongoDB: ${existingBusinessCount} businesses, ${existingPropertyCount} properties, ${existingUserCount} users`);

        if (existingBusinessCount > 0 || existingPropertyCount > 0) {
            console.log('Warning: There is existing data in the database.');
            console.log('Do you want to continue with the migration? This may lead to duplicate data.');
            console.log('If you want to proceed, uncomment the code below and run again.');
            return;
        }

        // Process businesses
        console.log(`Migrating ${localStorageData.businesses.length} businesses...`);
        const businessMap = new Map(); // To map old business IDs to new MongoDB IDs

        for (const business of localStorageData.businesses) {
            const newBusiness = new Business({
                name: business.name,
                address: business.address || 'No address provided',
                phone: business.phone || 'No phone provided',
                email: business.email || 'noemail@example.com',
                // Don't add properties yet, will add after creating them
            });
            
            const savedBusiness = await newBusiness.save();
            businessMap.set(business.id, savedBusiness._id);
            console.log(`Migrated business: ${business.name}`);
        }
        
        // Process properties
        if (localStorageData.properties && Array.isArray(localStorageData.properties)) {
            console.log(`Migrating ${localStorageData.properties.length} properties...`);
            
            for (const property of localStorageData.properties) {
                // Get the new business ID
                const businessId = businessMap.get(property.businessId);
                
                if (!businessId) {
                    console.warn(`Business ID ${property.businessId} not found for property ${property.name}, skipping`);
                    continue;
                }
                
                // Generate unique property code and connection code
                const propertyCode = 'PROP' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
                const connectionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                
                const newProperty = new Property({
                    name: property.name,
                    address: property.address || 'No address provided',
                    business: businessId,
                    isMainProperty: property.isMainProperty || false,
                    propertyCode,
                    connectionCode
                });
                
                const savedProperty = await newProperty.save();
                
                // Add the property to the business
                const business = await Business.findById(businessId);
                business.properties.push(savedProperty._id);
                await business.save();
                
                console.log(`Migrated property: ${property.name} for business with ID ${businessId}`);
            }
        } else {
            console.log('No properties found in the data file');
        }
        
        // Create super admin user if it doesn't exist
        const superAdminExists = await User.findOne({ role: 'super_admin' });
        
        if (!superAdminExists) {
            console.log('Creating super admin user...');
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('superadmin123', salt);
            
            const superAdmin = new User({
                username: 'superadmin',
                email: 'superadmin@zentrypos.com',
                password: hashedPassword,
                role: 'super_admin'
            });
            
            await superAdmin.save();
            console.log('Super admin user created');
        } else {
            console.log('Super admin user already exists');
        }

        console.log('Migration completed successfully!');
        console.log('-------------------------------');
        console.log('Summary:');
        const finalBusinessCount = await Business.countDocuments();
        const finalPropertyCount = await Property.countDocuments();
        const finalUserCount = await User.countDocuments();
        
        console.log(`Businesses migrated: ${finalBusinessCount - existingBusinessCount}`);
        console.log(`Properties migrated: ${finalPropertyCount - existingPropertyCount}`);
        console.log(`Users created: ${finalUserCount - existingUserCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
}

// Check for file path argument
if (process.argv.length < 3) {
    console.error('Usage: node migrate-data.js <path-to-json-file>');
    process.exit(1);
}

const filePath = process.argv[2];
migrateData(filePath);

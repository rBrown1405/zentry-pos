/**
 * This script creates a super admin user in the database
 * Run it with: node scripts/create-super-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import User model
const User = require('../src/models/user.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connected...');
        
        try {
            // Check if super admin already exists
            const superAdminExists = await User.findOne({ role: 'super_admin' });
            
            if (superAdminExists) {
                console.log('Super Admin already exists with email:', superAdminExists.email);
                process.exit(0);
            }
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            // Create super admin user
            const superAdmin = await User.create({
                username: 'superadmin',
                email: 'superadmin@zentrypos.com',
                password: hashedPassword,
                role: 'super_admin'
            });
            
            console.log('Super Admin created successfully:');
            console.log('Email:', superAdmin.email);
            console.log('Username:', superAdmin.username);
            console.log('Password: admin123');
            console.log('Please change the password after first login!');
            
            process.exit(0);
        } catch (error) {
            console.error('Error creating Super Admin:', error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

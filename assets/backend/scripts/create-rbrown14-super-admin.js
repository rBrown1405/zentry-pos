/**
 * Script to create rBrown14 super admin user
 * Run it with: node scripts/create-rbrown14-super-admin.js
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
            // Check if rBrown14 super admin already exists
            const rBrownAdmin = await User.findOne({ username: 'rBrown14' });
            
            if (rBrownAdmin) {
                console.log('rBrown14 super admin already exists with email:', rBrownAdmin.email);
                
                // Update to ensure it has super_admin role
                rBrownAdmin.role = 'super_admin';
                await rBrownAdmin.save();
                console.log('Updated rBrown14 to super_admin role');
                process.exit(0);
            }
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Armoured@', salt);
            
            // Create rBrown14 super admin user
            const rBrownSuperAdmin = await User.create({
                username: 'rBrown14',
                email: 'rbrown14@zentrypos.com',
                password: hashedPassword,
                role: 'super_admin',
                active: true
            });
            
            console.log('rBrown14 Super Admin created successfully:');
            console.log('Username:', rBrownSuperAdmin.username);
            console.log('Email:', rBrownSuperAdmin.email);
            console.log('Password: Armoured@');
            console.log('Role:', rBrownSuperAdmin.role);
            console.log('Active:', rBrownSuperAdmin.active);
            
            process.exit(0);
        } catch (error) {
            console.error('Error creating rBrown14 Super Admin:', error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

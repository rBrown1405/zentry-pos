// User controller for handling user management operations
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin or Admin
exports.getUsers = async (req, res) => {
    try {
        let query;

        // If user is super_admin, get all users
        // If user is admin, get only users for their business
        if (req.user.role === 'super_admin') {
            query = User.find().select('-password').populate('business', 'name');
        } else if (req.user.role === 'admin') {
            query = User.find({ business: req.user.business }).select('-password').populate('business', 'name');
        } else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }

        const users = await query;

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/SuperAdmin or Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('business', 'name');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Make sure user has access to this user record
        // Super admin can access any user
        // Admin can only access users in their business
        if (req.user.role === 'admin' && (!user.business || user.business.toString() !== req.user.business.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this user'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/SuperAdmin or Admin
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, businessId } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Validate role assignment permissions
        // Only super_admin can create super_admin
        if (role === 'super_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create super admin users'
            });
        }

        // If admin is creating a user, assign to admin's business
        let business = null;
        if (req.user.role === 'admin') {
            business = req.user.business;
        } else if (businessId) {
            // If super_admin provides a business ID
            business = businessId;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user', // Default to user role
            business
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                business: user.business
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin or Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check permissions
        // Admins can only update users in their business
        if (req.user.role === 'admin') {
            if (!user.business || user.business.toString() !== req.user.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this user'
                });
            }
            
            // Admins cannot change roles to super_admin
            if (req.body.role === 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to assign super admin role'
                });
            }
            
            // Admins cannot change the business
            if (req.body.business && req.body.business.toString() !== req.user.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to change user business'
                });
            }
        }

        // Handle password update if provided
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin or Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check permissions
        // Super admins can delete any user except other super admins
        if (req.user.role === 'super_admin' && user.role === 'super_admin' && user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Super admin users can only be deleted by themselves'
            });
        }

        // Admins can only delete users in their business
        if (req.user.role === 'admin') {
            if (!user.business || user.business.toString() !== req.user.business.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this user'
                });
            }
            
            // Admins cannot delete other admins
            if (user.role === 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admins cannot delete other admins'
                });
            }
        }

        // Delete the user
        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Assign user to business
// @route   PUT /api/users/:id/assign-business
// @access  Private/SuperAdmin
exports.assignUserToBusiness = async (req, res) => {
    try {
        const { businessId } = req.body;
        
        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID is required'
            });
        }

        // Only super_admin can assign users to businesses
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to assign users to businesses'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user's business
        user.business = businessId;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                business: user.business
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

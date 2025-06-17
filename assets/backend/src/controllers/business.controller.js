const Business = require('../models/business.model');
const User = require('../models/user.model');

// @desc    Create new business
// @route   POST /api/businesses
// @access  Private
exports.createBusiness = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;

        // Create business
        const business = await Business.create({
            name,
            address,
            phone,
            email
        });

        res.status(201).json({
            success: true,
            data: business
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Private/SuperAdmin
exports.getBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find();
        
        res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single business
// @route   GET /api/businesses/:id
// @access  Private
exports.getBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: business
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private
exports.updateBusiness = async (req, res) => {
    try {
        const business = await Business.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: business
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete business
// @route   DELETE /api/businesses/:id
// @access  Private/SuperAdmin
exports.deleteBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }
        
        await business.deleteOne();
        
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

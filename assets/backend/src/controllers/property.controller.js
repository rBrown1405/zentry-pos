const Property = require('../models/property.model');
const Business = require('../models/business.model');
const crypto = require('crypto');

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = async (req, res) => {
    try {
        const { name, address, businessId, isMainProperty } = req.body;

        // Get the business
        const business = await Business.findById(businessId || req.user.businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        // Generate unique property code and connection code
        const propertyCode = 'PROP' + Date.now().toString().slice(-6);
        const connectionCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Create property
        const property = await Property.create({
            name,
            address,
            business: business._id,
            isMainProperty: isMainProperty || false,
            propertyCode,
            connectionCode
        });

        // Add property to business
        business.properties.push(property._id);
        await business.save();

        res.status(201).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Private
exports.getProperties = async (req, res) => {
    try {
        let query;

        // If user is super_admin, get all properties, else get only properties for their business
        if (req.user.role === 'super_admin') {
            query = Property.find().populate('business', 'name');
        } else {
            query = Property.find({ business: req.user.businessId }).populate('business', 'name');
        }

        const properties = await query;

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
exports.getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('business', 'name');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user has access to property
        if (req.user.role !== 'super_admin' && property.business.toString() !== req.user.businessId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this property'
            });
        }

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user has access to property
        if (req.user.role !== 'super_admin' && property.business.toString() !== req.user.businessId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this property'
            });
        }

        property = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user has access to property
        if (req.user.role !== 'super_admin' && property.business.toString() !== req.user.businessId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this property'
            });
        }

        // Remove property from business
        const business = await Business.findById(property.business);
        if (business) {
            business.properties = business.properties.filter(
                id => id.toString() !== property._id.toString()
            );
            await business.save();
        }

        await property.deleteOne();

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

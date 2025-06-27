const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    businessCode: {
        type: String,
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true,
        default: 'restaurant'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyEmail: {
        type: String,
        required: true
    },
    companyPhone: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    settings: {
        requireApprovalForNewStaff: {
            type: Boolean,
            default: true
        },
        taxRate: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    properties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;

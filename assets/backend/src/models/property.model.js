const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a property name'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
        trim: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    isMainProperty: {
        type: Boolean,
        default: false
    },
    propertyCode: {
        type: String,
        unique: true
    },
    connectionCode: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
propertySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Property', propertySchema);
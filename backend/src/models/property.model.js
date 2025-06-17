const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    propertyCode: {
        type: String,
        required: true,
        unique: true
    },
    propertyName: {
        type: String,
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    connectionCode: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    isMainProperty: {
        type: Boolean,
        default: false
    },
    settings: {
        tables: [{
            number: String,
            capacity: Number,
            section: String
        }],
        sections: [{
            name: String,
            description: String
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;

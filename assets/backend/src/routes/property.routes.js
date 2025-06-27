const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createProperty,
    getProperties,
    getProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/property.controller');

// Apply protect middleware to all property routes
router.use(protect);

router.route('/')
    .post(authorize(['super_admin', 'admin']), createProperty)
    .get(getProperties);

router.route('/:id')
    .get(getProperty)
    .put(authorize(['super_admin', 'admin']), updateProperty)
    .delete(authorize(['super_admin', 'admin']), deleteProperty);

module.exports = router;

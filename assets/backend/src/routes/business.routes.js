const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createBusiness,
    getBusinesses,
    getBusiness,
    updateBusiness,
    deleteBusiness
} = require('../controllers/business.controller');

// Apply protect middleware to all business routes
router.use(protect);

// Import validation middleware
const { businessValidation, validateRequest } = require('../middleware/validation');

router.route('/')
    .post(authorize(['super_admin']), businessValidation, validateRequest, createBusiness)
    .get(authorize(['super_admin']), getBusinesses);

router.route('/:id')
    .get(authorize(['super_admin', 'admin']), getBusiness)
    .put(authorize(['super_admin']), updateBusiness)
    .delete(authorize(['super_admin']), deleteBusiness);

module.exports = router;

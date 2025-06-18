// Input Validation Middleware
const { body, validationResult } = require('express-validator');

/**
 * Format validation errors into a standardized response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .isAlphanumeric()
        .withMessage('Username must contain only letters and numbers'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-zA-Z]/)
        .withMessage('Password must contain at least one letter'),
    
    body('role')
        .optional()
        .isIn(['super_admin', 'admin', 'user'])
        .withMessage('Invalid role specified')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for creating a business
 */
const businessValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Business name is required')
        .isLength({ max: 100 })
        .withMessage('Business name cannot exceed 100 characters'),
    
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Business address is required'),
    
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Business phone is required'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
];

/**
 * Validation rules for creating a property
 */
const propertyValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Property name is required')
        .isLength({ max: 100 })
        .withMessage('Property name cannot exceed 100 characters'),
    
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Property address is required'),
    
    body('businessId')
        .optional()
        .isMongoId()
        .withMessage('Invalid business ID format'),
    
    body('isMainProperty')
        .optional()
        .isBoolean()
        .withMessage('isMainProperty must be a boolean value')
];

module.exports = {
    validateRequest,
    registerValidation,
    loginValidation,
    businessValidation,
    propertyValidation
};

// Rate Limiting Middleware
const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter middleware with configurable parameters
 * @param {Object} options - Configuration options for the rate limiter
 * @returns {Function} - Express middleware function
 */
const createRateLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: {
            success: false,
            message: 'Too many requests, please try again later.'
        }
    };

    return rateLimit({
        ...defaultOptions,
        ...options
    });
};

// API rate limiter - general purpose for all API routes
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
});

// Authentication limiter - stricter for login attempts to prevent brute force
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};

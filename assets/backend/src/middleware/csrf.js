// CSRF Protection Middleware
const crypto = require('crypto');

/**
 * Middleware to protect against Cross-Site Request Forgery (CSRF) attacks
 * Generates a CSRF token and validates it on form submissions
 */
const csrfProtection = (req, res, next) => {
    // Skip CSRF checks for GET, HEAD, OPTIONS requests (they should be idempotent)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // For GET requests, generate and set a new CSRF token
        const csrfToken = generateCsrfToken();
        
        // Store token in response locals to make it available for views
        res.locals.csrfToken = csrfToken;
        
        // Set CSRF token cookie
        res.cookie('XSRF-TOKEN', csrfToken, {
            httpOnly: false, // Allow JavaScript access so frontend can use it
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        return next();
    }
    
    // For mutations (POST, PUT, DELETE, etc.), validate the token
    
    // Get the CSRF token from the request
    const requestToken = req.headers['x-csrf-token'] || req.body._csrf;
    const cookieToken = req.cookies ? req.cookies['XSRF-TOKEN'] : null;
    
    // If no token is provided, reject the request
    if (!requestToken || !cookieToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing. Access denied.'
        });
    }
    
    // Compare the tokens
    if (requestToken !== cookieToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token invalid. Access denied.'
        });
    }
    
    // Token is valid, proceed with the request
    next();
};

/**
 * Generate a random CSRF token
 * @returns {string} - A random token
 */
const generateCsrfToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

module.exports = csrfProtection;

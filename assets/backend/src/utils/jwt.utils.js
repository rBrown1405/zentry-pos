const jwt = require('jsonwebtoken');

/**
 * Generate access token for user
 * @param {Object} user - User object with _id
 * @returns {String} JWT token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Short-lived token
    );
};

/**
 * Generate refresh token for user
 * @param {Object} user - User object with _id
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

/**
 * Verify refresh token
 * @param {String} token - Refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(
        token, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};

const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Import validation middleware
const { registerValidation, loginValidation, validateRequest } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rate-limit');

// Register and login routes (public) with validation and rate limiting
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;

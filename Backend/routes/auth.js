const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    logout,
    deleteAccount,
    updatePreferences,
    getUserStats
} = require('../controllers/authController');

const { protect, authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty()
        .withMessage('Please provide a password')
];

const updateDetailsValidation = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('firstName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters')
        .trim(),
    
    body('lastName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters')
        .trim()
];

const updatePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Please provide current password'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const updatePreferencesValidation = [
    body('emailNotifications')
        .optional()
        .isBoolean()
        .withMessage('Email notifications must be true or false'),
    
    body('theme')
        .optional()
        .isIn(['light', 'dark'])
        .withMessage('Theme must be either light or dark')
];

// Validation middleware
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    };
};

// Public routes
router.post('/register', authRateLimit, validate(registerValidation), register);
router.post('/login', authRateLimit, validate(loginValidation), login);
router.post('/forgotpassword', authRateLimit, validate(forgotPasswordValidation), forgotPassword);
router.put('/resetpassword/:resettoken', authRateLimit, validate(resetPasswordValidation), resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validate(updateDetailsValidation), updateDetails);
router.put('/updatepassword', protect, validate(updatePasswordValidation), updatePassword);
router.put('/preferences', protect, validate(updatePreferencesValidation), updatePreferences);
router.get('/stats', protect, getUserStats);
router.post('/logout', protect, logout);
router.delete('/deleteaccount', protect, deleteAccount);

module.exports = router;
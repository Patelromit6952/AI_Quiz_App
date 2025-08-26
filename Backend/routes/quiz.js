const express = require('express');
const { body, param, query } = require('express-validator');
const {
    getCategories,
    generateQuiz,
    getQuiz,
    submitQuiz,
    getUserSubmissions,
    getSubmissionDetails,
    getQuizLeaderboard,
    getQuizStats,
    deleteQuiz,
    getUserCreatedQuizzes,
    updateQuizSettings,
    getPublicQuizzes,
    addSubmissionFeedback,
    getQuizAnalytics
} = require('../controllers/quizController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const generateQuizValidation = [
    body('category')
        .optional()
        .isNumeric()
        .withMessage('Category must be a number'),
    
    body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard', 'mixed'])
        .withMessage('Difficulty must be easy, medium, hard, or mixed'),
    
    body('type')
        .optional()
        .isIn(['multiple', 'boolean', 'mixed'])
        .withMessage('Type must be multiple, boolean, or mixed'),
    
    body('amount')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Amount must be between 1 and 50'),
    
    body('timeLimit')
        .optional()
        .isInt({ min: 1, max: 180 })
        .withMessage('Time limit must be between 1 and 180 minutes'),
    
    body('title')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters')
        .trim()
];

const submitQuizValidation = [
    body('answers')
        .isArray({ min: 1 })
        .withMessage('Answers must be a non-empty array'),
    
    body('answers.*.questionId')
        .notEmpty()
        .withMessage('Question ID is required for each answer'),
    
    body('answers.*.answer')
        .notEmpty()
        .withMessage('Answer is required for each question'),
    
    body('timeTaken')
        .isInt({ min: 1 })
        .withMessage('Time taken must be a positive integer'),
    
    body('startTime')
        .optional()
        .isISO8601()
        .withMessage('Start time must be a valid ISO date')
];

const mongoIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format')
];

const updateQuizSettingsValidation = [
    body('showCorrectAnswers')
        .optional()
        .isBoolean()
        .withMessage('Show correct answers must be true or false'),
    
    body('randomizeQuestions')
        .optional()
        .isBoolean()
        .withMessage('Randomize questions must be true or false'),
    
    body('randomizeAnswers')
        .optional()
        .isBoolean()
        .withMessage('Randomize answers must be true or false'),
    
    body('allowRetake')
        .optional()
        .isBoolean()
        .withMessage('Allow retake must be true or false'),
    
    body('timeLimit')
        .optional()
        .isInt({ min: 1, max: 180 })
        .withMessage('Time limit must be between 1 and 180 minutes'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('Is active must be true or false')
];

const feedbackValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    
    body('comment')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters')
        .trim()
];

const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'percentage', 'score', 'timeTaken', 'title'])
        .withMessage('Sort by must be one of: createdAt, percentage, score, timeTaken, title'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
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
router.get('/categories', getCategories);
router.get('/public', validate(paginationValidation), getPublicQuizzes);
router.get('/:id', validate(mongoIdValidation), getQuiz);
router.get('/:id/leaderboard', validate(mongoIdValidation), getQuizLeaderboard);
router.get('/:id/stats', validate(mongoIdValidation), getQuizStats);

// Protected routes
router.post('/generate', protect, validate(generateQuizValidation), generateQuiz);
router.post('/:id/submit', protect, validate([...mongoIdValidation, ...submitQuizValidation]), submitQuiz);
router.get('/user/submissions', protect, validate(paginationValidation), getUserSubmissions);
router.get('/user/created', protect, validate(paginationValidation), getUserCreatedQuizzes);
router.get('/submission/:id', protect, validate(mongoIdValidation), getSubmissionDetails);
router.put('/submission/:id/feedback', protect, validate([...mongoIdValidation, ...feedbackValidation]), addSubmissionFeedback);
router.put('/:id/settings', protect, validate([...mongoIdValidation, ...updateQuizSettingsValidation]), updateQuizSettings);
router.delete('/:id', protect, validate(mongoIdValidation), deleteQuiz);

// Admin routes
router.get('/admin/analytics', protect, authorize('admin'), getQuizAnalytics);

module.exports = router;
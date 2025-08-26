const express = require('express');
const router = express.Router();
const aiHintsController = require('../controllers/aiHintsController');
const {auth} = require('../middleware/auth');

// Generate a hint for a question
router.post('/hint', auth, aiHintsController.generateHint);

// Generate multiple hints for a question
router.post('/hints', auth, aiHintsController.generateMultipleHints);

// Generate study suggestions
router.post('/study-suggestions', auth, aiHintsController.generateStudySuggestions);

// Generate explanation for answer
router.post('/explanation', auth, aiHintsController.generateExplanation);

// Check AI service availability
router.get('/availability', auth, aiHintsController.checkAvailability);

// Generate comprehensive quiz feedback
router.post('/quiz-feedback', auth, aiHintsController.generateQuizFeedback);

module.exports = router;

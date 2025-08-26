const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const {auth} = require('../middleware/auth');

// Get leaderboard with pagination
router.get('/', auth, leaderboardController.getLeaderboard);

// Get user's rank and stats
router.get('/user/rank', auth, leaderboardController.getUserRank);

// Get user's achievements
router.get('/user/achievements', auth, leaderboardController.getUserAchievements);

// Get leaderboard statistics
router.get('/stats', auth, leaderboardController.getLeaderboardStats);

// Get category-specific leaderboard
router.get('/category/:category', auth, leaderboardController.getCategoryLeaderboard);

// Update leaderboard (admin function)
router.post('/update', auth, leaderboardController.updateLeaderboard);

module.exports = router;

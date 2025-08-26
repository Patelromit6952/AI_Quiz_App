    const Leaderboard = require('../models/Leaderboard');
    const Submission = require('../models/Submission');
    const User = require('../models/User');

    /**
     * Get leaderboard with pagination
     */
    const getLeaderboard = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const category = req.query.category;
            const timeframe = req.query.timeframe || 'all'; // all, week, month

            let query = {};
            
            // Filter by category if specified
            if (category) {
                // This would need to be implemented based on your quiz structure
                // For now, we'll get all leaderboard entries
            }

            // Filter by timeframe
            if (timeframe !== 'all') {
                const now = new Date();
                let startDate;
                
                switch (timeframe) {
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                }
                
                if (startDate) {
                    query.lastQuizDate = { $gte: startDate };
                }
            }

            const leaderboard = await Leaderboard.find(query)
                .sort({ totalScore: -1, averageScore: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user', 'username email firstName lastName')
                .lean();

            const total = await Leaderboard.countDocuments(query);

            res.json({
                success: true,
                data: {
                    leaderboard,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get leaderboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard'
            });
        }
    };

    /**
     * Get user's rank and stats
     */
    const getUserRank = async (req, res) => {
        try {
            const userId = req.user.id;
            
            const userEntry = await Leaderboard.findOne({ user: userId })
                .populate('user', 'username email firstName lastName')
                .lean();

            if (!userEntry) {
                return res.json({
                    success: true,
                    data: {
                        rank: null,
                        stats: null,
                        message: 'No quiz attempts yet'
                    }
                });
            }

            const rank = await Leaderboard.countDocuments({ totalScore: { $gt: userEntry.totalScore } });

            res.json({
                success: true,
                data: {
                    rank: rank + 1,
                    stats: userEntry
                }
            });
        } catch (error) {
            console.error('Get user rank error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user rank'
            });
        }
    };

    /**
     * Get user's achievements
     */
    const getUserAchievements = async (req, res) => {
        try {
            const userId = req.user.id;
            
            const userEntry = await Leaderboard.findOne({ user: userId })
                .select('achievements')
                .lean();

            if (!userEntry) {
                return res.json({
                    success: true,
                    data: {
                        achievements: [],
                        totalAchievements: 0
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    achievements: userEntry.achievements,
                    totalAchievements: userEntry.achievements.length
                }
            });
        } catch (error) {
            console.error('Get user achievements error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch achievements'
            });
        }
    };

    /**
     * Update leaderboard (admin function)
     */
    const updateLeaderboard = async (req, res) => {
        try {
            const updatedLeaderboard = await Leaderboard.updateLeaderboard();
            
            res.json({
                success: true,
                message: 'Leaderboard updated successfully',
                data: {
                    totalEntries: updatedLeaderboard.length
                }
            });
        } catch (error) {
            console.error('Update leaderboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update leaderboard'
            });
        }
    };

    /**
     * Get leaderboard statistics
     */
    const getLeaderboardStats = async (req, res) => {
        try {
            const totalUsers = await Leaderboard.countDocuments();
            const totalScore = await Leaderboard.aggregate([
                { $group: { _id: null, total: { $sum: '$totalScore' } } }
            ]);
            
            const averageScore = await Leaderboard.aggregate([
                { $group: { _id: null, average: { $avg: '$averageScore' } } }
            ]);

            const topPerformers = await Leaderboard.find()
                .sort({ totalScore: -1 })
                .limit(5)
                .populate('user', 'username')
                .select('username totalScore averageScore')
                .lean();

            res.json({
                success: true,
                data: {
                    totalUsers,
                    totalScore: totalScore[0]?.total || 0,
                    averageScore: Math.round(averageScore[0]?.average || 0),
                    topPerformers
                }
            });
        } catch (error) {
            console.error('Get leaderboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard statistics'
            });
        }
    };

    /**
     * Get category-specific leaderboard
     */
    const getCategoryLeaderboard = async (req, res) => {
        try {
            const { category } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            // Get submissions for specific category
            const submissions = await Submission.aggregate([
                {
                    $lookup: {
                        from: 'quizzes',
                        localField: 'quiz',
                        foreignField: '_id',
                        as: 'quizData'
                    }
                },
                {
                    $unwind: '$quizData'
                },
                {
                    $match: {
                        'quizData.category': category
                    }
                },
                {
                    $group: {
                        _id: '$user',
                        totalScore: { $sum: '$score' },
                        totalQuizzes: { $sum: 1 },
                        averageScore: { $avg: '$percentage' },
                        bestScore: { $max: '$percentage' }
                    }
                },
                {
                    $sort: { totalScore: -1 }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ]);

            // Get user details
            const userIds = submissions.map(sub => sub._id);
            const users = await User.find({ _id: { $in: userIds } })
                .select('username email firstName lastName')
                .lean();

            const userMap = users.reduce((map, user) => {
                map[user._id.toString()] = user;
                return map;
            }, {});

            // Combine data
            const leaderboard = submissions.map((sub, index) => ({
                rank: (page - 1) * limit + index + 1,
                user: userMap[sub._id.toString()],
                totalScore: sub.totalScore,
                totalQuizzes: sub.totalQuizzes,
                averageScore: Math.round(sub.averageScore),
                bestScore: sub.bestScore
            }));

            res.json({
                success: true,
                data: {
                    category,
                    leaderboard,
                    pagination: {
                        page,
                        limit,
                        total: submissions.length
                    }
                }
            });
        } catch (error) {
            console.error('Get category leaderboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch category leaderboard'
            });
        }
    };

    /**
     * Check and award achievements after quiz completion
     */
    const checkAchievements = async (userId, submission) => {
        try {
            const newAchievements = await Leaderboard.checkAchievements(userId, submission);
            return newAchievements;
        } catch (error) {
            console.error('Check achievements error:', error);
            return [];
        }
    };

    module.exports = {
        getLeaderboard,
        getUserRank,
        getUserAchievements,
        updateLeaderboard,
        getLeaderboardStats,
        getCategoryLeaderboard,
        checkAchievements
    };

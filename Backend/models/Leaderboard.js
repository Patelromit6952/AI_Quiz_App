const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    totalScore: {
        type: Number,
        default: 0
    },
    totalQuizzes: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    bestScore: {
        type: Number,
        default: 0
    },
    totalTimeSpent: {
        type: Number, // in seconds
        default: 0
    },
    achievements: [{
        type: {
            type: String,
            enum: ['first_quiz', 'perfect_score', 'speed_demon', 'persistent', 'master', 'streak_3', 'streak_5', 'streak_10']
        },
        earnedAt: {
            type: Date,
            default: Date.now
        },
        description: String
    }],
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastQuizDate: {
        type: Date
    },
    rank: {
        type: Number,
        default: 0
    },
    previousRank: {
        type: Number,
        default: 0
    },
    rankChange: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better performance
leaderboardEntrySchema.index({ totalScore: -1 });
leaderboardEntrySchema.index({ averageScore: -1 });
leaderboardEntrySchema.index({ totalQuizzes: -1 });
leaderboardEntrySchema.index({ rank: 1 });
leaderboardEntrySchema.index({ user: 1 }, { unique: true });

// Virtual for rank change indicator
leaderboardEntrySchema.virtual('rankChangeIndicator').get(function() {
    if (this.rankChange > 0) return 'up';
    if (this.rankChange < 0) return 'down';
    return 'stable';
});

// Static method to update leaderboard
leaderboardEntrySchema.statics.updateLeaderboard = async function() {
    // Get all submissions and calculate scores
    const Submission = require('./Submission');
    const User = require('./User');
    
    const submissions = await Submission.aggregate([
        {
            $group: {
                _id: '$user',
                totalScore: { $sum: '$score' },
                totalQuizzes: { $sum: 1 },
                averageScore: { $avg: '$percentage' },
                bestScore: { $max: '$percentage' },
                totalTimeSpent: { $sum: '$timeTaken' },
                lastQuizDate: { $max: '$createdAt' }
            }
        }
    ]);

    // Get user details
    const userIds = submissions.map(sub => sub._id);
    const users = await User.find({ _id: { $in: userIds } }).select('username email');
    const userMap = users.reduce((map, user) => {
        map[user._id.toString()] = user;
        return map;
    }, {});

    // Clear existing leaderboard
    await this.deleteMany({});

    // Create new leaderboard entries
    const leaderboardEntries = submissions.map(sub => {
        const user = userMap[sub._id.toString()];
        return {
            user: sub._id,
            username: user?.username || 'Unknown',
            email: user?.email || '',
            totalScore: sub.totalScore,
            totalQuizzes: sub.totalQuizzes,
            averageScore: Math.round(sub.averageScore),
            bestScore: sub.bestScore,
            totalTimeSpent: sub.totalTimeSpent,
            lastQuizDate: sub.lastQuizDate
        };
    });

    // Sort by total score (descending)
    leaderboardEntries.sort((a, b) => b.totalScore - a.totalScore);

    // Add ranks
    leaderboardEntries.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    // Save to database
    await this.insertMany(leaderboardEntries);

    return leaderboardEntries;
};

// Static method to get leaderboard with pagination
leaderboardEntrySchema.statics.getLeaderboard = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const entries = await this.find()
        .sort({ totalScore: -1, averageScore: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username email firstName lastName')
        .lean();

    const total = await this.countDocuments();

    return {
        entries,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Static method to get user's rank
leaderboardEntrySchema.statics.getUserRank = async function(userId) {
    const entry = await this.findOne({ user: userId });
    if (!entry) return null;
    
    const rank = await this.countDocuments({ totalScore: { $gt: entry.totalScore } });
    return rank + 1;
};

// Static method to check and award achievements
leaderboardEntrySchema.statics.checkAchievements = async function(userId, submission) {
    const entry = await this.findOne({ user: userId });
    if (!entry) return [];

    const newAchievements = [];
    const Submission = require('./Submission');

    // First quiz achievement
    if (entry.totalQuizzes === 1 && !entry.achievements.find(a => a.type === 'first_quiz')) {
        newAchievements.push({
            type: 'first_quiz',
            description: 'Completed your first quiz!'
        });
    }

    // Perfect score achievement
    if (submission.percentage === 100 && !entry.achievements.find(a => a.type === 'perfect_score')) {
        newAchievements.push({
            type: 'perfect_score',
            description: 'Achieved a perfect score!'
        });
    }

    // Speed demon achievement (completed quiz in less than 50% of time limit)
    const timeEfficiency = (submission.timeTaken / submission.timeLimit) * 100;
    if (timeEfficiency < 50 && submission.percentage >= 80 && !entry.achievements.find(a => a.type === 'speed_demon')) {
        newAchievements.push({
            type: 'speed_demon',
            description: 'Fast and accurate! Completed quiz quickly with high score.'
        });
    }

    // Master achievement (average score above 90%)
    if (entry.averageScore >= 90 && entry.totalQuizzes >= 5 && !entry.achievements.find(a => a.type === 'master')) {
        newAchievements.push({
            type: 'master',
            description: 'Quiz Master! Maintained excellent performance across multiple quizzes.'
        });
    }

    // Add new achievements to user's profile
    if (newAchievements.length > 0) {
        entry.achievements.push(...newAchievements);
        await entry.save();
    }

    return newAchievements;
};

module.exports = mongoose.model('Leaderboard', leaderboardEntrySchema);

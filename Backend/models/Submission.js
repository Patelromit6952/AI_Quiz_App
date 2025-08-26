const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
});

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        required: true,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 1
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    incorrectAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    skippedAnswers: {
        type: Number,
        default: 0,
        min: 0
    },
    timeTaken: {
        type: Number, // in seconds
        required: true
    },
    timeLimit: {
        type: Number, // in seconds
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'timeout', 'abandoned'],
        default: 'completed'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date
    },
    retakeAllowed: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ quiz: 1, createdAt: -1 });
submissionSchema.index({ user: 1, quiz: 1 });
submissionSchema.index({ percentage: -1 });
submissionSchema.index({ createdAt: -1 });

// Virtual for grade based on percentage
submissionSchema.virtual('grade').get(function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
});

// Virtual for performance level
submissionSchema.virtual('performance').get(function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    if (percentage >= 50) return 'Below Average';
    return 'Poor';
});

// Virtual for time efficiency (percentage of time used)
submissionSchema.virtual('timeEfficiency').get(function() {
    return Math.round((this.timeTaken / this.timeLimit) * 100);
});

// Calculate derived fields before saving
submissionSchema.pre('save', function(next) {
    // Calculate percentage
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
    
    // Calculate correct/incorrect answers
    this.correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
    this.incorrectAnswers = this.answers.filter(answer => !answer.isCorrect && answer.userAnswer).length;
    this.skippedAnswers = this.answers.filter(answer => !answer.userAnswer).length;
    
    next();
});

// Static method to get user's quiz statistics
submissionSchema.statics.getUserQuizStats = function(userId) {
    return this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalQuizzes: { $sum: 1 },
                averageScore: { $avg: '$percentage' },
                bestScore: { $max: '$percentage' },
                totalTimeTaken: { $sum: '$timeTaken' },
                totalCorrectAnswers: { $sum: '$correctAnswers' },
                totalIncorrectAnswers: { $sum: '$incorrectAnswers' }
            }
        }
    ]);
};

// Static method to get quiz statistics
submissionSchema.statics.getQuizStats = function(quizId) {
    return this.aggregate([
        { $match: { quiz: mongoose.Types.ObjectId(quizId) } },
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: '$percentage' },
                highestScore: { $max: '$percentage' },
                lowestScore: { $min: '$percentage' },
                averageTime: { $avg: '$timeTaken' }
            }
        }
    ]);
};

// Instance method to generate performance insights
submissionSchema.methods.getPerformanceInsights = function() {
    const insights = [];
    
    // Score-based insights
    if (this.percentage >= 90) {
        insights.push("Excellent performance! You've mastered this topic.");
    } else if (this.percentage >= 70) {
        insights.push("Good job! You have a solid understanding of the material.");
    } else if (this.percentage >= 50) {
        insights.push("You're on the right track. Review the topics you missed.");
    } else {
        insights.push("Consider reviewing the material and retaking the quiz.");
    }
    
    // Time-based insights
    const timeEfficiency = this.timeEfficiency;
    if (timeEfficiency < 50) {
        insights.push("You completed the quiz quickly. Great time management!");
    } else if (timeEfficiency > 90) {
        insights.push("You used most of the available time. Consider practicing to improve speed.");
    }
    
    // Answer pattern insights
    const accuracy = this.correctAnswers / (this.correctAnswers + this.incorrectAnswers);
    if (accuracy < 0.5 && this.skippedAnswers > this.incorrectAnswers) {
        insights.push("You skipped many questions. Try to attempt all questions even if unsure.");
    }
    
    return insights;
};

module.exports = mongoose.model('Submission', submissionSchema);
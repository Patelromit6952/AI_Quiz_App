const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['multiple', 'boolean'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    incorrectAnswers: [{
        type: String
    }],
    allAnswers: [{
        type: String
    }], // Shuffled array of all answers
    points: {
        type: Number,
        default: function() {
            // Points based on difficulty
            switch(this.difficulty) {
                case 'easy': return 1;
                case 'medium': return 2;
                case 'hard': return 3;
                default: return 1;
            }
        }
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'mixed'],
        default: 'mixed'
    },
    type: {
        type: String,
        enum: ['multiple', 'boolean', 'mixed'],
        default: 'multiple'
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
        max: 50
    },
    timeLimit: {
        type: Number, // in minutes
        default: 30,
        min: 1,
        max: 180
    },
    questions: [questionSchema],
    totalMarks: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    settings: {
        showCorrectAnswers: {
            type: Boolean,
            default: true
        },
        randomizeQuestions: {
            type: Boolean,
            default: false
        },
        randomizeAnswers: {
            type: Boolean,
            default: true
        },
        allowRetake: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        highestScore: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ category: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ isActive: 1 });

// Virtual for average time per question
quizSchema.virtual('avgTimePerQuestion').get(function() {
    return Math.round((this.timeLimit * 60) / this.totalQuestions); // in seconds
});

// Calculate total marks before saving
quizSchema.pre('save', function(next) {
    if (this.questions && this.questions.length > 0) {
        this.totalMarks = this.questions.reduce((total, question) => total + question.points, 0);
    }
    next();
});

// Update stats method
quizSchema.methods.updateStats = function(score, totalMarks) {
    this.stats.totalAttempts += 1;
    
    const percentage = Math.round((score / totalMarks) * 100);
    
    // Update average score
    const totalScore = (this.stats.averageScore * (this.stats.totalAttempts - 1)) + percentage;
    this.stats.averageScore = Math.round(totalScore / this.stats.totalAttempts);
    
    // Update highest score
    if (percentage > this.stats.highestScore) {
        this.stats.highestScore = percentage;
    }
    
    return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
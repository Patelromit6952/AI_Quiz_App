const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const User = require('../models/User');
const quizApiService = require('../services/quizApiService');
const emailService = require('../services/emailService');

// @desc    Get available quiz categories
// @route   GET /api/quiz/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        console.log('Fetching categories...');
        const categories = await quizApiService.getCategories();
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Category fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quiz/:id
// @access  Private
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Check if user owns the quiz or is admin
        if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Soft delete - deactivate instead of removing
        await Quiz.findByIdAndUpdate(req.params.id, { isActive: false });

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });

    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting quiz'
        });
    }
};

// @desc    Get user's created quizzes
// @route   GET /api/quiz/created
// @access  Private
const getUserCreatedQuizzes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            isActive = true,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { 
            createdBy: req.user.id,
            isActive: isActive === 'true'
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const quizzes = await Quiz.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .select('title category difficulty totalQuestions totalMarks timeLimit stats isActive createdAt');

        const total = await Quiz.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            count: quizzes.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            },
            data: quizzes
        });

    } catch (error) {
        console.error('Get user created quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching created quizzes'
        });
    }
};

// @desc    Update quiz settings
// @route   PUT /api/quiz/:id/settings
// @access  Private
const updateQuizSettings = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Check if user owns the quiz or is admin
        if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const {
            showCorrectAnswers,
            randomizeQuestions,
            randomizeAnswers,
            allowRetake,
            timeLimit,
            isActive
        } = req.body;

        const updateData = {};
        
        if (showCorrectAnswers !== undefined) updateData['settings.showCorrectAnswers'] = showCorrectAnswers;
        if (randomizeQuestions !== undefined) updateData['settings.randomizeQuestions'] = randomizeQuestions;
        if (randomizeAnswers !== undefined) updateData['settings.randomizeAnswers'] = randomizeAnswers;
        if (allowRetake !== undefined) updateData['settings.allowRetake'] = allowRetake;
        if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Quiz settings updated successfully',
            data: updatedQuiz
        });

    } catch (error) {
        console.error('Update quiz settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating quiz settings'
        });
    }
};

// @desc    Get public quizzes
// @route   GET /api/quiz/public
// @access  Public
const getPublicQuizzes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            difficulty,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { isActive: true };

        // Add filters
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const quizzes = await Quiz.find(query)
            .populate('createdBy', 'username firstName lastName')
            .select('title description category difficulty totalQuestions totalMarks timeLimit stats tags createdAt')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Quiz.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            count: quizzes.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            },
            data: quizzes
        });

    } catch (error) {
        console.error('Get public quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public quizzes'
        });
    }
};

// @desc    Add feedback to submission
// @route   PUT /api/quiz/submission/:id/feedback
// @access  Private
const addSubmissionFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Check if user owns this submission
        if (submission.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        submission.feedback = {
            rating,
            comment: comment || ''
        };

        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Feedback added successfully',
            data: submission.feedback
        });

    } catch (error) {
        console.error('Add submission feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding feedback'
        });
    }
};

// @desc    Get quiz analytics for admin
// @route   GET /api/quiz/analytics
// @access  Private (Admin)
const getQuizAnalytics = async (req, res) => {
    try {
        const { timeframe = '30d' } = req.query;

        // Calculate date range
        let startDate = new Date();
        switch (timeframe) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        // Aggregate quiz statistics
        const analytics = await Quiz.aggregate([
            {
                $facet: {
                    totalQuizzes: [
                        { $match: { createdAt: { $gte: startDate } } },
                        { $count: "count" }
                    ],
                    categoryStats: [
                        { $match: { createdAt: { $gte: startDate } } },
                        { $group: { _id: "$category", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    difficultyStats: [
                        { $match: { createdAt: { $gte: startDate } } },
                        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
                    ],
                    popularQuizzes: [
                        { $match: { createdAt: { $gte: startDate } } },
                        { $sort: { "stats.totalAttempts": -1 } },
                        { $limit: 5 },
                        { $project: { title: 1, category: 1, "stats.totalAttempts": 1 } }
                    ]
                }
            }
        ]);

        // Get submission analytics
        const submissionAnalytics = await Submission.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $facet: {
                    totalSubmissions: [
                        { $count: "count" }
                    ],
                    averageScore: [
                        { $group: { _id: null, avgScore: { $avg: "$percentage" } } }
                    ],
                    dailySubmissions: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    month: { $month: "$createdAt" },
                                    day: { $dayOfMonth: "$createdAt" }
                                },
                                count: { $sum: 1 },
                                avgScore: { $avg: "$percentage" }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                quiz: analytics[0],
                submissions: submissionAnalytics[0],
                timeframe
            }
        });

    } catch (error) {
        console.error('Get quiz analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
};

// @desc    Generate a new quiz
// @route   POST /api/quiz/generate
// @access  Private
const generateQuiz = async (req, res) => {
  try {
    console.log('Generate quiz request:', req.body);
    const { category, difficulty, type, amount, timeLimit, title } = req.body;

    // Validate inputs
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // Fetch questions from Trivia DB
    const questions = await quizApiService.generateQuiz({
      category: parseInt(category),
      difficulty: difficulty || 'mixed',
      type: type || 'multiple',
      amount: parseInt(amount) || 10
    });

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions available for selected criteria'
      });
    }

    // Get category name for quiz
    const categories = await quizApiService.getCategories();
    const categoryInfo = categories.find(cat => cat.id === parseInt(category));
    const categoryName = categoryInfo ? categoryInfo.name : 'General Knowledge';

    // Create quiz
    const quiz = await Quiz.create({
      title: title || `${categoryName} Quiz`,
      description: `A ${difficulty || 'mixed'} difficulty quiz on ${categoryName}`,
      category: categoryName,
      difficulty: difficulty || 'mixed',
      type: type || 'multiple',
      totalQuestions: questions.length,
      timeLimit: timeLimit || 30,
      questions,
      createdBy: req.user.id,
      settings: {
        showCorrectAnswers: true,
        randomizeQuestions: true,
        randomizeAnswers: true,
        allowRetake: true
      }
    });

    // Return sanitized quiz (without correct answers)
    const sanitizedQuiz = await Quiz.findById(quiz._id)
      .select('-questions.correctAnswer')
      .populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        quiz: sanitizedQuiz
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating quiz'
    });
  }
};

// @desc    Get a quiz by ID
// @route   GET /api/quiz/:id
// @access  Public
const getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'username firstName lastName')
            .select('-questions.correctAnswer'); // Don't send correct answers

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (!quiz.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Quiz is not active'
            });
        }

        // Remove correct answers from questions for security
        const sanitizedQuiz = {
            ...quiz.toObject(),
            questions: quiz.questions.map(question => ({
                questionId: question.questionId,
                question: question.question,
                type: question.type,
                difficulty: question.difficulty,
                category: question.category,
                allAnswers: question.allAnswers,
                points: question.points
            }))
        };

        res.status(200).json({
            success: true,
            data: sanitizedQuiz
        });

    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz'
        });
    }
};

// @desc    Submit quiz answers
// @route   POST /api/quiz/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
    try {
        const { answers, timeTaken, startTime } = req.body;
        const quizId = req.params.id;

        // Validate input
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid answers format'
            });
        }

        if (!timeTaken || timeTaken < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time taken'
            });
        }

        // Get quiz with correct answers
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (!quiz.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Quiz is not active'
            });
        }

        // Check if user has already submitted (if retake is not allowed)
        if (!quiz.settings.allowRetake) {
            const existingSubmission = await Submission.findOne({
                user: req.user.id,
                quiz: quizId
            });

            if (existingSubmission) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already submitted this quiz'
                });
            }
        }

        // Process answers and calculate score
        const processedAnswers = [];
        let totalScore = 0;
        let totalMarks = 0;

        quiz.questions.forEach(question => {
            const userAnswer = answers.find(ans => ans.questionId === question.questionId);
            const isCorrect = userAnswer && userAnswer.answer === question.correctAnswer;
            
            totalMarks += question.points;
            if (isCorrect) {
                totalScore += question.points;
            }

            processedAnswers.push({
                questionId: question.questionId,
                userAnswer: userAnswer ? userAnswer.answer : '',
                correctAnswer: question.correctAnswer,
                isCorrect,
                points: question.points,
                timeSpent: userAnswer ? userAnswer.timeSpent || 0 : 0
            });
        });

        // Create submission
        const submission = await Submission.create({
            user: req.user.id,
            quiz: quizId,
            answers: processedAnswers,
            score: totalScore,
            totalMarks,
            timeTaken,
            timeLimit: quiz.timeLimit * 60, // Convert to seconds
            startTime: startTime ? new Date(startTime) : new Date(Date.now() - timeTaken * 1000),
            endTime: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Update user and quiz stats
        const user = await User.findById(req.user.id);
        await user.updateStats(totalScore, totalMarks);
        await quiz.updateStats(totalScore, totalMarks);

        // Generate performance insights
        const insights = submission.getPerformanceInsights();

        // Prepare response data
        const responseData = {
            submissionId: submission._id,
            score: totalScore,
            totalMarks,
            percentage: submission.percentage,
            correctAnswers: submission.correctAnswers,
            incorrectAnswers: submission.incorrectAnswers,
            skippedAnswers: submission.skippedAnswers,
            timeTaken,
            grade: submission.grade,
            performance: submission.performance,
            insights,
            answers: processedAnswers
        };

        // Send result email if user has notifications enabled
        if (user.preferences.emailNotifications) {
            emailService.sendQuizResults(user, submission, quiz)
                .then(result => {
                    if (result.success) {
                        submission.emailSent = true;
                        submission.emailSentAt = new Date();
                        submission.save();
                    }
                })
                .catch(err => console.error('Email sending failed:', err));
        }

        res.status(201).json({
            success: true,
            message: 'Quiz submitted successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting quiz'
        });
    }
};

// @desc    Get user's quiz submissions
// @route   GET /api/quiz/submissions
// @access  Private
const getUserSubmissions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            minScore,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { user: req.user.id };
        
        // Add filters
        if (category) {
            query['quiz.category'] = new RegExp(category, 'i');
        }
        if (minScore) {
            query.percentage = { $gte: parseInt(minScore) };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Get submissions with populated quiz data
        const submissions = await Submission.find(query)
            .populate({
                path: 'quiz',
                select: 'title category difficulty totalQuestions timeLimit'
            })
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const total = await Submission.countDocuments(query);

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.status(200).json({
            success: true,
            count: submissions.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                hasNextPage,
                hasPrevPage
            },
            data: submissions
        });

    } catch (error) {
        console.error('Get user submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submissions'
        });
    }
};

// @desc    Get submission details
// @route   GET /api/quiz/submission/:id
// @access  Private
const getSubmissionDetails = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate({
                path: 'quiz',
                select: 'title category difficulty totalQuestions timeLimit settings'
            })
            .populate('user', 'username email firstName lastName');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Check if user owns this submission or is admin
        if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get performance insights
        const insights = submission.getPerformanceInsights();

        res.status(200).json({
            success: true,
            data: {
                ...submission.toObject(),
                insights
            }
        });

    } catch (error) {
        console.error('Get submission details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submission details'
        });
    }
};

// @desc    Get quiz leaderboard
// @route   GET /api/quiz/:id/leaderboard
// @access  Public
const getQuizLeaderboard = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const quizId = req.params.id;

        // Get top submissions for this quiz
        const leaderboard = await Submission.find({ quiz: quizId })
            .populate('user', 'username firstName lastName avatar')
            .select('user score totalMarks percentage timeTaken createdAt grade')
            .sort({ percentage: -1, timeTaken: 1 }) // Best percentage, then fastest time
            .limit(parseInt(limit));

        // Add ranking
        const rankedLeaderboard = leaderboard.map((submission, index) => ({
            rank: index + 1,
            user: {
                username: submission.user.username,
                fullName: `${submission.user.firstName || ''} ${submission.user.lastName || ''}`.trim(),
                avatar: submission.user.avatar
            },
            score: submission.score,
            totalMarks: submission.totalMarks,
            percentage: submission.percentage,
            timeTaken: submission.timeTaken,
            grade: submission.grade,
            completedAt: submission.createdAt
        }));

        res.status(200).json({
            success: true,
            count: rankedLeaderboard.length,
            data: rankedLeaderboard
        });

    } catch (error) {
        console.error('Get quiz leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard'
        });
    }
};

// @desc    Get quiz statistics
// @route   GET /api/quiz/:id/stats
// @access  Public
const getQuizStats = async (req, res) => {
    try {
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Get detailed stats from submissions
        const stats = await Submission.getQuizStats(quizId);
        
        res.status(200).json({
            success: true,
            data: {
                quizInfo: {
                    title: quiz.title,
                    category: quiz.category,
                    difficulty: quiz.difficulty,
                    totalQuestions: quiz.totalQuestions,
                    totalMarks: quiz.totalMarks,
                    timeLimit: quiz.timeLimit
                },
                basicStats: quiz.stats,
                detailedStats: stats[0] || {
                    totalAttempts: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    averageTime: 0
                }
            }
        });

    } catch (error) {
        console.error('Get quiz stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz statistics'
        });
    }   
}

module.exports = {
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
};
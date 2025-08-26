const aiHintsService = require('../services/aiHintsService');

/**
 * Generate a hint for a question
 */
const generateHint = async (req, res) => {
    try {
        const { question, category, difficulty, correctAnswer } = req.body;

        if (!question || !category || !difficulty || !correctAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: question, category, difficulty, correctAnswer'
            });
        }

        const hint = await aiHintsService.generateHint(question, category, difficulty, correctAnswer);

        res.json({
            success: true,
            data: hint
        });
    } catch (error) {
        console.error('Generate hint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate hint'
        });
    }
};

/**
 * Generate multiple hints for a question
 */
const generateMultipleHints = async (req, res) => {
    try {
        const { question, category, difficulty, correctAnswer, count = 3 } = req.body;

        if (!question || !category || !difficulty || !correctAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: question, category, difficulty, correctAnswer'
            });
        }

        const hints = await aiHintsService.generateMultipleHints(question, category, difficulty, correctAnswer, count);

        res.json({
            success: true,
            data: hints
        });
    } catch (error) {
        console.error('Generate multiple hints error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate hints'
        });
    }
};

/**
 * Generate study suggestions
 */
const generateStudySuggestions = async (req, res) => {
    try {
        const { question, category, difficulty, userAnswer, isCorrect } = req.body;

        if (!question || !category || !difficulty || userAnswer === undefined || isCorrect === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: question, category, difficulty, userAnswer, isCorrect'
            });
        }

        const suggestions = await aiHintsService.generateStudySuggestions(question, category, difficulty, userAnswer, isCorrect);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Generate study suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate study suggestions'
        });
    }
};

/**
 * Generate explanation for answer
 */
const generateExplanation = async (req, res) => {
    try {
        const { question, correctAnswer, userAnswer, isCorrect } = req.body;

        if (!question || !correctAnswer || userAnswer === undefined || isCorrect === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: question, correctAnswer, userAnswer, isCorrect'
            });
        }

        const explanation = await aiHintsService.generateExplanation(question, correctAnswer, userAnswer, isCorrect);

        res.json({
            success: true,
            data: explanation
        });
    } catch (error) {
        console.error('Generate explanation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate explanation'
        });
    }
};

/**
 * Check AI service availability
 */
const checkAvailability = async (req, res) => {
    try {
        const isAvailable = aiHintsService.isAvailable();

        res.json({
            success: true,
            data: {
                available: isAvailable,
                message: isAvailable ? 'AI service is available' : 'AI service is not configured'
            }
        });
    } catch (error) {
        console.error('Check AI availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check AI service availability'
        });
    }
};

/**
 * Generate comprehensive feedback for a quiz attempt
 */
const generateQuizFeedback = async (req, res) => {
    try {
        const { answers, quizData } = req.body;

        if (!answers || !Array.isArray(answers) || !quizData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: answers (array), quizData'
            });
        }

        const feedback = {
            overall: {
                correctAnswers: 0,
                incorrectAnswers: 0,
                skippedAnswers: 0,
                totalQuestions: answers.length,
                percentage: 0
            },
            questionFeedback: [],
            studySuggestions: [],
            generalAdvice: ''
        };

        // Process each answer
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const question = quizData.questions[i];

            if (!answer.userAnswer) {
                feedback.overall.skippedAnswers++;
                feedback.questionFeedback.push({
                    questionIndex: i,
                    question: question.question,
                    status: 'skipped',
                    feedback: 'You skipped this question. Consider attempting all questions even if unsure.',
                    suggestion: await aiHintsService.generateStudySuggestions(
                        question.question,
                        quizData.category,
                        quizData.difficulty,
                        'skipped',
                        false
                    )
                });
            } else {
                const isCorrect = answer.userAnswer === answer.correctAnswer;
                
                if (isCorrect) {
                    feedback.overall.correctAnswers++;
                } else {
                    feedback.overall.incorrectAnswers++;
                }

                const explanation = await aiHintsService.generateExplanation(
                    question.question,
                    answer.correctAnswer,
                    answer.userAnswer,
                    isCorrect
                );

                const suggestion = await aiHintsService.generateStudySuggestions(
                    question.question,
                    quizData.category,
                    quizData.difficulty,
                    answer.userAnswer,
                    isCorrect
                );

                feedback.questionFeedback.push({
                    questionIndex: i,
                    question: question.question,
                    status: isCorrect ? 'correct' : 'incorrect',
                    userAnswer: answer.userAnswer,
                    correctAnswer: answer.correctAnswer,
                    explanation: explanation.explanation,
                    suggestion: suggestion.suggestions
                });
            }
        }

        // Calculate overall percentage
        feedback.overall.percentage = Math.round((feedback.overall.correctAnswers / feedback.overall.totalQuestions) * 100);

        // Generate overall study suggestions
        const overallSuggestion = await aiHintsService.generateStudySuggestions(
            `Quiz on ${quizData.category}`,
            quizData.category,
            quizData.difficulty,
            `${feedback.overall.correctAnswers}/${feedback.overall.totalQuestions}`,
            feedback.overall.percentage >= 70
        );

        feedback.generalAdvice = overallSuggestion.suggestions;

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Generate quiz feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate quiz feedback'
        });
    }
};

module.exports = {
    generateHint,
    generateMultipleHints,
    generateStudySuggestions,
    generateExplanation,
    checkAvailability,
    generateQuizFeedback
};

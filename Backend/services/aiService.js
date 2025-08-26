class AIService {
    constructor() {
        // Configuration for different quiz APIs
        this.apiConfigs = {
            opentdb: {
                baseUrl: 'https://opentdb.com/api.php',
                categories: {
                    mathematics: 19,
                    science: 17,
                    general: 9,
                    history: 23,
                    geography: 22
                }
            },
            quizapi: {
                baseUrl: 'https://quizapi.io/api/v1/questions',
                apiKey: process.env.QUIZ_API_KEY, // Set your API key in environment variables
                categories: {
                    mathematics: 'Linux',
                    science: 'DevOps',
                    general: 'General Knowledge'
                }
            }
        };
        
        // Cache to store fetched questions and avoid duplicates
        this.questionCache = new Map();
        this.usedQuestions = new Set();
    }

    /**
     * Generate quiz using external API
     */
    async generateQuizWithAI(params) {
        const { subject, grade_level, num_questions, difficulty, time_limit, api_provider = 'opentdb' } = params;
        
        try {
            let questions = [];
            
            // Try to fetch from the specified API provider
            switch (api_provider.toLowerCase()) {
                case 'opentdb':
                    questions = await this.fetchFromOpenTDB(subject, num_questions, difficulty);
                    break;
                case 'quizapi':
                    questions = await this.fetchFromQuizAPI(subject, num_questions, difficulty);
                    break;
                case 'trivia':
                    questions = await this.fetchFromTriviaAPI(subject, num_questions, difficulty);
                    break;
                default:
                    // Fallback to OpenTDB if provider not recognized
                    questions = await this.fetchFromOpenTDB(subject, num_questions, difficulty);
            }

            // Ensure we have distinct questions
            questions = this.ensureDistinctQuestions(questions, num_questions, `${subject}_${difficulty}_${grade_level}`);
            
            const total_marks = questions.reduce((sum, q) => sum + q.marks, 0);

            return {
                title: `${subject} Quiz - Grade ${grade_level} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
                total_marks,
                questions,
                source_api: api_provider,
                generated_at: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error generating quiz:', error);
            // Fallback to mock data if API fails
            return this.generateFallbackQuiz(params);
        }
    }

    /**
     * Fetch questions from Open Trivia Database (OpenTDB)
     */
    async fetchFromOpenTDB(subject, num_questions, difficulty) {
        const category = this.apiConfigs.opentdb.categories[subject.toLowerCase()] || this.apiConfigs.opentdb.categories.general;
        
        // Map difficulty levels
        const difficultyMap = {
            easy: 'easy',
            medium: 'medium', 
            hard: 'hard'
        };

        const url = `${this.apiConfigs.opentdb.baseUrl}?amount=${Math.min(num_questions * 2, 50)}&category=${category}&difficulty=${difficultyMap[difficulty]}&type=multiple`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.response_code !== 0) {
            throw new Error(`OpenTDB API error: ${data.response_code}`);
        }

        return data.results.map((item, index) => ({
            id: this.generateQuestionId(item.question, index),
            question_text: this.decodeHtml(item.question),
            question_type: "multiple_choice",
            options: this.shuffleArray([...item.incorrect_answers, item.correct_answer].map(ans => this.decodeHtml(ans))),
            correct_answer: this.decodeHtml(item.correct_answer),
            explanation: `This is a ${item.difficulty} level question from ${item.category}.`,
            difficulty: item.difficulty,
            marks: this.getMarksForDifficulty(item.difficulty),
            category: item.category
        }));
    }

    /**
     * Fetch questions from QuizAPI.io
     */
    async fetchFromQuizAPI(subject, num_questions, difficulty) {
        if (!this.apiConfigs.quizapi.apiKey) {
            throw new Error('QuizAPI.io API key not configured');
        }

        const category = this.apiConfigs.quizapi.categories[subject.toLowerCase()] || 'General Knowledge';
        
        const url = `${this.apiConfigs.quizapi.baseUrl}?apiKey=${this.apiConfigs.quizapi.apiKey}&limit=${Math.min(num_questions * 2, 20)}&category=${encodeURIComponent(category)}&difficulty=${difficulty}`;
        
        const response = await fetch(url);
        const data = await response.json();

        return data.map((item, index) => ({
            id: this.generateQuestionId(item.question, index),
            question_text: item.question,
            question_type: "multiple_choice",
            options: Object.values(item.answers).filter(answer => answer !== null),
            correct_answer: Object.values(item.correct_answers)[0] === 'true' ? Object.values(item.answers)[0] : Object.values(item.answers)[1],
            explanation: item.explanation || `This is a ${difficulty} level question.`,
            difficulty: difficulty,
            marks: this.getMarksForDifficulty(difficulty),
            category: item.category
        }));
    }

    /**
     * Fetch questions from a generic Trivia API
     */
    async fetchFromTriviaAPI(subject, num_questions, difficulty) {
        // Example implementation for another API
        const url = `https://api.trivia.com/questions?subject=${subject}&count=${num_questions}&difficulty=${difficulty}`;
        
        const response = await fetch(url);
        const data = await response.json();

        return data.questions.map((item, index) => ({
            id: this.generateQuestionId(item.question, index),
            question_text: item.question,
            question_type: "multiple_choice",
            options: item.options,
            correct_answer: item.correct_answer,
            explanation: item.explanation || `This is a ${difficulty} level question.`,
            difficulty: difficulty,
            marks: this.getMarksForDifficulty(difficulty),
            category: subject
        }));
    }

    /**
     * Ensure distinct questions and avoid duplicates
     */
    ensureDistinctQuestions(questions, requiredCount, cacheKey) {
        // Get previously used questions for this cache key
        const usedQuestions = this.questionCache.get(cacheKey) || new Set();
        
        // Filter out duplicate questions
        const distinctQuestions = questions.filter(q => {
            const questionHash = this.hashQuestion(q.question_text);
            return !usedQuestions.has(questionHash);
        });

        // Take only the required number of questions
        const selectedQuestions = distinctQuestions.slice(0, requiredCount);
        
        // Update cache with used questions
        selectedQuestions.forEach(q => {
            usedQuestions.add(this.hashQuestion(q.question_text));
        });
        this.questionCache.set(cacheKey, usedQuestions);

        // If we don't have enough distinct questions, we might need to make another API call
        if (selectedQuestions.length < requiredCount) {
            console.warn(`Only ${selectedQuestions.length} distinct questions available out of ${requiredCount} requested`);
        }

        return selectedQuestions;
    }

    /**
     * Generate a hash for question text to check for duplicates
     */
    hashQuestion(questionText) {
        // Simple hash function for question text
        let hash = 0;
        for (let i = 0; i < questionText.length; i++) {
            const char = questionText.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    /**
     * Generate unique question ID
     */
    generateQuestionId(questionText, index) {
        return `q_${this.hashQuestion(questionText)}_${index}_${Date.now()}`;
    }

    /**
     * Get marks based on difficulty level
     */
    getMarksForDifficulty(difficulty) {
        const marksMap = {
            easy: 1,
            medium: 2,
            hard: 3
        };
        return marksMap[difficulty.toLowerCase()] || 1;
    }

    /**
     * Decode HTML entities
     */
    decodeHtml(html) {
        // Node.js compatible HTML decoding
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'",
            '&apos;': "'",
            '&nbsp;': ' ',
            '&copy;': '©',
            '&reg;': '®',
            '&trade;': '™'
        };
        
        return html.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
            return entities[match] || match;
        });
    }

    /**
     * Shuffle array for randomizing options
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Fallback quiz generation with mock data
     */
    generateFallbackQuiz(params) {
        console.log('Using fallback mock data due to API failure');
        
        const { subject, grade_level, num_questions, difficulty } = params;
        
        // Your original mock data here (abbreviated for space)
        const mockQuestions = [
            {
                id: `fallback_${Date.now()}`,
                question_text: "What is 5 + 3?",
                question_type: "multiple_choice",
                options: ["6", "7", "8", "9"],
                correct_answer: "8",
                explanation: "5 + 3 equals 8. This is basic addition.",
                difficulty: difficulty,
                marks: this.getMarksForDifficulty(difficulty)
            }
        ];

        // Repeat questions if needed
        const questions = Array(num_questions).fill().map((_, index) => ({
            ...mockQuestions[index % mockQuestions.length],
            id: `fallback_${Date.now()}_${index}`
        }));

        return {
            title: `${subject} Quiz - Grade ${grade_level} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}) - Fallback`,
            total_marks: questions.reduce((sum, q) => sum + q.marks, 0),
            questions,
            source_api: 'fallback',
            generated_at: new Date().toISOString()
        };
    }

    /**
     * Clear question cache for a specific key or all keys
     */
    clearQuestionCache(cacheKey = null) {
        if (cacheKey) {
            this.questionCache.delete(cacheKey);
        } else {
            this.questionCache.clear();
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            totalCacheKeys: this.questionCache.size,
            cacheKeys: Array.from(this.questionCache.keys()),
            totalCachedQuestions: Array.from(this.questionCache.values())
                .reduce((sum, set) => sum + set.size, 0)
        };
    }

    // Keep your existing evaluation methods...
    async evaluateQuizWithAI(params) {
        const { quiz, userAnswers } = params;
        const results = [];
        let totalScore = 0;
        let correctAnswers = 0;

        const answerMap = {};
        userAnswers.forEach(answer => {
            answerMap[answer.question_id] = answer.answer;
        });

        quiz.questions.forEach(question => {
            const userAnswer = answerMap[question.id];
            const isCorrect = userAnswer && userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
            
            if (isCorrect) {
                totalScore += question.marks;
                correctAnswers++;
            }

            results.push({
                question_id: question.id,
                question_text: question.question_text,
                user_answer: userAnswer || '',
                correct_answer: question.correct_answer,
                is_correct: isCorrect,
                marks_awarded: isCorrect ? question.marks : 0,
                explanation: question.explanation
            });
        });

        const percentage = (totalScore / quiz.total_marks) * 100;
        
        let feedback = '';
        if (percentage >= 90) {
            feedback = 'Excellent work! You have a strong understanding of the material.';
        } else if (percentage >= 70) {
            feedback = 'Good job! You understand most concepts well, but there\'s room for improvement.';
        } else if (percentage >= 50) {
            feedback = 'Fair performance. Consider reviewing the topics you struggled with.';
        } else {
            feedback = 'You may want to spend more time studying this material before attempting again.';
        }

        return {
            total_score: totalScore,
            percentage: Math.round(percentage * 100) / 100,
            results,
            feedback,
            source_api: quiz.source_api || 'unknown'
        };
    }

    async getAIHint(question) {
        const hints = [
            "Think about the basic principles involved in this question.",
            "Break down the problem into smaller steps.",
            "Consider what you know about this topic and apply it systematically.",
            "Look for keywords in the question that might guide you to the answer.",
            "Try to eliminate obviously incorrect options first."
        ];

        const questionText = question.question_text.toLowerCase();
        
        if (questionText.includes('calculate') || questionText.includes('solve')) {
            return "Start by identifying what you need to find and what information you're given.";
        } else if (questionText.includes('derivative')) {
            return "Remember the power rule: d/dx(x^n) = n*x^(n-1)";
        } else if (questionText.includes('photosynthesis')) {
            return "Think about what plants need to make their food from sunlight.";
        } else if (questionText.includes('formula')) {
            return "Consider the elements involved and their typical ratios.";
        }

        return hints[Math.floor(Math.random() * hints.length)];
    }

    async getAIImprovement(params) {
        const { quiz, userAnswers, evaluation } = params;
        const suggestions = [];

        const incorrectAnswers = evaluation.filter(result => !result.is_correct);
        const percentage = (evaluation.filter(result => result.is_correct).length / evaluation.length) * 100;

        if (incorrectAnswers.length > 0) {
            const topics = new Set();
            incorrectAnswers.forEach(result => {
                if (result.question_text.includes('derivative')) topics.add('calculus');
                if (result.question_text.includes('photosynthesis')) topics.add('biology');
                if (result.question_text.includes('+') || result.question_text.includes('-')) topics.add('arithmetic');
                if (result.question_text.includes('×') || result.question_text.includes('÷')) topics.add('multiplication/division');
            });

            if (topics.has('calculus')) {
                suggestions.push("Review calculus fundamentals, particularly differentiation rules and their applications.");
            }
            if (topics.has('biology')) {
                suggestions.push("Study plant biology concepts, especially photosynthesis and cellular processes.");
            }
            if (topics.has('arithmetic')) {
                suggestions.push("Practice basic arithmetic operations to improve accuracy and speed.");
            }
        }

        if (percentage < 50) {
            suggestions.push("Consider reviewing the entire topic systematically before attempting more quizzes.");
        } else if (percentage < 70) {
            suggestions.push("Focus on the specific areas where you made mistakes and practice similar problems.");
        }

        if (suggestions.length < 2) {
            suggestions.push("Take your time reading each question carefully before selecting an answer.");
            if (suggestions.length < 2) {
                suggestions.push("Regular practice with similar questions will help improve your performance.");
            }
        }

        return suggestions.slice(0, 2);
    }
}

// Export singleton instance
module.exports = new AIService();
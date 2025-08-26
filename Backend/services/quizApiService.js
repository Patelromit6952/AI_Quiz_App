const axios = require('axios');

class QuizApiService {
    constructor() {
        this.baseURL = 'https://opentdb.com/api.php';
        this.categoriesURL = 'https://opentdb.com/api_category.php';
    }

    // Fetch categories from OpenTrivia DB
    async getCategories() {
        try {
            console.log('Fetching categories from OpenTrivia DB...');
            const response = await axios.get(this.categoriesURL);
            if (response.data && response.data.trivia_categories) {
                return response.data.trivia_categories;
            }
            throw new Error('Invalid response from categories API');
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Generate quiz questions
    async generateQuiz(params) {
        try {
            console.log('Generating quiz with params:', params);
            const queryParams = new URLSearchParams({
                amount: params.amount || 10,
                category: params.category,
                difficulty: params.difficulty !== 'mixed' ? params.difficulty : '',
                type: params.type !== 'mixed' ? params.type : ''
            });

            const url = `${this.baseURL}?${queryParams.toString()}`;
            console.log('Fetching from URL:', url);

            const response = await axios.get(url);
            
            if (response.data.response_code !== 0) {
                throw new Error(this.getResponseCodeMessage(response.data.response_code));
            }

            return this.processQuestions(response.data.results);
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw error;
        }
    }

    // Process and clean questions
    processQuestions(questions) {
        return questions.map(question => ({
            questionId: this.generateQuestionId(),
            question: this.decodeHtml(question.question),
            type: question.type,
            difficulty: question.difficulty,
            category: this.decodeHtml(question.category),
            correctAnswer: this.decodeHtml(question.correct_answer),
            incorrectAnswers: question.incorrect_answers.map(answer => this.decodeHtml(answer)),
            allAnswers: this.shuffleArray([
                question.correct_answer,
                ...question.incorrect_answers
            ]).map(answer => this.decodeHtml(answer)),
            points: this.calculatePoints(question.difficulty, question.type)
        }));
    }

    // Generate unique question ID
    generateQuestionId() {
        return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Decode HTML entities
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

    // Calculate points based on difficulty and type
    calculatePoints(difficulty, type) {
        let points = 1;
        if (difficulty === 'medium') points = 2;
        if (difficulty === 'hard') points = 3;
        if (type === 'multiple') points += 1;
        return points;
    }

    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get response code message
    getResponseCodeMessage(code) {
        const messages = {
            1: 'No results found for these parameters. Try adjusting your criteria.',
            2: 'Invalid parameter in request',
            3: 'Session token not found',
            4: 'Session token has returned all possible questions',
            5: 'Rate limit exceeded'
        };
        return messages[code] || 'Unknown error occurred';
    }
}

module.exports = new QuizApiService();
const axios = require('axios');

class AIHintsService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
    }

    /**
     * Generate a hint for a specific question
     */
    async generateHint(question, category, difficulty, correctAnswer) {
        try {
            const prompt = this.buildHintPrompt(question, category, difficulty, correctAnswer);
            
            const response = await axios.post(this.baseURL, {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert educational assistant. Provide helpful, educational hints that guide students toward the correct answer without giving it away directly. Make hints engaging and encouraging."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                hint: response.data.choices[0].message.content.trim(),
                type: 'ai_generated'
            };
        } catch (error) {
            console.error('AI Hint generation error:', error);
            return {
                success: false,
                hint: this.getFallbackHint(category, difficulty),
                type: 'fallback'
            };
        }
    }

    /**
     * Generate multiple hints for a question
     */
    async generateMultipleHints(question, category, difficulty, correctAnswer, count = 3) {
        try {
            const hints = [];
            
            for (let i = 0; i < count; i++) {
                const hintLevel = i === 0 ? 'subtle' : i === 1 ? 'moderate' : 'strong';
                const hint = await this.generateHint(question, category, difficulty, correctAnswer, hintLevel);
                if (hint.success) {
                    hints.push({
                        level: hintLevel,
                        text: hint.hint,
                        type: hint.type
                    });
                }
            }

            return {
                success: true,
                hints
            };
        } catch (error) {
            console.error('Multiple hints generation error:', error);
            return {
                success: false,
                hints: this.getFallbackHints(category, difficulty)
            };
        }
    }

    /**
     * Generate study suggestions based on question content
     */
    async generateStudySuggestions(question, category, difficulty, userAnswer, isCorrect) {
        try {
            const prompt = this.buildStudyPrompt(question, category, difficulty, userAnswer, isCorrect);
            
            const response = await axios.post(this.baseURL, {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert educational tutor. Provide personalized study suggestions and learning resources based on the student's performance. Be encouraging and specific."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.8
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                suggestions: response.data.choices[0].message.content.trim(),
                type: 'ai_generated'
            };
        } catch (error) {
            console.error('Study suggestions generation error:', error);
            return {
                success: false,
                suggestions: this.getFallbackStudySuggestions(category, isCorrect),
                type: 'fallback'
            };
        }
    }

    /**
     * Generate explanation for why an answer is correct/incorrect
     */
    async generateExplanation(question, correctAnswer, userAnswer, isCorrect) {
        try {
            const prompt = this.buildExplanationPrompt(question, correctAnswer, userAnswer, isCorrect);
            
            const response = await axios.post(this.baseURL, {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert educator. Provide clear, educational explanations for why answers are correct or incorrect. Help students understand the concepts."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 250,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                explanation: response.data.choices[0].message.content.trim(),
                type: 'ai_generated'
            };
        } catch (error) {
            console.error('Explanation generation error:', error);
            return {
                success: false,
                explanation: this.getFallbackExplanation(isCorrect),
                type: 'fallback'
            };
        }
    }

    /**
     * Build prompt for hint generation
     */
    buildHintPrompt(question, category, difficulty, correctAnswer, hintLevel = 'moderate') {
        const levelDescriptions = {
            subtle: 'very subtle hint that gently guides without revealing much',
            moderate: 'moderate hint that provides helpful direction',
            strong: 'stronger hint that gives more specific guidance'
        };

        return `Generate a ${levelDescriptions[hintLevel]} for this ${difficulty} level ${category} question:

Question: ${question}
Correct Answer: ${correctAnswer}

Provide a ${hintLevel} hint that helps the student think about the answer without giving it away. Make it educational and encouraging.`;
    }

    /**
     * Build prompt for study suggestions
     */
    buildStudyPrompt(question, category, difficulty, userAnswer, isCorrect) {
        const performance = isCorrect ? 'correctly' : 'incorrectly';
        
        return `The student answered this ${difficulty} level ${category} question ${performance}:

Question: ${question}
Student's Answer: ${userAnswer}

Provide 2-3 specific study suggestions and learning resources to help improve understanding of this topic. Be encouraging and actionable.`;
    }

    /**
     * Build prompt for explanation
     */
    buildExplanationPrompt(question, correctAnswer, userAnswer, isCorrect) {
        const context = isCorrect 
            ? 'The student answered correctly. Explain why this answer is right and reinforce the concept.'
            : 'The student answered incorrectly. Explain why the correct answer is right and help clarify the concept.';

        return `Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

${context}

Provide a clear, educational explanation that helps the student understand the concept.`;
    }

    /**
     * Fallback hints when AI is unavailable
     */
    getFallbackHint(category, difficulty) {
        const hints = {
            general: {
                easy: "Think about the basic concepts in this field.",
                medium: "Consider the key principles that apply here.",
                hard: "This requires deeper understanding of the topic."
            },
            science: {
                easy: "Remember the fundamental scientific principles.",
                medium: "Consider the scientific method and evidence.",
                hard: "This involves advanced scientific concepts."
            },
            history: {
                easy: "Think about the time period and context.",
                medium: "Consider the historical significance and events.",
                hard: "This requires detailed historical knowledge."
            },
            geography: {
                easy: "Think about location and physical features.",
                medium: "Consider geographical patterns and relationships.",
                hard: "This involves complex geographical concepts."
            }
        };

        const categoryHints = hints[category] || hints.general;
        return categoryHints[difficulty] || categoryHints.medium;
    }

    /**
     * Fallback multiple hints
     */
    getFallbackHints(category, difficulty) {
        return [
            {
                level: 'subtle',
                text: this.getFallbackHint(category, difficulty),
                type: 'fallback'
            },
            {
                level: 'moderate',
                text: `Consider the main concepts in ${category}.`,
                type: 'fallback'
            },
            {
                level: 'strong',
                text: `Review the key principles related to this topic.`,
                type: 'fallback'
            }
        ];
    }

    /**
     * Fallback study suggestions
     */
    getFallbackStudySuggestions(category, isCorrect) {
        const suggestions = isCorrect 
            ? `Great job! To further improve your understanding of ${category}, consider reviewing related topics and practicing with more challenging questions.`
            : `To improve your ${category} knowledge, review the basic concepts, practice with similar questions, and consider using study resources.`;

        return suggestions;
    }

    /**
     * Fallback explanation
     */
    getFallbackExplanation(isCorrect) {
        return isCorrect 
            ? "Your answer is correct! You demonstrated good understanding of the concept."
            : "The correct answer was different. Review the topic to better understand the concept.";
    }

    /**
     * Check if AI service is available
     */
    isAvailable() {
        return !!this.apiKey;
    }
}

module.exports = new AIHintsService();

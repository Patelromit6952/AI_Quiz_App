import { createContext, useContext, useState } from 'react';
import apiService from '../services/apiService';

const QuizContext = createContext(null);

export const QuizProvider = ({ children }) => {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const startQuiz = async (quizId) => {
        setLoading(true);
        try {
            const response = await apiService.getQuizById(quizId);
            setActiveQuiz(response.data);
            return response.data;
        } catch (error) {
            console.error('Error starting quiz:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = async (answers) => {
        setLoading(true);
        try {
            const response = await apiService.submitQuiz(activeQuiz.id, answers);
            setQuizResult(response.data);
            return response.data;
        } catch (error) {
            console.error('Error submitting quiz:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setActiveQuiz(null);
        setQuizResult(null);
    };

    return (
        <QuizContext.Provider value={{
            activeQuiz,
            quizResult,
            loading,
            startQuiz,
            submitQuiz,
            resetQuiz
        }}>
            {children}
        </QuizContext.Provider>
    );
};

export const useQuizContext = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuizContext must be used within a QuizProvider');
    }
    return context;
};

import { useState } from 'react';
import apiService from '../services/apiService';

const useQuiz = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);

    const startQuiz = async (quizId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getQuizById(quizId);
            setCurrentQuiz(response.data);
            return response;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = async (quizId, answers) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.submitQuiz(quizId, answers);
            return response;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        currentQuiz,
        startQuiz,
        submitQuiz
    };
};

export default useQuiz;

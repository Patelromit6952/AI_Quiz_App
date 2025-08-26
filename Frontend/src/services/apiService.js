import axios from 'axios';

const API_URL = 'https://ai-quiz-app-ew0j.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 5000 // 5 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            return Promise.reject({
                success: false,
                message: 'Unable to connect to server. Please check your internet connection.',
                error: 'Network Error'
            });
        }
        
        return Promise.reject({
            success: false,
            message: error.response?.data?.message || 'An error occurred',
            error: error.response?.data || error.message
        });
    }
);

const apiService = {
    // Auth endpoints
    login: async (credentials) => {
        try {
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            const response = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password
            });

            // Backend returns: { success: true, user: {...}, token: "...", message: "..." }
            if (response.success && response.token && response.user) {
                return {
                    success: true,
                    user: response.user,
                    token: response.token,
                    message: response.message
                };
            }

            return response;
        } catch (error) {
            console.error('Login error details:', error);
            throw {
                success: false,
                message: error.message || 'Login failed',
                error: error.error || 'Authentication failed'
            };
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName || '',
                lastName: userData.lastName || ''
            });

            // Backend returns: { success: true, user: {...}, token: "...", message: "..." }
            if (response.success && response.token && response.user) {
                return {
                    success: true,
                    user: response.user,
                    token: response.token,
                    message: response.message
                };
            }

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw {
                success: false,
                message: error.message || 'Registration failed'
            };
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/auth/me');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Quiz endpoints
    getQuizzes: async (params) => {
        try {
            const response = await api.get('/quiz/public', { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get quizzes error:', error);
            throw error;
        }
    },

    getUserCreatedQuizzes: async () => {
        try {
            const response = await api.get('/quiz/user/created');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get user created quizzes error:', error);
            throw error;
        }
    },

    getUserSubmissions: async () => {
        try {
            const response = await api.get('/quiz/user/submissions');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get user submissions error:', error);
            throw error;
        }
    },

    deleteQuiz: async (quizId) => {
        try {
            await api.delete(`/quiz/${quizId}`);
            return { success: true };
        } catch (error) {
            console.error('Delete quiz error:', error);
            throw error;
        }
    },

    generateQuiz: async (config) => {
        try {
            const response = await api.post('/quiz/generate', {
                title: config.title || `${config.category} Quiz`,
                category: config.category,
                difficulty: config.difficulty,
                type: config.type,
                amount: config.amount,
                timeLimit: config.timeLimit
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to generate quiz');
            }

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Quiz generation error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to generate quiz'
            };
        }
    },

    getCategories: async () => {
        try {
            const response = await api.get('/quiz/categories');
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data
                };
            }

            throw new Error(response.message || 'Failed to fetch categories');
        } catch (error) {
            console.error('Get categories error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to fetch categories'
            };
        }
    },

    getQuizByCategory: async (params) => {
        try {
            const response = await api.get('/quiz/public', { params });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Get quiz error:', error);
            throw { success: false, message: 'Failed to fetch quiz' };
        }
    },

    // Leaderboard endpoints
    getLeaderboard: async (params) => {
        try {
            const response = await api.get('/leaderboard', { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to fetch leaderboard'
            };
        }
    },

    getUserRank: async () => {
        try {
            const response = await api.get('/leaderboard/user/rank');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get user rank error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to fetch user rank'
            };
        }
    },

    getUserAchievements: async () => {
        try {
            const response = await api.get('/leaderboard/user/achievements');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get user achievements error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to fetch achievements'
            };
        }
    },

    getLeaderboardStats: async () => {
        try {
            const response = await api.get('/leaderboard/stats');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get leaderboard stats error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to fetch leaderboard statistics'
            };
        }
    },

    getCategoryLeaderboard: async (category, params) => {
        try {
            const response = await api.get(`/leaderboard/category/${category}`, { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get category leaderboard error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to fetch category leaderboard'
            };
        }
    },

    // AI Hints endpoints
    generateHint: async (data) => {
        try {
            const response = await api.post('/ai-hints/hint', data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Generate hint error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to generate hint'
            };
        }
    },

    generateMultipleHints: async (data) => {
        try {
            const response = await api.post('/ai-hints/hints', data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Generate multiple hints error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to generate hints'
            };
        }
    },

    generateStudySuggestions: async (data) => {
        try {
            const response = await api.post('/ai-hints/study-suggestions', data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Generate study suggestions error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to generate study suggestions'
            };
        }
    },

    generateExplanation: async (data) => {
        try {
            const response = await api.post('/ai-hints/explanation', data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Generate explanation error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to generate explanation'
            };
        }
    },

    checkAIAvailability: async () => {
        try {
            const response = await api.get('/ai-hints/availability');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Check AI availability error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to check AI availability'
            };
        }
    },

    generateQuizFeedback: async (data) => {
        try {
            const response = await api.post('/ai-hints/quiz-feedback', data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Generate quiz feedback error:', error);
            throw {
                success: false,
                message: error.message || 'Failed to generate quiz feedback'
            };
        }
    }
};

export default apiService;

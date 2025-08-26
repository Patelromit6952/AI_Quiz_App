import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const QuizGenerator = () => {
  const navigate = useNavigate();

  const [categories] = useState([
    { id: 9, name: 'General Knowledge' },
    { id: 18, name: 'Science: Computers' },
    { id: 19, name: 'Science: Mathematics' },
    { id: 21, name: 'Sports' },
    { id: 23, name: 'History' }
  ]);

  const [quizConfig, setQuizConfig] = useState({
    title: '',
    category: '',
    difficulty: 'mixed',
    type: 'multiple',
    amount: 10,
    timeLimit: 30
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    
    try {
      if (!quizConfig.category) {
        throw new Error('Please select a category');
      }

      const response = await apiService.generateQuiz({
        title: quizConfig.title,
        category: parseInt(quizConfig.category),
        difficulty: quizConfig.difficulty === 'mixed' ? null : quizConfig.difficulty,
        type: quizConfig.type === 'mixed' ? null : quizConfig.type,
        amount: parseInt(quizConfig.amount),
        timeLimit: parseInt(quizConfig.timeLimit)
      });

      if (response.success && response.data.quiz) {
        console.log('Quiz generated:', response.data.quiz);
        navigate(`/quiz/${response.data.quiz._id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.message || 'Failed to generate quiz');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generate Quiz</h1>
          <p className="text-gray-600 mt-1">Create custom quizzes with AI-powered questions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizConfig.title}
                onChange={(e) => setQuizConfig({...quizConfig, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quiz title (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={quizConfig.category}
                  onChange={(e) => setQuizConfig({...quizConfig, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={quizConfig.difficulty}
                  onChange={(e) => setQuizConfig({...quizConfig, difficulty: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={quizConfig.type}
                  onChange={(e) => setQuizConfig({...quizConfig, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mixed">Mixed</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="boolean">True/False</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={quizConfig.amount}
                  onChange={(e) => setQuizConfig({...quizConfig, amount: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={quizConfig.timeLimit}
                onChange={(e) => setQuizConfig({...quizConfig, timeLimit: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Quiz Preview</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Category:</strong> {categories.find(c => c.id.toString() === quizConfig.category)?.name || 'Not selected'}</p>
                <p><strong>Difficulty:</strong> {quizConfig.difficulty}</p>
                <p><strong>Questions:</strong> {quizConfig.amount}</p>
                <p><strong>Time Limit:</strong> {quizConfig.timeLimit} minutes</p>
                <p><strong>Type:</strong> {quizConfig.type === 'mixed' ? 'Mixed' : quizConfig.type === 'multiple' ? 'Multiple Choice' : 'True/False'}</p>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm mt-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating || !quizConfig.category}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Generate Quiz
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;

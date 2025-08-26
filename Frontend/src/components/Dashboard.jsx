import { useState, useEffect } from 'react';
import { Book, Target, Trophy, Award, Plus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSubmissions();
  }, []);

  const fetchRecentSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserSubmissions({ limit: 3 });
      if (response.success) {
        setRecentSubmissions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatsCard = (title, value, Icon, bgColor, textColor) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">Ready to challenge yourself today?</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Take Quiz
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatsCard('Total Quizzes', user.stats.totalQuizzes, Book, 'bg-blue-100', 'text-blue-600')}
        {renderStatsCard('Average Score', `${user.stats.averageScore}%`, Target, 'bg-green-100', 'text-green-600')}
        {renderStatsCard('Best Score', `${user.stats.bestScore}%`, Trophy, 'bg-yellow-100', 'text-yellow-600')}
        {renderStatsCard('Total Points', user.stats.totalPoints, Award, 'bg-purple-100', 'text-purple-600')}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Quiz Attempts</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading recent attempts...</p>
            </div>
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div 
                  key={submission._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/quiz/${submission.quiz._id}/results`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{submission.quiz.title}</h3>
                      <p className="text-sm text-gray-600">{submission.quiz.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      submission.percentage >= 90 ? 'text-green-600' : 
                      submission.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {submission.percentage}%
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Book className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes attempted yet</h3>
              <p className="text-gray-600 mb-4">Start taking quizzes to see your results here.</p>
              <button 
                onClick={() => navigate('/browse')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Browse Quizzes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

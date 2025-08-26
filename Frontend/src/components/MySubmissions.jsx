import { useState, useEffect } from 'react';
import { Star, Book } from 'lucide-react';
import apiService from '../services/apiService';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserSubmissions();
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600 mt-1">View your quiz history and performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {submissions.map(submission => (
          <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{submission.quiz.title}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {submission.quiz.category}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      submission.quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {submission.quiz.difficulty.charAt(0).toUpperCase() + submission.quiz.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-lg font-bold text-gray-900">
                        {submission.score}/{submission.totalMarks}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Percentage</p>
                      <p className={`text-lg font-bold ${
                        submission.percentage >= 90 ? 'text-green-600' :
                        submission.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {submission.percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="text-lg font-bold text-gray-900">{submission.grade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="text-lg font-bold text-gray-900">{formatTime(submission.timeTaken)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Correct: {submission.correctAnswers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Incorrect: {submission.incorrectAnswers}</span>
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < submission.feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">Your Rating</span>
                      </div>
                      {submission.feedback.comment && (
                        <p className="text-sm text-gray-600">{submission.feedback.comment}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySubmissions;
import { useState } from 'react';
import { Trophy, Award, Target, Star } from 'lucide-react';

const QuizResults = ({ submission, quiz, onRetake, onBackToDashboard }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeedbackSubmit = () => {
    // Submit feedback
    alert('Thank you for your feedback!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Results Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              submission.percentage >= 90 ? 'bg-green-100' :
              submission.percentage >= 75 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {submission.percentage >= 90 ? 
                <Trophy className="w-10 h-10 text-green-600" /> :
                submission.percentage >= 75 ? 
                <Award className="w-10 h-10 text-yellow-600" /> :
                <Target className="w-10 h-10 text-red-600" />
              }
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600">{quiz.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                submission.percentage >= 90 ? 'text-green-600' :
                submission.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {submission.percentage}%
              </div>
              <p className="text-gray-600">Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {submission.score}/{submission.totalMarks}
              </div>
              <p className="text-gray-600">Points</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {submission.grade}
              </div>
              <p className="text-gray-600">Grade</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatTime(submission.timeTaken)}
              </div>
              <p className="text-gray-600">Time</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {submission.correctAnswers}
              </div>
              <p className="text-green-700 text-sm">Correct</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {submission.incorrectAnswers}
              </div>
              <p className="text-red-700 text-sm">Incorrect</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600 mb-1">
                {submission.skippedAnswers}
              </div>
              <p className="text-gray-700 text-sm">Skipped</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAnswers ? 'Hide Answers' : 'Review Answers'}
            </button>
            {quiz.settings?.allowRetake && (
              <button
                onClick={onRetake}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Retake Quiz
              </button>
            )}
            <button
              onClick={onBackToDashboard}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Answer Review */}
        {showAnswers && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Answer Review</h2>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = submission.answers.find(a => a.questionId === question.questionId);
                const isCorrect = userAnswer?.isCorrect;
                
                return (
                  <div key={question.questionId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Question {index + 1}
                        </h3>
                        <p className="text-gray-700 mb-4">{question.question}</p>
                        
                        <div className="space-y-2">
                          {question.allAnswers.map((answer, ansIndex) => {
                            const isUserAnswer = userAnswer?.userAnswer === answer;
                            const isCorrectAnswer = question.correctAnswer === answer;
                            
                            return (
                              <div
                                key={ansIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectAnswer
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : isUserAnswer && !isCorrectAnswer
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && (
                                    <span className="text-green-600 font-medium">✓ Correct:</span>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <span className="text-red-600 font-medium">Your answer:</span>
                                  )}
                                  <span>{answer}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Points:</span> {question.points} | 
                          <span className="font-medium ml-2">Difficulty:</span> {question.difficulty}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rate This Quiz</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className={`w-8 h-8 ${
                      star <= feedback.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your thoughts about this quiz..."
              />
            </div>
            
            <button
              onClick={handleFeedbackSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;

import React, { useState } from 'react';
import { Lightbulb, BookOpen, HelpCircle, Brain, Sparkles, AlertCircle } from 'lucide-react';
import apiService from '../services/apiService';

const AIHints = ({ question, category, difficulty, correctAnswer, onHintUsed }) => {
  const [hint, setHint] = useState(null);
  const [multipleHints, setMultipleHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hintLevel, setHintLevel] = useState('moderate');
  const [showMultipleHints, setShowMultipleHints] = useState(false);

  const generateHint = async (level = 'moderate') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.generateHint({
        question,
        category,
        difficulty,
        correctAnswer,
        hintLevel: level
      });

      if (response.success) {
        setHint(response.data);
        if (onHintUsed) onHintUsed();
      } else {
        setError('Failed to generate hint. Please try again.');
      }
    } catch (error) {
      console.error('Error generating hint:', error);
      setError('Failed to generate hint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMultipleHints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.generateMultipleHints({
        question,
        category,
        difficulty,
        correctAnswer,
        count: 3
      });

      if (response.success) {
        setMultipleHints(response.data.hints);
        setShowMultipleHints(true);
        if (onHintUsed) onHintUsed();
      } else {
        setError('Failed to generate hints. Please try again.');
      }
    } catch (error) {
      console.error('Error generating multiple hints:', error);
      setError('Failed to generate hints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHintLevelColor = (level) => {
    switch (level) {
      case 'subtle': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'strong': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHintLevelIcon = (level) => {
    switch (level) {
      case 'subtle': return <Lightbulb className="w-4 h-4" />;
      case 'moderate': return <HelpCircle className="w-4 h-4" />;
      case 'strong': return <Brain className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-4">
        <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Hints</h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Hint Level Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Hint Level</label>
        <div className="flex space-x-2">
          {['subtle', 'moderate', 'strong'].map((level) => (
            <button
              key={level}
              onClick={() => setHintLevel(level)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                hintLevel === level
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => generateHint(hintLevel)}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Get Hint'}
        </button>
        
        <button
          onClick={generateMultipleHints}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Multiple Hints'}
        </button>
      </div>

      {/* Single Hint Display */}
      {hint && !showMultipleHints && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHintLevelColor(hintLevel)}`}>
                  {getHintLevelIcon(hintLevel)}
                  <span className="ml-1">{hintLevel.charAt(0).toUpperCase() + hintLevel.slice(1)} Hint</span>
                </span>
                {hint.type === 'ai_generated' && (
                  <Sparkles className="w-4 h-4 text-purple-500 ml-2" />
                )}
              </div>
              <p className="text-gray-800 leading-relaxed">{hint.hint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Hints Display */}
      {showMultipleHints && multipleHints.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Progressive Hints</h4>
          <div className="space-y-3">
            {multipleHints.map((hint, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start">
                  {getHintLevelIcon(hint.level)}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHintLevelColor(hint.level)}`}>
                        {hint.level.charAt(0).toUpperCase() + hint.level.slice(1)} Hint
                      </span>
                      {hint.type === 'ai_generated' && (
                        <Sparkles className="w-4 h-4 text-purple-500 ml-2" />
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{hint.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <HelpCircle className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">How hints work:</p>
            <ul className="space-y-1">
              <li>• <strong>Subtle:</strong> Gentle guidance without revealing much</li>
              <li>• <strong>Moderate:</strong> Helpful direction to guide your thinking</li>
              <li>• <strong>Strong:</strong> More specific guidance when you're stuck</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Hints are powered by AI and designed to help you learn, not just get the answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHints;

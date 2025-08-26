const EnhancedQuizBrowser = ({ onStartQuiz }) => {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics including variables, functions, and data types',
      category: 'Programming',
      difficulty: 'easy',
      totalQuestions: 20,
      totalMarks: 100,
      timeLimit: 30,
      stats: { totalAttempts: 1250, averageScore: 78 },
      createdBy: { username: 'teacher1', firstName: 'John', lastName: 'Smith' },
      tags: ['javascript', 'programming', 'basics']
    },
    {
      id: 2,
      title: 'React Advanced Concepts',
      description: 'Advanced React patterns including hooks, context, and performance optimization',
      category: 'Programming',
      difficulty: 'hard',
      totalQuestions: 15,
      totalMarks: 150,
      timeLimit: 45,
      stats: { totalAttempts: 890, averageScore: 65 },
      createdBy: { username: 'teacher2', firstName: 'Jane', lastName: 'Doe' },
      tags: ['react', 'hooks', 'advanced']
    },
    {
      id: 3,
      title: 'CSS Grid & Flexbox',
      description: 'Master modern CSS layout techniques with Grid and Flexbox',
      category: 'Design',
      difficulty: 'medium',
      totalQuestions: 18,
      totalMarks: 90,
      timeLimit: 25,
      stats: { totalAttempts: 750, averageScore: 82 },
      createdBy: { username: 'teacher3', firstName: 'Mike', lastName: 'Johnson' },
      tags: ['css', 'layout', 'responsive']
    },
    {
      id: 4,
      title: 'Python Data Structures',
      description: 'Comprehensive quiz on Python lists, dictionaries, sets, and tuples',
      category: 'Programming',
      difficulty: 'medium',
      totalQuestions: 25,
      totalMarks: 125,
      timeLimit: 40,
      stats: { totalAttempts: 650, averageScore: 74 },
      createdBy: { username: 'teacher4', firstName: 'Sarah', lastName: 'Wilson' },
      tags: ['python', 'data-structures', 'algorithms']
    },
    {
      id: 5,
      title: 'UX Design Principles',
      description: 'Test your understanding of user experience design fundamentals',
      category: 'Design',
      difficulty: 'easy',
      totalQuestions: 12,
      totalMarks: 60,
      timeLimit: 20,
      stats: { totalAttempts: 420, averageScore: 88 },
      createdBy: { username: 'teacher5', firstName: 'David', lastName: 'Brown' },
      tags: ['ux', 'design', 'user-experience']
    },
    {
      id: 6,
      title: 'Database Management',
      description: 'SQL queries, database design, and normalization concepts',
      category: 'Programming',
      difficulty: 'hard',
      totalQuestions: 30,
      totalMarks: 200,
      timeLimit: 60,
      stats: { totalAttempts: 380, averageScore: 62 },
      createdBy: { username: 'teacher6', firstName: 'Lisa', lastName: 'Davis' },
      tags: ['sql', 'database', 'queries']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = ['Programming', 'Design', 'Science', 'History', 'Mathematics'];
  const difficulties = ['easy', 'medium', 'hard'];

  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.stats.totalAttempts - a.stats.totalAttempts;
        case 'newest':
          return new Date(b.createdAt || '2024-08-01') - new Date(a.createdAt || '2024-08-01');
        case 'highest-rated':
          return b.stats.averageScore - a.stats.averageScore;
        case 'easiest':
          return a.difficulty.localeCompare(b.difficulty);
        case 'hardest':
          return b.difficulty.localeCompare(a.difficulty);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Quizzes</h1>
          <p className="text-gray-600 mt-1">Discover and take quizzes on various topics</p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quizzes, topics, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="easiest">Easiest First</option>
            <option value="hardest">Hardest First</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="text-blue-600 hover:text-blue-800">×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="text-green-600 hover:text-green-800">×</button>
              </span>
            )}
            {selectedDifficulty !== 'all' && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-2">
                Difficulty: {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty('all')} className="text-yellow-600 hover:text-yellow-800">×</button>
              </span>
            )}
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} 
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {quiz.category}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </span>
                    {quiz.stats.averageScore >= 80 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        High Rated
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {quiz.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                    {quiz.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{quiz.tags.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Book className="w-4 h-4" />
                  <span>{quiz.totalQuestions} questions</span>
                  <span className="mx-2">•</span>
                  <Award className="w-4 h-4" />
                  <span>{quiz.totalMarks} points</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.timeLimit} minutes</span>
                  <span className="mx-2">•</span>
                  <Users className="w-4 h-4" />
                  <span>{quiz.stats.totalAttempts} attempts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Avg: {quiz.stats.averageScore}%</span>
                  <span className="mx-2">•</span>
                  <User className="w-4 h-4" />
                  <span>By {quiz.createdBy.firstName} {quiz.createdBy.lastName}</span>
                </div>
              </div>

              {/* Progress Bar for Average Score */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Success Rate</span>
                  <span>{quiz.stats.averageScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      quiz.stats.averageScore >= 80 ? 'bg-green-500' :
                      quiz.stats.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${quiz.stats.averageScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${
                        star <= Math.ceil(quiz.stats.averageScore / 20) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({quiz.stats.totalAttempts})
                  </span>
                </div>
                <button 
                  onClick={() => onStartQuiz(quiz)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 group-hover:bg-blue-700"
                >
                  <Play className="w-4 h-4" />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No quizzes match your search "${searchTerm}"`
              : "Try adjusting your filters to see more results"
            }
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

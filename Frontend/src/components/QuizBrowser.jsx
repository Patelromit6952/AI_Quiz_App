import { useState, useEffect } from 'react';
import { Book, Clock, Users, Target, Play, Plus, Code, Globe, Database, Layers, Smartphone, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const QuizBrowser = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Programming language categories with their questions
  const programmingCategories = [
    {
      id: 'c',
      name: 'C Programming',
      icon: Cpu,
      color: 'blue',
      description: 'Test your C programming fundamentals',
      questions: [
        {
          id: 1,
          question: "Which of the following is the correct way to declare a pointer in C?",
          options: ["int *ptr;", "int ptr*;", "*int ptr;", "pointer int ptr;"],
          correctAnswer: "int *ptr;"
        },
        {
          id: 2,
          question: "What does 'malloc()' function do in C?",
          options: ["Frees memory", "Allocates memory dynamically", "Copies memory", "Initializes memory"],
          correctAnswer: "Allocates memory dynamically"
        },
        {
          id: 3,
          question: "Which header file is required for printf() function?",
          options: ["<stdlib.h>", "<string.h>", "<stdio.h>", "<math.h>"],
          correctAnswer: "<stdio.h>"
        },
        {
          id: 4,
          question: "What is the size of 'int' data type in most systems?",
          options: ["2 bytes", "4 bytes", "8 bytes", "1 byte"],
          correctAnswer: "4 bytes"
        },
        {
          id: 5,
          question: "Which operator is used to access structure members through pointer?",
          options: [".", "->", "*", "&"],
          correctAnswer: "->"
        }
      ]
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: Code,
      color: 'purple',
      description: 'Master C++ object-oriented programming',
      questions: [
        {
          id: 1,
          question: "Which of the following is NOT a feature of C++?",
          options: ["Inheritance", "Encapsulation", "Polymorphism", "Garbage Collection"],
          correctAnswer: "Garbage Collection"
        },
        {
          id: 2,
          question: "What is the correct syntax for constructor in C++?",
          options: ["ClassName() {}", "constructor ClassName() {}", "void ClassName() {}", "new ClassName() {}"],
          correctAnswer: "ClassName() {}"
        },
        {
          id: 3,
          question: "Which access specifier allows access only within the class?",
          options: ["public", "protected", "private", "internal"],
          correctAnswer: "private"
        },
        {
          id: 4,
          question: "What does 'cout' represent in C++?",
          options: ["Character output", "Console output", "Count output", "Code output"],
          correctAnswer: "Console output"
        },
        {
          id: 5,
          question: "Which operator is used for dynamic memory allocation in C++?",
          options: ["malloc", "alloc", "new", "create"],
          correctAnswer: "new"
        }
      ]
    },
    {
      id: 'java',
      name: 'Java',
      icon: Layers,
      color: 'orange',
      description: 'Explore Java programming concepts',
      questions: [
        {
          id: 1,
          question: "Which of the following is the entry point of a Java program?",
          options: ["start()", "main()", "begin()", "run()"],
          correctAnswer: "main()"
        },
        {
          id: 2,
          question: "What does JVM stand for?",
          options: ["Java Virtual Machine", "Java Variable Method", "Java Vector Model", "Java Version Manager"],
          correctAnswer: "Java Virtual Machine"
        },
        {
          id: 3,
          question: "Which keyword is used to inherit a class in Java?",
          options: ["inherits", "extends", "implements", "super"],
          correctAnswer: "extends"
        },
        {
          id: 4,
          question: "What is the default value of a boolean variable in Java?",
          options: ["true", "false", "0", "null"],
          correctAnswer: "false"
        },
        {
          id: 5,
          question: "Which collection class allows duplicate elements?",
          options: ["Set", "HashSet", "ArrayList", "TreeSet"],
          correctAnswer: "ArrayList"
        }
      ]
    },
    {
      id: 'html',
      name: 'HTML',
      icon: Globe,
      color: 'red',
      description: 'Test your HTML markup knowledge',
      questions: [
        {
          id: 1,
          question: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language", "Hypermedia Text Markup Language"],
          correctAnswer: "Hyper Text Markup Language"
        },
        {
          id: 2,
          question: "Which HTML tag is used to create a hyperlink?",
          options: ["<link>", "<a>", "<href>", "<url>"],
          correctAnswer: "<a>"
        },
        {
          id: 3,
          question: "Which attribute specifies the URL of the page the link goes to?",
          options: ["src", "link", "href", "url"],
          correctAnswer: "href"
        },
        {
          id: 4,
          question: "Which HTML element is used to specify a footer for a document?",
          options: ["<bottom>", "<footer>", "<end>", "<section>"],
          correctAnswer: "<footer>"
        },
        {
          id: 5,
          question: "Which HTML tag is used to display images?",
          options: ["<image>", "<img>", "<picture>", "<src>"],
          correctAnswer: "<img>"
        }
      ]
    },
    {
      id: 'css',
      name: 'CSS',
      icon: Layers,
      color: 'blue',
      description: 'Master CSS styling and layouts',
      questions: [
        {
          id: 1,
          question: "What does CSS stand for?",
          options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
          correctAnswer: "Cascading Style Sheets"
        },
        {
          id: 2,
          question: "Which property is used to change the background color?",
          options: ["color", "bgcolor", "background-color", "bg-color"],
          correctAnswer: "background-color"
        },
        {
          id: 3,
          question: "Which CSS property controls the text size?",
          options: ["font-size", "text-size", "font-style", "text-style"],
          correctAnswer: "font-size"
        },
        {
          id: 4,
          question: "How do you select an element with id 'header'?",
          options: [".header", "#header", "*header", "&header"],
          correctAnswer: "#header"
        },
        {
          id: 5,
          question: "Which property is used to make text bold?",
          options: ["font-weight", "text-bold", "font-bold", "bold"],
          correctAnswer: "font-weight"
        }
      ]
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: Code,
      color: 'yellow',
      description: 'Test your JavaScript programming skills',
      questions: [
        {
          id: 1,
          question: "Which method is used to add an element to the end of an array?",
          options: ["push()", "add()", "append()", "insert()"],
          correctAnswer: "push()"
        },
        {
          id: 2,
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["var myVar;", "variable myVar;", "declare myVar;", "v myVar;"],
          correctAnswer: "var myVar;"
        },
        {
          id: 3,
          question: "Which operator is used to compare both value and type?",
          options: ["==", "===", "!=", "!=="],
          correctAnswer: "==="
        },
        {
          id: 4,
          question: "What does 'DOM' stand for?",
          options: ["Document Object Model", "Data Object Management", "Dynamic Object Method", "Document Oriented Model"],
          correctAnswer: "Document Object Model"
        },
        {
          id: 5,
          question: "Which method converts a string to lowercase?",
          options: ["toLower()", "toLowerCase()", "lower()", "lowerCase()"],
          correctAnswer: "toLowerCase()"
        }
      ]
    },
    {
      id: 'python',
      name: 'Python',
      icon: Database,
      color: 'green',
      description: 'Explore Python programming fundamentals',
      questions: [
        {
          id: 1,
          question: "Which of the following is the correct file extension for Python files?",
          options: [".py", ".python", ".pt", ".pyt"],
          correctAnswer: ".py"
        },
        {
          id: 2,
          question: "Which function is used to display output in Python?",
          options: ["echo()", "print()", "display()", "output()"],
          correctAnswer: "print()"
        },
        {
          id: 3,
          question: "How do you create a comment in Python?",
          options: ["// comment", "/* comment */", "# comment", "-- comment"],
          correctAnswer: "# comment"
        },
        {
          id: 4,
          question: "Which data type is used to store text in Python?",
          options: ["text", "string", "str", "char"],
          correctAnswer: "str"
        },
        {
          id: 5,
          question: "What is the correct way to create a list in Python?",
          options: ["list = {1, 2, 3}", "list = (1, 2, 3)", "list = [1, 2, 3]", "list = <1, 2, 3>"],
          correctAnswer: "list = [1, 2, 3]"
        }
      ]
    },
    {
      id: 'react',
      name: 'React',
      icon: Smartphone,
      color: 'cyan',
      description: 'Test your React framework knowledge',
      questions: [
        {
          id: 1,
          question: "What is JSX in React?",
          options: ["JavaScript XML", "Java Syntax Extension", "JavaScript eXtension", "JSON XML"],
          correctAnswer: "JavaScript XML"
        },
        {
          id: 2,
          question: "Which hook is used to manage state in functional components?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: "useState"
        },
        {
          id: 3,
          question: "What is the virtual DOM?",
          options: ["A copy of the real DOM", "A JavaScript representation of the DOM", "A faster version of DOM", "A memory-stored DOM"],
          correctAnswer: "A JavaScript representation of the DOM"
        },
        {
          id: 4,
          question: "Which method is used to render a React component?",
          options: ["render()", "display()", "show()", "mount()"],
          correctAnswer: "render()"
        },
        {
          id: 5,
          question: "What are props in React?",
          options: ["Properties passed to components", "State variables", "Event handlers", "CSS properties"],
          correctAnswer: "Properties passed to components"
        }
      ]
    }
  ];

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuizzes();
      if (response.success) {
        setQuizzes(response.data);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startLanguageQuiz = (category) => {
    const quiz = {
      id: `${category.id}-quiz`,
      title: `${category.name} Quiz`,
      description: category.description,
      questions: category.questions,
      timeLimit: 10,
      totalQuestions: category.questions.length,
      category: category.name
    };

    navigate(`/quiz/${category.id}`, { state: { quiz } });
  };

  const goToQuizGenerator = () => {
    navigate('/generate');
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-800',
      purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-800',
      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-800',
      red: 'from-red-50 to-red-100 border-red-200 text-red-800',
      yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800',
      green: 'from-green-50 to-green-100 border-green-200 text-green-800',
      cyan: 'from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-800'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getButtonColor = (color) => {
    const buttonMap = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      red: 'bg-red-600 hover:bg-red-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700',
      green: 'bg-green-600 hover:bg-green-700',
      cyan: 'bg-cyan-600 hover:bg-cyan-700'
    };
    return buttonMap[color] || buttonMap.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Programming Quizzes</h1>
          <p className="text-gray-600 mt-1">Test your knowledge across different programming languages</p>
        </div>
                  <button
            onClick={goToQuizGenerator}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Custom Quiz
          </button>
      </div>

      {/* Programming Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {programmingCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <div 
              key={category.id} 
              className={`bg-gradient-to-br ${getColorClasses(category.color)} rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 hover:scale-105`}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                    <IconComponent className={`w-6 h-6 ${category.color === 'yellow' ? 'text-yellow-600' : `text-${category.color}-600`}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Book className="w-4 h-4" />
                    <span>{category.questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>10 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>Multiple choice</span>
                  </div>
                </div>

                <button 
                  onClick={() => startLanguageQuiz(category)}
                  className={`w-full ${getButtonColor(category.color)} text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-2`}
                >
                  <Play className="w-4 h-4" />
                  Start Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Other Quiz Grid */}
      {quizzes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Other Available Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Book className="w-4 h-4" />
                      <span>{quiz.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimit} minutes</span>
                    </div>
                    {quiz.stats && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{quiz.stats.totalAttempts} attempts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          <span>Avg: {quiz.stats.averageScore}%</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      {quiz.createdBy ? `By ${quiz.createdBy.firstName} ${quiz.createdBy.lastName}` : 'Quiz'}
                    </div>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* {quizzes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No additional quizzes found</h3>
          <p className="text-gray-600 mb-4">Try one of the programming language quizzes above or create a custom one.</p>
          <button
            onClick={goToQuizGenerator}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Custom Quiz
          </button>
        </div>
      )} */}
{/* 
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchQuizzes}
            className="text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )} */}
    </div>
  );
};

export default QuizBrowser; 
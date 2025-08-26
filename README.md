# Quiz App - AI-Powered Quiz Platform

A full-stack quiz application with AI integration, featuring user authentication, quiz generation, real-time scoring, and comprehensive analytics.

## 🚀 Features

### Core Features
- **User Authentication**: Secure login/register with JWT tokens
- **Quiz Generation**: AI-powered quiz creation using external APIs
- **Real-time Quiz Taking**: Interactive quiz interface with timer
- **Score Tracking**: Comprehensive scoring and performance analytics
- **Email Notifications**: Automated result emails with detailed insights
- **Responsive Design**: Modern UI with Tailwind CSS

### AI Integration
- **External API Integration**: OpenTrivia DB for question generation
- **Smart Question Processing**: HTML entity decoding and answer shuffling
- **Performance Insights**: AI-generated feedback and improvement suggestions
- **Adaptive Difficulty**: Dynamic question selection based on user performance

### Advanced Features
- **Leaderboards**: Real-time ranking system
- **Analytics Dashboard**: Detailed performance metrics
- **Quiz Customization**: Configurable settings and preferences
- **Rate Limiting**: Security measures to prevent abuse
- **Email Service**: Nodemailer integration for notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Axios** for external API calls
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **Context API** for state management

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Quiz_App/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/quiz_app

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7

   # Email Configuration (for Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   EMAIL_FROM=your_email@gmail.com

   # Client URL (for email links)
   CLIENT_URL=http://localhost:5173

   # Quiz API Keys (optional)
   QUIZ_API_KEY=your_quiz_api_key_here
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Database Setup
- Ensure MongoDB is running locally or use a cloud service like MongoDB Atlas
- The app will automatically create collections on first run

### Email Configuration
- For Gmail, enable 2-factor authentication and generate an app password
- Use the app password in the EMAIL_PASS environment variable

### External APIs
- **OpenTrivia DB**: Free and requires no API key
- **QuizAPI.io**: Optional, requires API key for additional features

## 🎯 AI Integration Suggestions

### Current AI Features
1. **External Question Generation**: Integration with OpenTrivia DB
2. **Smart Question Processing**: HTML decoding and answer randomization
3. **Performance Analytics**: Automated insights and feedback
4. **Email Intelligence**: Rich HTML email templates with performance data

### Enhanced AI Suggestions

#### 1. **Adaptive Learning System**
```javascript
// Implement adaptive difficulty based on user performance
const adaptiveDifficulty = (userHistory, currentScore) => {
  const avgScore = userHistory.reduce((sum, quiz) => sum + quiz.score, 0) / userHistory.length;
  if (currentScore > avgScore + 10) return 'harder';
  if (currentScore < avgScore - 10) return 'easier';
  return 'same';
};
```

#### 2. **Personalized Question Recommendations**
```javascript
// AI-powered question selection based on user weaknesses
const recommendQuestions = (userProfile, availableQuestions) => {
  const weakTopics = analyzeWeakAreas(userProfile);
  return availableQuestions.filter(q => 
    weakTopics.includes(q.category) || 
    q.difficulty === userProfile.preferredDifficulty
  );
};
```

#### 3. **Natural Language Processing**
```javascript
// Integrate with OpenAI API for custom question generation
const generateCustomQuestions = async (topic, difficulty) => {
  const prompt = `Generate 5 ${difficulty} level questions about ${topic}`;
  const response = await openai.complete(prompt);
  return parseQuestions(response.data);
};
```

#### 4. **Intelligent Tutoring System**
```javascript
// Provide contextual hints and explanations
const provideHint = (question, userAnswer, questionHistory) => {
  const context = analyzeUserPatterns(questionHistory);
  return generateContextualHint(question, userAnswer, context);
};
```

#### 5. **Predictive Analytics**
```javascript
// Predict user performance and suggest study areas
const predictPerformance = (userData, upcomingQuiz) => {
  const model = trainPerformanceModel(userData);
  return model.predict(upcomingQuiz.features);
};
```

### Recommended AI Services Integration

1. **OpenAI GPT-4**: For custom question generation and explanations
2. **Google Cloud AI**: For natural language processing
3. **Azure Cognitive Services**: For adaptive learning algorithms
4. **TensorFlow.js**: For client-side performance prediction
5. **IBM Watson**: For advanced analytics and insights

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Add to package.json
"scripts": {
  "start": "node server.js",
  "heroku-postbuild": "npm install"
}

# Deploy
heroku create your-quiz-app
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Quiz Management
- `GET /api/quiz/categories` - Get available categories
- `POST /api/quiz/generate` - Generate new quiz
- `GET /api/quiz/public` - Get public quizzes
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers

### User Data
- `GET /api/quiz/user/submissions` - Get user submissions
- `GET /api/quiz/user/created` - Get user created quizzes
- `GET /api/auth/stats` - Get user statistics

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet
- SQL injection prevention (MongoDB)

## 🧪 Testing

### Backend Testing
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@quizapp.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Real-time multiplayer quizzes
- [ ] Voice-based question answering
- [ ] AR/VR quiz experiences
- [ ] Blockchain-based certification
- [ ] Advanced AI tutoring system
- [ ] Mobile app development
- [ ] Social features and sharing
- [ ] Advanced analytics dashboard
- [ ] Integration with learning management systems
- [ ] Multi-language support

---

**Built with ❤️ using modern web technologies and AI integration**
#   A I _ Q u i z _ A p p  
 #   A I _ Q u i z _ A p p  
 #   A I _ Q u i z _ A p p  
 
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import QuizBrowser from './components/QuizBrowser';
import MySubmissions from './components/MySubmissions';
import QuizGenerator from './components/QuizGenerator';
import Profile from './components/Profile';
import QuizTaking from './components/QuizTakingPage';
import QuizResults from './components/QuizResult';
import Leaderboard from './components/Leaderboard';
import { QuizProvider } from './contexts/QuizContext';
import TestAuth from './components/TestAuth';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return (
      <Navigation>  {/* Pass children to Navigation */}
        {children}
      </Navigation>
    );
  };

  return (
    <QuizProvider>
      {/* Debug component - remove in production */}
      <TestAuth />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginForm />
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/browse" element={
          <ProtectedRoute>
            <QuizBrowser />
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />
        
        <Route path="/quizzes" element={
          <ProtectedRoute>
            <QuizBrowser />
          </ProtectedRoute>
        } />

        <Route path="/submissions" element={
          <ProtectedRoute>
            <MySubmissions />
          </ProtectedRoute>
        } />

        <Route path="/generate" element={
          <ProtectedRoute>
            <QuizGenerator />
          </ProtectedRoute>
        } />


        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/quiz/:id" element={
          <ProtectedRoute>
            <QuizTaking />
          </ProtectedRoute>
        } />

        <Route path="/quiz/:id/results" element={
          <ProtectedRoute>
            <QuizResults />
          </ProtectedRoute>
        } />

        {/* Default Route */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        } />
      </Routes>
    </QuizProvider>
  );
};

export default App;
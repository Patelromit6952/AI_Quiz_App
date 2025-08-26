import React, { useState, useEffect } from 'react';
import { BookOpen, User, Mail, Lock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Debug effect to monitor user changes
  useEffect(() => {
    console.log("LoginForm: User state changed to:", user);
    console.log("LoginForm: Loading state:", loading);
    if (user) {
      console.log("LoginForm: User is logged in, redirecting to dashboard...");
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (isLogin) {
        if (!credentials.email || !credentials.password) {
          setError('Email and password are required');
          return;
        }

        console.log("LoginForm: Starting login process...");
        const result = await login({ 
          email: credentials.email,
          password: credentials.password 
        });

        console.log("LoginForm: Login result:", result);

        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          console.log("LoginForm: Login successful, waiting for user state update...");
          // The useEffect above will handle the redirect when user state updates
          
          // Fallback redirect after 2 seconds if user state doesn't update
          setTimeout(() => {
            if (!user) {
              console.log("LoginForm: Fallback redirect triggered");
              navigate('/dashboard', { replace: true });
            }
          }, 2000);
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      } else {
        // Registration validation
        if (!credentials.email || !credentials.password || !credentials.username) {
          setError('Email, username and password are required');
          return;
        }

        if (credentials.username.length < 3) {
          setError('Username must be at least 3 characters long');
          return;
        }

        if (!credentials.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
          setError('Please enter a valid email address');
          return;
        }

        if (credentials.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        if (!credentials.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
          setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
          return;
        }

        if (credentials.password !== credentials.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        console.log("LoginForm: Starting registration process...");
        const result = await register({
          email: credentials.email,
          password: credentials.password,
          username: credentials.username,
          firstName: credentials.firstName,
          lastName: credentials.lastName
        });

        console.log("LoginForm: Registration result:", result);

        if (result.success) {
          setSuccess('Registration successful! Redirecting...');
          console.log("LoginForm: Registration successful, waiting for user state update...");
          // The useEffect above will handle the redirect when user state updates
          
          // Fallback redirect after 2 seconds if user state doesn't update
          setTimeout(() => {
            if (!user) {
              console.log("LoginForm: Fallback redirect triggered for registration");
              navigate('/dashboard', { replace: true });
            }
          }, 2000);
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('LoginForm: Auth error:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const resetForm = () => {
    setCredentials({
      username: '', 
      email: '', 
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
    setError('');
    setSuccess('');
  };

  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">QuizMaster</h1>
          <p className="text-gray-600">AI-Powered Quiz Platform</p>
        </div>

        {/* Debug info - Remove this in production */}
        {user && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>Debug:</strong> User is logged in: {user.email || user.username || 'Unknown'}
          </div>
        )}

        {/* Toggle Button */}
        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => toggleMode(true)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              isLogin 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => toggleMode(false)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              !isLogin 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={credentials.firstName}
                    onChange={(e) => setCredentials({...credentials, firstName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={credentials.lastName}
                    onChange={(e) => setCredentials({...credentials, lastName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="johndoe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({...credentials, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => toggleMode(false)}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => toggleMode(true)}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
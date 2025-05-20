import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLogin() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Send login request to the API
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // For development purposes only: allow login with hardcoded credentials
        if (formData.username === 'admin' && formData.password === 'admin123') {
          console.log('Using demo token since API request failed but credentials are correct');
          localStorage.setItem('adminToken', 'demo-token');
          localStorage.setItem('adminUser', JSON.stringify({
            username: 'admin',
            name: 'Administrator',
            role: 'admin'
          }));
          
          // Redirect to dashboard
          router.push('/admin/dashboard');
          return;
        }
        
        throw new Error(data.error || 'Authentication failed');
      }

      // Store authentication token
      localStorage.setItem('adminToken', data.token);
      
      // Store user data if needed
      if (data.user) {
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <AdminLayout title="Admin Login">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/4 -right-24 w-72 h-72 bg-red-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 z-10 border border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your credentials to access the dashboard
            </p>
            <div className="mt-3 text-center text-xs bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              <span className="font-semibold">Demo: </span>
              Username: admin, Password: admin123
            </div>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-300 text-sm border border-red-200 dark:border-red-900/50 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 
                shadow-lg hover:shadow-red-500/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading && (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </div>
          </form>
          
          <div className="flex items-center justify-center">
            <Link 
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to website
            </Link>
          </div>
        </div>
        
        {/* Theme toggle button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 
          hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
          shadow-md"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </AdminLayout>
  );
} 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
                            <img                className="h-16 w-auto"                src="/logo.png"                alt="Delbi Restaurant"                onError={(e) => {                  e.target.onerror = null;                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 6h18M3 12h18M3 18h18'/%3E%3C/svg%3E";                }}
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white font-heading">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your credentials to access the dashboard
            </p>
            <div className="mt-2 text-center text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Demo: </span>
              Username: admin, Password: admin123
            </div>
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
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
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-admin-primary focus:border-admin-primary sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-admin-primary focus:border-admin-primary sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-danger-bg-light dark:bg-danger-bg-dark rounded-md text-danger-light dark:text-danger-bg-light text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-admin-primary hover:bg-admin-sidebar-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary transition-colors duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-admin-sidebar-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : null}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="text-center">
            <Link 
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-admin-primary dark:hover:text-admin-sidebar-text"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 
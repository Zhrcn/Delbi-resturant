import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication on client side
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const userData = JSON.parse(adminUser);
        setUsername(userData.name || userData.username || 'Admin');
      } catch (error) {
        console.error('Failed to parse admin user data');
        setUsername('Admin');
      }
    } else {
      // If not logged in and not on login page, redirect to login
      if (router.pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  // Check if current page is login
  const isLoginPage = router.pathname === '/admin/login';

  // Don't render layout elements on login page
  if (isLoginPage) {
    return (
      <>
        <Head>
          <title>{title || 'Admin - Delbi Restaurant'}</title>
        </Head>
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title || 'Admin - Delbi Restaurant'}</title>
      </Head>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md bg-red-600-600 text-white focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-red-800 text-white transform transition-transform duration-300 lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-center h-16 bg-red-900">
              <h2 className="text-xl font-bold">Delbi Admin</h2>
            </div>
            <nav className="mt-6">
              <div className="px-4 py-3 text-xs font-semibold text-red-200 uppercase tracking-wider">
                Dashboard
              </div>
              <Link 
                href="/admin/dashboard"
                className={`flex items-center px-6 py-3 hover:bg-red-700 ${router.pathname === '/admin/dashboard' ? 'bg-red-700' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Overview
              </Link>
              <Link 
                href="/admin/menu"
                className={`flex items-center px-6 py-3 hover:bg-red-700 ${router.pathname === '/admin/menu' ? 'bg-red-700' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Menu
              </Link>
              <div className="px-4 py-3 text-xs font-semibold text-red-200 uppercase tracking-wider">
                Management
              </div>
              <Link 
                href="/admin/reservations"
                className={`flex items-center px-6 py-3 hover:bg-red-700 ${router.pathname === '/admin/reservations' ? 'bg-red-700' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reservations
              </Link>
              <Link
                href="/admin/settings" 
                className={`flex items-center px-6 py-3 hover:bg-red-700 ${router.pathname === '/admin/settings' ? 'bg-red-700' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </nav>
            <div className="absolute bottom-0 w-full">
              <div className="px-4 py-4 border-t border-red-700">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-600 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:pl-64">
            {/* Topbar */}
            <div className="bg-white dark:bg-gray-800 shadow-md">
              <div className="flex items-center justify-between px-4 py-3">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {title || 'Dashboard'}
                </h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                  >
                    {isDarkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-200">{username}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page content */}
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
} 
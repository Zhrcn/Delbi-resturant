import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTheme } from '../../context/ThemeContext';

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
        <div className={`min-h-screen admin-theme ${isDarkMode ? 'dark' : ''}`}>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
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
      <div className={`min-h-screen admin-theme ${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-all duration-300 ease-in-out lg:translate-x-0 
            bg-gradient-to-b from-red-800 to-red-900 shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-center h-20 border-b border-red-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Delbi Admin</h2>
            </div>
            
            <div className="px-4 py-6">
              <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-red-700/30">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-400 to-red-600 flex items-center justify-center text-white shadow-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{username}</p>
                  <p className="text-red-300 text-xs">Administrator</p>
                </div>
              </div>
            </div>
            
            <nav className="px-4 pb-4">
              <div className="px-3 py-2 text-xs font-bold text-red-300 uppercase tracking-wider">
                Dashboard
              </div>
              <Link 
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 mb-2 rounded-lg text-red-100 hover:bg-red-700/50 transition-all ${
                  router.pathname === '/admin/dashboard' ? 'bg-red-700/80 shadow-md shadow-red-900/50 font-medium' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Overview
              </Link>
              <Link 
                href="/admin/menu"
                className={`flex items-center px-4 py-3 mb-2 rounded-lg text-red-100 hover:bg-red-700/50 transition-all ${
                  router.pathname === '/admin/menu' ? 'bg-red-700/80 shadow-md shadow-red-900/50 font-medium' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Menu
              </Link>
              <div className="px-3 py-2 mt-6 text-xs font-bold text-red-300 uppercase tracking-wider">
                Management
              </div>
              <Link 
                href="/admin/reservations"
                className={`flex items-center px-4 py-3 mb-2 rounded-lg text-red-100 hover:bg-red-700/50 transition-all ${
                  router.pathname === '/admin/reservations' ? 'bg-red-700/80 shadow-md shadow-red-900/50 font-medium' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reservations
              </Link>
              <Link
                href="/admin/settings" 
                className={`flex items-center px-4 py-3 mb-2 rounded-lg text-red-100 hover:bg-red-700/50 transition-all ${
                  router.pathname === '/admin/settings' ? 'bg-red-700/80 shadow-md shadow-red-900/50 font-medium' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="pt-4 border-t border-red-700/30">
                <button 
                  onClick={handleLogout} 
                  className="flex w-full items-center justify-center px-4 py-3 space-x-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-lg shadow-lg hover:shadow-red-700/30 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:pl-72">
            {/* Topbar */}
            <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {title || 'Dashboard'}
                  </h1>
                  <div className="ml-4 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs rounded-full">
                    Admin Panel
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                    aria-label="Toggle dark mode"
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
                  <Link 
                    href="/" 
                    className="hidden sm:flex items-center text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Visit Website
                  </Link>
                </div>
              </div>
            </div>

            {/* Page content */}
            <main className="p-6 md:p-8 max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
} 
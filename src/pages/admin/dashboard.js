import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Line } from 'react-chartjs-2';
import AdminLayout from '../../components/AdminLayout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [reservations, setReservations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuItems, setMenuItems] = useState({
    starters: [],
    'main-courses': [],
    desserts: [],
    drinks: [],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'starters',
    image: '',
  });

  // Add state for DB connection status
  const [dbStatus, setDbStatus] = useState({ 
    checking: false, 
    connected: false,
    error: null,
    lastChecked: null 
  });

  useEffect(() => {
    checkAuth();

    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      // Check if browser supports matchMedia
      if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeQuery.matches);
        
        // Listen for changes in color scheme preference
        const darkModeHandler = (e) => setIsDarkMode(e.matches);
        
        // Use addEventListener if available (newer browsers)
        if (darkModeQuery.addEventListener) {
          darkModeQuery.addEventListener('change', darkModeHandler);
          return () => darkModeQuery.removeEventListener('change', darkModeHandler);
        } 
        // Fall back to deprecated addListener for older browsers
        else if (darkModeQuery.addListener) {
          darkModeQuery.addListener(darkModeHandler);
          return () => darkModeQuery.removeListener(darkModeHandler);
        }
      } else {
        // Fallback for browsers without matchMedia support
        setIsDarkMode(false);
      }
    }
  }, []);

  const checkAuth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const storedUsername = localStorage.getItem('adminUser');
      
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }
      
      if (storedUsername) {
        setUsername(storedUsername);
      }
      
      setIsAuthenticated(true);
      fetchData();
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('Fetching data with token:', token ? 'Token exists' : 'No token');

      // Fetch reservations
      try {
        console.log('Fetching reservations...');
        const reservationsResponse = await fetch('/api/admin/reservations', {
          headers
        });
        
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          console.log('Reservations data received:', reservationsData);
          
          // Ensure the data structure is what we expect
          if (reservationsData && reservationsData.reservations && Array.isArray(reservationsData.reservations)) {
            setReservations(reservationsData.reservations);
          } else if (Array.isArray(reservationsData)) {
            // If the API returns an array directly
            setReservations(reservationsData);
          } else {
            console.error('Unexpected reservations data format:', reservationsData);
            setReservations([]);
          }
        } else {
          const errorText = await reservationsResponse.text();
          console.error('Failed to fetch reservations:', reservationsResponse.status, errorText);
          
          // Use empty array if fetch fails
          setReservations([]);
        }
      } catch (reservationError) {
        console.error('Error fetching reservations:', reservationError);
        setReservations([]);
      }

      // Fetch menu items
      try {
        console.log('Fetching menu items...');
        const menuResponse = await fetch('/api/admin/menu?organizeByCategory=true', {
          headers
        });
        
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          console.log('Menu data received:', menuData);
          
          // Transform the categorized menu data into our expected format
          // If the response is already an object with category keys, use it directly
          if (typeof menuData === 'object' && !Array.isArray(menuData)) {
            setMenuItems(menuData);
          } else if (Array.isArray(menuData)) {
            // If it's an array, organize it by category
            const categorizedMenu = menuData.reduce((acc, item) => {
              const category = item.category ? item.category.toLowerCase().replace(' ', '-') : 'other';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(item);
              return acc;
            }, {
              starters: [],
              'main-courses': [],
              desserts: [],
              drinks: [],
              other: []
            });
            
            setMenuItems(categorizedMenu);
          } else {
            console.error('Unexpected menu data format:', menuData);
          }
        } else {
          const errorText = await menuResponse.text();
          console.error('Failed to fetch menu items:', menuResponse.status, errorText);
          // Keep default empty menu structure
        }
      } catch (menuError) {
        console.error('Error fetching menu items:', menuError);
        // Keep default empty menu structure
      }

      // Fetch or create analytics data
      // For now, we'll use mock data for analytics
      const mockAnalyticsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Website Visitors',
            data: [65, 59, 80, 81, 56, 55],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      };
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error in fetchData:', error);
      // Continue to show the dashboard with empty data rather than redirecting
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUsername('');
    router.push('/admin/login');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }
      
      // Refresh the data after adding
      await fetchData();
      
      // Clear the form
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'starters',
        image: '',
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert(`Failed to add item: ${error.message}`);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      id: item._id, // Use MongoDB _id
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || '',
      available: item.available
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newItem.id,
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          category: newItem.category,
          image: newItem.image,
          available: newItem.available
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update menu item');
      }
      
      // Refresh the data after updating
      await fetchData();
      
      // Clear the form
      setEditingItem(null);
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'starters',
        image: '',
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert(`Failed to update item: ${error.message}`);
    }
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/menu', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: item._id // Use MongoDB _id
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete menu item');
        }
        
        // Refresh the data after deleting
        await fetchData();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert(`Failed to delete item: ${error.message}`);
      }
    }
  };

  const handleUpdateReservationStatus = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reservationId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update reservation status');
      }
      
      // Refresh the data after updating
      await fetchData();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert(`Failed to update reservation: ${error.message}`);
    }
  };

  const checkDatabaseConnection = async () => {
    setDbStatus({ ...dbStatus, checking: true, error: null });
    
    try {
      const response = await fetch('/api/admin/test-connection');
      const data = await response.json();
      
      setDbStatus({
        checking: false,
        connected: data.connected,
        error: data.error || null,
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      setDbStatus({
        checking: false,
        connected: false,
        error: error.message,
        lastChecked: new Date().toISOString()
      });
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything until authentication is checked
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome, {username || 'Administrator'}</h1>
            <p className="text-red-100 mb-6">Here&apos;s what&apos;s happening with your restaurant today.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-inner flex items-center">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mr-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Reservations</p>
                  <p className="text-2xl font-bold">{reservations.length}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-inner flex items-center">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mr-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-100 text-sm font-medium">Menu Items</p>
                  <p className="text-2xl font-bold">{Object.values(menuItems).reduce((total, items) => total + items.length, 0)}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-inner flex items-center">
                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mr-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-100 text-sm font-medium">Today&apos;s Reservations</p>
                  <p className="text-2xl font-bold">
                    {reservations.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Database Status</h2>
            </div>
            <button
              onClick={checkDatabaseConnection}
              disabled={dbStatus.checking}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
              text-white rounded-lg shadow-sm hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 
              focus:ring-offset-2 transition-all duration-200 text-sm font-medium flex items-center"
            >
              {dbStatus.checking ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Check Connection</span>
                </>
              )}
            </button>
          </div>
          
          {dbStatus.lastChecked && (
            <div className="text-sm mb-3 text-gray-500 dark:text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last checked: {new Date(dbStatus.lastChecked).toLocaleString()}
            </div>
          )}
          
          <div className={`p-4 rounded-lg flex items-center ${
            dbStatus.connected 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30' 
              : dbStatus.error 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30'
                : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
          }`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
              dbStatus.connected 
                ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' 
                : dbStatus.error 
                  ? 'bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {dbStatus.connected ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : dbStatus.error ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-medium ${
                dbStatus.connected 
                  ? 'text-green-800 dark:text-green-300' 
                  : dbStatus.error 
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-gray-800 dark:text-gray-300'
              }`}>
                {dbStatus.connected 
                  ? 'Connected to database successfully' 
                  : dbStatus.error 
                    ? 'Connection error' 
                    : 'Database connection status unknown'}
              </p>
              {dbStatus.error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{dbStatus.error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Reservations</h2>
          </div>
          
          {reservations.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reservations.slice(0, 5).map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {reservation.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(reservation.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {reservation.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {reservation.guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          reservation.status === 'confirmed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : reservation.status === 'pending' 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {reservation.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No reservations found</p>
              <p className="text-gray-400 dark:text-gray-500 mt-1">Reservations will appear here once customers make them</p>
            </div>
          )}
        </div>

        {/* Analytics Chart */}
        {analyticsData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h2>
            </div>
            <div className="h-80 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
              <Line 
                data={analyticsData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(75, 85, 99)'
                      }
                    },
                    tooltip: {
                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      titleColor: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
                      bodyColor: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
                      borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(203, 213, 225, 1)',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: isDarkMode ? 'rgba(75, 85, 99, 0.15)' : 'rgba(203, 213, 225, 0.5)',
                        tickBorderDash: [2, 4]
                      },
                      ticks: {
                        color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 
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
  const [reservations, setReservations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
  }, []);

  const checkAuth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        router.push('/admin/login');
        return;
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

      // Fetch reservations
      try {
        const reservationsResponse = await fetch('/api/admin/reservations', {
          headers
        });
        
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setReservations(reservationsData.reservations || []);
        } else {
          console.error('Failed to fetch reservations:', await reservationsResponse.text());
          // Use empty array if fetch fails
          setReservations([]);
        }
      } catch (reservationError) {
        console.error('Error fetching reservations:', reservationError);
        setReservations([]);
      }

      // Fetch menu items
      try {
        const menuResponse = await fetch('/api/admin/menu?organizeByCategory=true', {
          headers
        });
        
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          
          // Transform the categorized menu data into our expected format
          // If the response is already an object with category keys, use it directly
          if (typeof menuData === 'object' && !Array.isArray(menuData)) {
            setMenuItems(menuData);
          } else {
            // If it's an array, organize it by category
            const categorizedMenu = menuData.reduce((acc, item) => {
              const category = item.category.toLowerCase().replace(' ', '-');
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
            });
            
            setMenuItems(categorizedMenu);
          }
        } else {
          console.error('Failed to fetch menu items:', await menuResponse.text());
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
      <div className="space-y-6">
        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Database Connection</h2>
            <button
              onClick={checkDatabaseConnection}
              disabled={dbStatus.checking}
              className="px-3 py-1 bg-admin-primary text-white rounded-md hover:bg-admin-sidebar-active focus:outline-none focus:ring-2 focus:ring-admin-primary focus:ring-opacity-50 transition-colors duration-200"
            >
              {dbStatus.checking ? 'Checking...' : 'Check Connection'}
            </button>
          </div>
          
          {dbStatus.lastChecked && (
            <div className="text-sm mb-2 text-gray-500 dark:text-gray-400">
              Last checked: {new Date(dbStatus.lastChecked).toLocaleString()}
            </div>
          )}
          
          <div className={`p-3 rounded-md ${
            dbStatus.connected 
              ? 'bg-success-bg-light dark:bg-success-bg-dark text-success-light dark:text-success-light' 
              : dbStatus.error 
                ? 'bg-danger-bg-light dark:bg-danger-bg-dark text-danger-light dark:text-danger-light'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {dbStatus.connected 
              ? '✅ Connected to database successfully' 
              : dbStatus.error 
                ? `❌ Connection error: ${dbStatus.error}` 
                : 'Database connection status unknown'}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Reservations</h3>
            <p className="text-3xl font-bold text-admin-primary">{reservations.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Menu Items</h3>
            <p className="text-3xl font-bold text-admin-primary">
              {Object.values(menuItems).reduce((total, items) => total + items.length, 0)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Today&apos;s Reservations</h3>
            <p className="text-3xl font-bold text-admin-primary">
              {reservations.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Reservations</h3>
          
          {reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
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
                    <tr key={reservation._id}>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${reservation.status === 'confirmed' 
                            ? 'bg-success-bg-light dark:bg-success-bg-dark text-success-light dark:text-success-light' 
                            : reservation.status === 'pending' 
                              ? 'bg-warning-bg-light dark:bg-warning-bg-dark text-warning-light dark:text-warning-light'
                              : 'bg-danger-bg-light dark:bg-danger-bg-dark text-danger-light dark:text-danger-light'
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
            <p className="text-gray-500 dark:text-gray-400">No reservations found.</p>
          )}
        </div>

        {/* Analytics Chart */}
        {analyticsData && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Analytics</h3>
            <div className="h-64">
              <Line 
                data={analyticsData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgb(156, 163, 175)'
                      }
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        color: 'rgb(156, 163, 175)'
                      },
                      grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(156, 163, 175)'
                      },
                      grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
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
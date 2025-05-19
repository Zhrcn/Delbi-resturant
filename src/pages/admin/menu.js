import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTranslation } from 'react-i18next';

export default function AdminMenu() {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Form state for new/edit item
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    available: true
  });
  
  const [editItemId, setEditItemId] = useState(null);
  
  // Load menu items on page load
  useEffect(() => {
    fetchMenuItems();
  }, []);
  
  // Fetch menu items from the API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      const res = await fetch('/api/admin/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch menu items');
      }
      
      const data = await res.json();
      console.log('Fetched menu items:', data); // DEBUG: Log fetched items
      setMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const method = editItemId ? 'PUT' : 'POST';
      const url = '/api/admin/menu';
      const body = editItemId ? { id: editItemId, ...formData } : formData;
      
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        let errorMessage = 'Failed to save menu item';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      setMessage(editItemId ? 'Item updated successfully' : 'Item added successfully');
      resetForm();
      fetchMenuItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Deleting item with ID:', id); // Debug log
      
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      // Check if the ID is in correct format
      if (!id) {
        throw new Error('Invalid menu item ID');
      }
      
      // Additional debug logging
      console.log('Sending DELETE request with ID:', id);
      console.log('ID type:', typeof id);
      
      const res = await fetch('/api/admin/menu', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ id })
      });
      
      // Debug response
      console.log('DELETE response status:', res.status);
      
      if (!res.ok) {
        let errorMessage = 'Failed to delete menu item';
        try {
          const errorData = await res.json();
          console.log('Error data from server:', errorData); // Debug log for error details
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      setMessage('Item deleted successfully');
      fetchMenuItems();
    } catch (err) {
      console.error('Delete error:', err); // Debug: Log the full error
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Edit item
  const handleEditClick = (item) => {
    console.log('Edit item:', item); // Debug log
    setEditItemId(item._id);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      category: item.category,
      image: item.image || '',
      available: item.available !== false
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
      available: true
    });
    setEditItemId(null);
  };
  
  // Seed database with sample data
  const seedDatabase = async () => {
    if (!window.confirm('This will replace all existing menu items. Are you sure?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      const res = await fetch('/api/admin/seed-menu', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        let errorMessage = 'Failed to seed database';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setMessage(`Database seeded successfully with ${data.count} items`);
      fetchMenuItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout title="Menu Management">
      <div className="space-y-6">
        {/* Status Messages */}
        {message && (
          <div className="mb-6 p-4 bg-success-bg-light dark:bg-success-bg-dark border border-success-light dark:border-success-dark rounded-lg text-success-light dark:text-success-light">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-danger-bg-light dark:bg-danger-bg-dark border border-danger-light dark:border-danger-dark rounded-lg text-danger-light dark:text-danger-light">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (€)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. Starters, Main Courses, Desserts, Drinks"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      id="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Item is available
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    {editItemId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-primary hover:bg-admin-sidebar-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Saving...' : editItemId ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={seedDatabase}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Seed Database with Sample Data
                </button>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Menu Items</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No menu items found. Add your first item or seed the database.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menuItems.map((item) => (
                    <div key={item._id} className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                      {item.image && (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-48"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                              e.target.className = "object-contain w-full h-48 p-8";
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                          <span className="bg-admin-primary text-white text-sm px-2 py-1 rounded-full">€{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.available
                              ? 'bg-success-bg-light dark:bg-success-bg-dark text-success-light dark:text-success-light'
                              : 'bg-danger-bg-light dark:bg-danger-bg-dark text-danger-light dark:text-danger-light'
                          }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-sm text-admin-primary hover:text-admin-sidebar-active focus:outline-none"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                console.log('Delete button clicked for item:', item);
                                // Ensure we're passing a string ID
                                const stringId = item._id && item._id.toString ? item._id.toString() : item._id;
                                handleDelete(stringId);
                              }}
                              className="text-sm text-danger-light hover:text-danger-dark focus:outline-none"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 
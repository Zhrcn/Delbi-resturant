import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    restaurantName: 'Delbi Restaurant',
    address: '',
    phone: '',
    email: '',
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false },
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          // If API fails, we'll just use the default settings
          console.error('Failed to fetch settings:', await response.text());
          return;
        }
        
        const data = await response.json();
        
        // Only update settings if we have data from the API
        if (data && Object.keys(data).length > 0) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects with dot notation in name
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: field === 'closed' ? !prev.openingHours[day].closed : value
        }
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
      
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <AdminLayout title="Restaurant Settings">
      <div className="space-y-6">
        {message && (
          <div className="p-4 bg-success-bg-light dark:bg-success-bg-dark border border-success-light dark:border-success-dark rounded-lg text-success-light dark:text-success-light">
            {message}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-danger-bg-light dark:bg-danger-bg-dark border border-danger-light dark:border-danger-dark rounded-lg text-danger-light dark:text-danger-light">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Basic Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      name="restaurantName"
                      id="restaurantName"
                      value={settings.restaurantName}
                      onChange={handleChange}
                      className="mt-1 focus:ring-admin-primary focus:border-admin-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={settings.address}
                      onChange={handleChange}
                      className="mt-1 focus:ring-admin-primary focus:border-admin-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={settings.phone}
                      onChange={handleChange}
                      className="mt-1 focus:ring-admin-primary focus:border-admin-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={settings.email}
                      onChange={handleChange}
                      className="mt-1 focus:ring-admin-primary focus:border-admin-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Opening Hours Card */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Opening Hours
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 sm:col-span-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {day}
                        </span>
                      </div>
                      
                      <div className="col-span-9 sm:col-span-10 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5 sm:col-span-3 flex items-center">
                          <input
                            type="checkbox"
                            id={`${day}-closed`}
                            checked={settings.openingHours[day].closed}
                            onChange={() => handleHoursChange(day, 'closed')}
                            className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-gray-300 rounded"
                          />
                          <label htmlFor={`${day}-closed`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Closed
                          </label>
                        </div>
                        
                        <div className="col-span-7 sm:col-span-9 grid grid-cols-12 sm:grid-cols-8 gap-2 items-center">
                          {!settings.openingHours[day].closed && (
                            <>
                              <div className="col-span-5 sm:col-span-3">
                                <input
                                  type="time"
                                  value={settings.openingHours[day].open}
                                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                  className="mt-0 block w-full py-1.5 px-2 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              <div className="col-span-2 sm:col-span-2 text-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
                              </div>
                              <div className="col-span-5 sm:col-span-3">
                                <input
                                  type="time"
                                  value={settings.openingHours[day].close}
                                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                  className="mt-0 block w-full py-1.5 px-2 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Social Media Card */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Social Media
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Facebook
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                        facebook.com/
                      </span>
                      <input
                        type="text"
                        name="socialMedia.facebook"
                        id="facebook"
                        value={settings.socialMedia.facebook}
                        onChange={handleChange}
                        className="focus:ring-admin-primary focus:border-admin-primary flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instagram
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                        instagram.com/
                      </span>
                      <input
                        type="text"
                        name="socialMedia.instagram"
                        id="instagram"
                        value={settings.socialMedia.instagram}
                        onChange={handleChange}
                        className="focus:ring-admin-primary focus:border-admin-primary flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Twitter
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                        twitter.com/
                      </span>
                      <input
                        type="text"
                        name="socialMedia.twitter"
                        id="twitter"
                        value={settings.socialMedia.twitter}
                        onChange={handleChange}
                        className="focus:ring-admin-primary focus:border-admin-primary flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-admin-primary hover:bg-admin-sidebar-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
} 
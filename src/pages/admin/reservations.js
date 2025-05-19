import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [currentPage, statusFilter, dateFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      let url = `/api/admin/reservations?page=${currentPage}`;
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data.reservations || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      setLoading(true);
      console.log('Updating reservation status:', { reservationId, newStatus }); // Debug log
      
      // Ensure we're passing a string ID
      const stringId = reservationId && reservationId.toString ? reservationId.toString() : reservationId;
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: stringId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update reservation status');
      }

      // Refresh reservations after status update
      fetchReservations();
    } catch (err) {
      console.error('Error updating reservation status:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Reservation Management">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-danger-bg-light dark:bg-danger-bg-dark border border-danger-light dark:border-danger-dark rounded-lg text-danger-light dark:text-danger-light">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-admin-primary focus:ring focus:ring-admin-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-admin-primary"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Reservations Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Reservations
            </h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No reservations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email / Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reservations.map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{reservation.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(reservation.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{reservation.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {reservation.guests} {reservation.guests === 1 ? 'person' : 'people'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{reservation.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{reservation.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${reservation.status === 'confirmed' 
                            ? 'bg-success-bg-light dark:bg-success-bg-dark text-success-light dark:text-success-light' 
                            : reservation.status === 'pending' 
                              ? 'bg-warning-bg-light dark:bg-warning-bg-dark text-warning-light dark:text-warning-light'
                              : reservation.status === 'completed'
                                ? 'bg-info-bg-light dark:bg-info-bg-dark text-info-light dark:text-info-light'
                                : 'bg-danger-bg-light dark:bg-danger-bg-dark text-danger-light dark:text-danger-light'
                          }`}>
                          {reservation.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {reservation.status !== 'confirmed' && (
                            <button
                              onClick={() => {
                                console.log('Confirming reservation:', reservation);
                                const stringId = reservation._id && reservation._id.toString ? reservation._id.toString() : reservation._id;
                                handleUpdateStatus(stringId, 'confirmed');
                              }}
                              className="text-success-light hover:text-success-dark"
                            >
                              Confirm
                            </button>
                          )}
                          
                          {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                const stringId = reservation._id && reservation._id.toString ? reservation._id.toString() : reservation._id;
                                handleUpdateStatus(stringId, 'completed');
                              }}
                              className="text-info-light hover:text-info-dark"
                            >
                              Complete
                            </button>
                          )}
                          
                          {reservation.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                const stringId = reservation._id && reservation._id.toString ? reservation._id.toString() : reservation._id;
                                handleUpdateStatus(stringId, 'cancelled');
                              }}
                              className="text-danger-light hover:text-danger-dark"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                    currentPage === 1 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        currentPage === 1 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">First</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        currentPage === 1 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Current Page Display */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {currentPage}
                    </span>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Last</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 